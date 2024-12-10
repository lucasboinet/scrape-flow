import { TaskParamType, TaskType } from "@/types/tasks";
import { WorkflowTask } from "@/types/workflows";
import { CodeIcon, LucideProps } from "lucide-react";

export const PageToHtmlTask = {
  type: TaskType.PAGE_TO_HTML,
  label: "Get HTML from page",
  icon: (props: LucideProps) => (
    <CodeIcon className="stroke-rose-400" {...props} />
  ),
  isEntryPoint: false,
  credits: 3,
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      helperText: 'eg: https://www.google.com',
    }
  ] as const,
  outputs: [
    {
      name: 'HTML',
      type: TaskParamType.STRING
    },
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE
    }
  ] as const
} satisfies WorkflowTask