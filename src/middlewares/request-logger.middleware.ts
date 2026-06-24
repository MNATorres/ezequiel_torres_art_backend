import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../config/logger';

// Logs a "request start" line on entry and a "request complete" line once the
// response is flushed. Field order is intentional: date + level are emitted by
// pino, then method, endpoint, userId, username (and ms, status on complete).
// `requestId` correlates the start, complete and any error lines.
//
// Note: this runs at the app level, before per-route `authenticate`, so
// userId/username are usually absent on "request start" and present on
// "request complete" (pino omits undefined fields).
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = randomUUID();
  const start = process.hrtime.bigint();

  logger.info(
    {
      method: req.method,
      endpoint: req.originalUrl,
      userId: req.user?.id,
      username: req.user?.email,
      requestId: req.requestId,
    },
    'request start'
  );

  res.on('finish', () => {
    const ms = Math.round((Number(process.hrtime.bigint() - start) / 1e6) * 100) / 100;
    logger.info(
      {
        method: req.method,
        endpoint: req.originalUrl,
        userId: req.user?.id,
        username: req.user?.email,
        ms,
        status: res.statusCode,
        requestId: req.requestId,
      },
      'request complete'
    );
  });

  next();
};
