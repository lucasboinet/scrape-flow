import { AppNode, AppNodeMissingInputs } from "@/types/app-nodes";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflows";
import { Edge, getIncomers } from "@xyflow/react";
import { TaskRegistry } from "./task/Registry";

export enum WorkflowToExecutionPlanError {
  "NO_ENTRYPOINT",
  "INVALID_INPUTS"
}

type WorkflowToExecutionPlanType = {
  executionPlan?: WorkflowExecutionPlan;
  error?: {
    type: WorkflowToExecutionPlanError;
    invalidElements?: AppNodeMissingInputs[];
  }
}

export function WorkflowToExecutionPlan(nodes: AppNode[], edges: Edge[]): WorkflowToExecutionPlanType {
  const entryPoint = nodes.find((node) => TaskRegistry[node.data.type].isEntryPoint);

  if (!entryPoint) {
    return {
      error: {
        type: WorkflowToExecutionPlanError.NO_ENTRYPOINT
      }
    }
  }

  const inputsWithErrors: AppNodeMissingInputs[] = [];
  const planned = new Set<string>();

  const invalidInputs = getInvalidInputs(entryPoint, edges, planned);

  if (invalidInputs.length > 0) {
    inputsWithErrors.push({
      nodeId: entryPoint.id,
      inputs: invalidInputs.map((i) => i.name)
    });
  }

  const executionPlan: WorkflowExecutionPlan = [
    { phase: 1, nodes: [entryPoint] }
  ];

  planned.add(entryPoint.id);

  for (let phase = 2; phase <= nodes.length && planned.size < nodes.length; phase++) {
    const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };
    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) continue;

      const invalidInputs = getInvalidInputs(currentNode, edges, planned);

      if (invalidInputs.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);
        if (incomers.every(incomer => planned.has(incomer.id))) {
          console.error('invalid inputs', currentNode.id, invalidInputs);
          inputsWithErrors.push({
            nodeId: currentNode.id,
            inputs: invalidInputs.map((i) => i.name)
          });
        }
        continue;
      }

      nextPhase.nodes.push(currentNode);
      planned.add(currentNode.id);
    }
    // for (const node of nextPhase.nodes) {
    //   planned.add(node.id);
    // }
    executionPlan.push(nextPhase);
  }

  if (inputsWithErrors.length > 0) {
    return {
      error: {
        type: WorkflowToExecutionPlanError.INVALID_INPUTS,
        invalidElements: inputsWithErrors,
      }
    }
  }

  return { executionPlan };
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
  const invalidInputs = [];
  const inputs = TaskRegistry[node.data.type].inputs;
  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = inputValue && inputValue.length > 0;
    if (inputValueProvided) {
      continue;
    }

    const incomingEdges = edges.filter((edge) => edge.target === node.id);
    const inputLinkedToOuput = incomingEdges.find((edge) => edge.targetHandle === input.name);

    const requiredInputProvidedByOutput = input.required && inputLinkedToOuput && planned.has(inputLinkedToOuput.source);
    if (requiredInputProvidedByOutput) {
      continue;
    }

    if (!input.required && !inputLinkedToOuput) {
      continue;
    }

    if (!input.required && inputLinkedToOuput && planned.has(inputLinkedToOuput.source)) {
      continue;
    }

    invalidInputs.push(input);
  }

  return invalidInputs;
}