import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/tasks";
import { Handle, Position, useEdges } from "@xyflow/react";
import { ReactNode } from "react";
import NodeParamField from "./NodeParamField";
import { ColorForHandle } from "./common";
import useWorkflowValidation from "@/components/hooks/useWorkflowValidation";

export function NodeInputs({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col divide-y-2 gap-2">
      {children}
    </div>
  )
}

export function NodeInput({ input, nodeId }: { input: TaskParam, nodeId: string }) {
  const { invalidInputs } = useWorkflowValidation();
  const hasErrors = invalidInputs
    .find(node => node.nodeId === nodeId)
    ?.inputs.find(invalidInputName => invalidInputName === input.name);

  const edges = useEdges();

  const isConnected = edges.some(edge => edge.target === nodeId && edge.targetHandle === input.name);

  return (
    <div  className={cn(
      "flex justify-start relative p-3 bg-secondary w-full",
      hasErrors && "bg-destructive/30"
    )}>
      <NodeParamField param={input} nodeId={nodeId} disabled={isConnected} />
      {!input.hideHandle && (
        <Handle 
          id={input.name}
          isConnectable={!isConnected}
          type="target"
          position={Position.Left}
          className={cn(
            "!bg-muted-foreground !border-2 !border-background !-left-0 !size-4",
            ColorForHandle[input.type],
          )}
        />
      )}
    </div>
  )
}