import { transports, createLogger, format } from 'winston';

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.json(),
    }),
  ],
});
