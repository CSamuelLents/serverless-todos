import * as winston from 'winston';

/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param name - a name of a logger that will be added to all messages
 */
export function createLogger(name: string) {
  return winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { name },
    transports: [new winston.transports.Console()]
  });
}
