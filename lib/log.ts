import { Log, LogCollector } from "@/types/log";

export function createLogCollector(): LogCollector {
  const logs: Log[] = [];

  return {
    getAll: () => logs,
    info: (message: string) => logs.push({ message, level: 'info', timestamp: new Date() }),
    error: (message: string) => logs.push({ message, level: 'error', timestamp: new Date() }),
  }
}