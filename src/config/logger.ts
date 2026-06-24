import pino, { type LoggerOptions } from 'pino';
import { env } from './env';

const isDev = env.NODE_ENV === 'development';

const options: LoggerOptions = {
  level: isDev ? 'debug' : 'info',
  // Drop pid + hostname so each line starts with our own fields.
  base: undefined,
  // Emit the timestamp as a human-readable ISO string under `date`
  // (instead of pino's default epoch-ms `time`) so it reads first.
  timestamp: () => `,"date":"${new Date().toISOString()}"`,
};

if (isDev) {
  // Development: human-readable, single line, timestamp first → level → message.
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      timestampKey: 'date',
      translateTime: false,
      ignore: 'pid,hostname',
    },
  };
} else {
  // Production: structured JSON. Render the level as its label, not the number.
  options.formatters = {
    level: (label) => ({ level: label }),
  };
}

export const logger = pino(options);
