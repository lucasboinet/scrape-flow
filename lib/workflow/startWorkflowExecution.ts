import 'server-only';
import prisma from '../primsa';
import { revalidatePath } from 'next/cache';
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from '@/types/workflows';
import { ExecutionPhase } from '@prisma/client';
import { AppNode } from '@/types/app-nodes';
import { TaskRegistry } from './task/Registry';
import { ExecutorRegistry } from './executor/registry';
import { Environment, ExecutionEnvironment } from '@/types/executor';
import { TaskParamType } from '@/types/tasks';
import { Browser, Page } from 'puppeteer';
import { Edge } from '@xyflow/react';
import { LogCollector } from '../../types/log';
import { createLogCollector } from '../log';

export async function StartWorkflowExecution(executionId: string, userId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: { workflow: true, phases: true }
  })

  if (!execution) {
    throw new Error("Execution not found");
  }

  const edges = JSON.parse(execution.definition).edges as Edge[];
  const environment: Environment = { phases: {} };

  await initializeWorkflowExecution(executionId, execution.workflowId);

  await initializePhaseStatuses(execution);

  let creditsConsumed = 0;
  let executionFailed = false;

  for (const phase of execution.phases) {
    const phaseExecution = await executeWorkflowPhase(phase, environment, edges, userId);

    creditsConsumed += phaseExecution.creditsConsumed;

    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }
  }

  await finalizeWorkflowExecution(executionId, execution.workflowId, executionFailed, creditsConsumed);

  await cleanupEnvironment(environment);

  revalidatePath('/workflow/runs')
}

async function initializeWorkflowExecution(executionId: string, workflowId: string) {
  await prisma.workflowExecution.update({
    where: {
      id: executionId,
    },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    }
  })

  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      lastRunAt: new Date(),
      lastRunId: executionId,
      lastRunStatus: WorkflowExecutionStatus.RUNNING
    }
  })
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed ? WorkflowExecutionStatus.FAILED : WorkflowExecutionStatus.COMPLETED;

  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed,
    }
  })

  await prisma.workflow.update({
    where: {
      id: workflowId,
      lastRunId: executionId,
    },
    data: {
      lastRunStatus: finalStatus
    }
  }).catch(() => { });
}

async function initializePhaseStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    }
  })
}

async function executeWorkflowPhase(
  phase: ExecutionPhase,
  environment: Environment,
  edges: Edge[],
  userId: string
) {
  const startedAt = new Date();
  const node = JSON.parse(phase.node) as AppNode;
  const logCollector: LogCollector = createLogCollector();

  setupEnvironmentForPhase(node, environment, edges);

  await prisma.executionPhase.update({
    where: {
      id: phase.id,
    },
    data: {
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(environment.phases[node.id].inputs)
    }
  });

  const creditsRequired = TaskRegistry[node.data.type].credits;

  let success = await decrementCredits(userId, creditsRequired, logCollector);

  const creditsConsumed = success ? creditsRequired : 0;

  if (success) {
    success = await executePhase(phase, node, environment, logCollector);
  }

  const outputs = environment.phases[node.id].outputs;
  await finalizePhase(phase.id, success, outputs, logCollector, creditsConsumed);

  return { success, creditsConsumed }
}

async function finalizePhase(phaseId: string, success: boolean, outputs: any, logCollector: LogCollector, creditsConsumed: number) {
  const finalStatus = success ? ExecutionPhaseStatus.COMPLETED : ExecutionPhaseStatus.FAILED;
  console.log("@@LOGS", JSON.stringify(logCollector.getAll()));
  await prisma.executionPhase.update({
    where: {
      id: phaseId,
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      outputs: JSON.stringify(outputs),
      creditsConsumed,
      logs: {
        createMany: {
          data: logCollector.getAll().map((log) => ({
            message: log.message,
            timestamp: log.timestamp,
            logLevel: log.level,
          }))
        }
      }
    }
  })
}

async function executePhase(phase: ExecutionPhase, node: AppNode, environment: Environment, logCollector: LogCollector): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type];

  if (!runFn) return false;

  const executionEnvironment: ExecutionEnvironment<any> = createExecutionEnvironment(node, environment, logCollector);

  return await runFn(executionEnvironment);
}

function setupEnvironmentForPhase(node: AppNode, environment: Environment, edges: Edge[]) {
  environment.phases[node.id] = { inputs: {}, outputs: {} };
  const inputs = TaskRegistry[node.data.type].inputs;

  for (const input of inputs) {
    const value = node.data.inputs[input.name];
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue;

    if (value) {
      environment.phases[node.id].inputs[input.name] = value;
      continue;
    }

    const connectedEdge = edges.find((edge) => edge.target === node.id && edge.targetHandle === input.name);

    if (!connectedEdge) {
      console.error("Missing edge for input : ", input.name, "node id : ", node.id)
      continue;
    }

    const outputValue = environment.phases[connectedEdge.source].outputs[connectedEdge.sourceHandle!];

    environment.phases[node.id].inputs[input.name] = outputValue;
  }
}

function createExecutionEnvironment(node: AppNode, environment: Environment, LogCollector: LogCollector): ExecutionEnvironment<any> {
  return {
    getInput: (name: string) => environment.phases[node.id]?.inputs[name],
    setOuput: (name: string, value: string) => environment.phases[node.id].outputs[name] = value,

    getBrowser: () => environment.browser,
    setBrowser: (browser: Browser) => (environment.browser = browser),

    getPage: () => environment.page,
    setPage: (page: Page) => (environment.page = page),

    log: LogCollector
  }
}

async function cleanupEnvironment(environment: Environment) {
  if (environment.browser) {
    await environment.browser.close().catch((err) => console.error("Cannot close the browser, reason:", err));
  }
}

async function decrementCredits(userId: string, amount: number, logCollector: LogCollector) {
  try {
    await prisma.userBalance.update({
      where: {
        userId,
        credits: { gte: amount }
      },
      data: {
        credits: { decrement: amount }
      }
    })

    return true;
  } catch {
    logCollector.error("Insufficient balance");
    return false;
  }
}