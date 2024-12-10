import { ExecutionEnvironment } from '@/types/executor';
import { PageToHtmlTask } from '../task/PageToHtml';

export async function PageToHtmlExecutor(environment: ExecutionEnvironment<typeof PageToHtmlTask>): Promise<boolean> {
  try {
    const html = await environment.getPage()!.content();

    environment.setOuput('HTML', html);

    return true;
  } catch (err: any) {
    environment.log.error(err.message)
    return false;
  }
}