import { AppNode } from "@/types/app-nodes";
import { TaskType } from "@/types/tasks";

export function createFlowNode(
  nodeType: TaskType,
  position?: { x: number; y: number },
): AppNode {
  return {
    id: crypto.randomUUID(),
    type: 'FlowScrapeNode',
    dragHandle: '.drag-handle',
    data: {
      type: nodeType,
      inputs: {},
    },
    position: position ?? { x: 0, y: 0 }
  }
}