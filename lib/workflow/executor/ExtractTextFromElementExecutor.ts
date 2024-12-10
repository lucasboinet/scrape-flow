import { ExecutionEnvironment } from '@/types/executor';
import { ExtractTextFromElement } from '../task/ExtractTextFromElement';
import * as cheerio from 'cheerio';

export async function ExtractTextFromElementExecutor(environment: ExecutionEnvironment<typeof ExtractTextFromElement>): Promise<boolean> {
  try {
    const selector = environment.getInput('Selector');

    if (!selector) {
      environment.log.error("Selector is not provided");
      return false;
    }

    const html = environment.getInput('HTML');

    if (!html) {
      environment.log.error("Html is not defined");
      return false;
    }

    const $ = cheerio.load(html);

    const element = $(selector);

    if (element.length === 0) {
      environment.log.error("Element not found on the page");
      return false;
    }

    const extractedText = $.text(element) || element.val() as string;

    environment.setOuput('Text', extractedText)

    return true;
  } catch (err: any) {
    environment.log.error(err.message)
    return false;
  }
}