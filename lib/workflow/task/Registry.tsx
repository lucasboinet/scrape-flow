import { TaskType } from "@/types/tasks";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { ExtractTextFromElement } from "./ExtractTextFromElement";
import { WorkflowTask } from "@/types/workflows";

type Registry = {
  [K in TaskType]: WorkflowTask & { type: K };
}

export const TaskRegistry: Registry = {
  LAUNCH_BROWSER: LaunchBrowserTask,
  PAGE_TO_HTML: PageToHtmlTask,
  EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElement,
}