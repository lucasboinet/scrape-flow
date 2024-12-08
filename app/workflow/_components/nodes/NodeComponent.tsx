import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import NodeCard from "./NodeCard";
import NodeHeader from "./NodeHeader";
import { AppNodeData } from "@/types/app-nodes";
import { TaskType } from "@/types/tasks";
import { TaskRegistry } from "@/lib/workflow/task/Registry";
import { NodeInput, NodeInputs } from "./NodeInputs";
import { NodeOutput, NodeOutputs } from "./NodeOutputs";

const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData;
  const task = TaskRegistry[nodeData.type];

  return (
    <NodeCard nodeId={props.id} isSelected={!!props.selected}>
      <NodeHeader taskType={nodeData.type as TaskType} nodeId={props.id} />
      <NodeInputs>
        {task.inputs.map((input, index) => (
          <NodeInput 
            key={index} 
            input={input} 
            nodeId={props.id} 
          />
        ))}
      </NodeInputs>
      <NodeOutputs>
        {task.outputs.map((output, index) => (
          <NodeOutput 
            key={index} 
            output={output} 
          />
        ))}
      </NodeOutputs>
    </NodeCard>
  )
})

NodeComponent.displayName = "NodeComponent";

export default NodeComponent;