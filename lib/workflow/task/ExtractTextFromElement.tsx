import { TaskParamType, TaskType } from "@/types/tasks";
import { WorkflowTask } from "@/types/workflows";
import { LucideProps, TextIcon } from "lucide-react";

export const ExtractTextFromElement = {
  type: TaskType.EXTRACT_TEXT_FROM_ELEMENT,
  label: "Get text from element",
  icon: (props: LucideProps) => (
    <TextIcon className="stroke-rose-400" {...props} />
  ),
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: "HTML",
      type: TaskParamType.STRING,
      required: true,
      variant: 'textarea'
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      required: true,
    }
  ] as const,
  outputs: [
    {
      name: 'Text',
      type: TaskParamType.STRING
    },
  ] as const
} satisfies WorkflowTask