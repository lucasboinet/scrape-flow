'use server';

import prisma from "@/lib/primsa";
import { WorkflowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { StartWorkflowExecution } from "@/lib/workflow/startWorkflowExecution";
import { TaskRegistry } from "@/lib/workflow/task/Registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger } from "@/types/workflows";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function ExecuteWorkflow(form: { workflowId: string, flowDefinition?: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UnAuthenticated');
  }

  const { workflowId, flowDefinition } = form;

  if (!workflowId) {
    throw new Error("workflowId is required");
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      userId,
      id: workflowId,
    }
  });

  if (!workflow) throw new Error('Workflow not found');

  if (!flowDefinition) {
    throw new Error("Workflow definition is not defined");
  }

  const flow = JSON.parse(flowDefinition);
  const result = WorkflowToExecutionPlan(flow.nodes, flow.edges);

  if (result.error) {
    throw new Error("Workflow definition is invalid");
  }

  if (!result.executionPlan) {
    throw new Error("No execution plan generated");
  }

  const executionPlan: WorkflowExecutionPlan = result.executionPlan;

  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId,
      status: WorkflowExecutionStatus.PENDING,
      startedAt: new Date(),
      trigger: WorkflowExecutionTrigger.MANUAL,
      definition: flowDefinition,
      phases: {
        create: executionPlan.flatMap(phase => {
          return phase.nodes.flatMap(node => {
            return {
              userId,
              status: ExecutionPhaseStatus.CREATED,
              number: phase.phase,
              node: JSON.stringify(node),
              name: TaskRegistry[node.data.type].label,
            }
          })
        })
      }
    },
    select: {
      id: true,
      phases: true
    }
  });

  if (!execution) {
    throw new Error("Workflow execution not created");
  }

  StartWorkflowExecution(execution.id);

  redirect(`/workflow/runs/${workflowId}/${execution.id}`);
}