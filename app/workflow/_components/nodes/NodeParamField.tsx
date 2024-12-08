'use client'

import { TaskParam, TaskParamType } from "@/types/tasks"
import StringParamField from "./param/StringParamField"
import { useReactFlow } from "@xyflow/react"
import { AppNode } from "@/types/app-nodes";
import { useCallback } from "react";
import BrowserInstanceParamField from "./param/BrowserInstanceParamField";

function NodeParamField({ param, nodeId, disabled }: { param: TaskParam, nodeId: string, disabled?: boolean }) {
  const { updateNodeData, getNode } = useReactFlow();

  const node = getNode(nodeId) as AppNode;
  const value = node?.data.inputs[param.name] || '';

  const updateNodeParam = useCallback((newValue: string) => {
    updateNodeData(nodeId, {
      inputs: {
        ...node?.data.inputs,
        [param.name]: newValue,
      }
    })
  }, [nodeId, updateNodeData, param.name, node?.data.inputs])

  switch(param.type) {
    case TaskParamType.BROWSER_INSTANCE:
      return (
        <BrowserInstanceParamField 
          param={param}
          value={""}
          updateValue={updateNodeParam}
        />
      )

    case TaskParamType.STRING:
      return (
        <StringParamField 
          param={param}
          value={value}
          updateValue={updateNodeParam}
          disabled={disabled}
        />
      )

    default:
      return (
        <div className="w-full">
          <p className="text-xs text-muted-foreground">Not implemented</p>
        </div>
      )
  }
}

export default NodeParamField