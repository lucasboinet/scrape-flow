import { TaskParamType, TaskType } from "@/types/tasks";
import { WorkflowTask } from "@/types/workflows";
import { BotMessageSquareIcon, LucideProps } from "lucide-react";

export const AskAiTask = {
  type: TaskType.ASK_AI,
  label: "Ask AI",
  icon: (props: LucideProps) => (
    <BotMessageSquareIcon className="stroke-pink-400" {...props} />
  ),
  isEntryPoint: false,
  inputs: [
    {
      name: "Text",
      type: TaskParamType.STRING,
      required: true,
      variant: 'textarea'
    },
    {
      name: "Instructions",
      type: TaskParamType.STRING,
      helperText: 'eg: Analyze this website to give me key services',
      required: true,
      hideHandle: true,
    }
  ] as const,
  outputs: [
    {
      name: 'AI Analyzed Web page',
      type: TaskParamType.STRING
    }
  ] as const,
  credits: 20
} satisfies WorkflowTask