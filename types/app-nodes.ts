import { Node } from "@xyflow/react";
import { TaskType } from "./tasks";

export interface AppNodeData {
  type: TaskType;
  inputs: Record<string, string>;
  [key: string]: unknown;
}

export interface AppNode extends Node {
  data: AppNodeData;
}