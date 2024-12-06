import { TaskType } from "@/types/tasks";
import { LaunchBrowserTask } from "./LaunchBrowser";

export const TaskRegistry = {
  [TaskType.LAUNCH_BROWSER]: LaunchBrowserTask,
}