import { intervalToDuration } from "date-fns";

export function DatesToDuration(end: Date | null | undefined, start: Date | null | undefined) {
  if (!start || !end) return null;

  const timeElapsed = end.getTime() - start.getTime();

  if (timeElapsed < 1000) {
    return `${timeElapsed}ms`
  }

  const { minutes, seconds } = intervalToDuration({ start: 0, end: timeElapsed });

  return `${minutes || 0}m ${seconds || 0}s`;
}