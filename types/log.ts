export type LogLevel = 'info' | 'error';

export type Log = {
  message: string;
  level: LogLevel;
  timestamp: Date;
}

export type LogFunction = (message: string) => void;

export type LogCollector = {
  getAll(): Log[];
} & {
  [K in LogLevel]: LogFunction
}