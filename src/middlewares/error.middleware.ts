import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Express identifies error handlers by their arity (4 args), so `_next` must stay.
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  // Resolve the outgoing status + body from the error type (single source of truth).
  let statusCode = 500;
  let body: Record<string, unknown> = { error: 'Internal server error' };

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    body = { error: err.message };
  } else if (err instanceof ZodError) {
    statusCode = 400;
    body = {
      status: 'Bad Request',
      errors: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
  } else if (typeof err === 'object' && err !== null && 'code' in err && err.code === 11000) {
    // Mongo duplicate key (e.g. unique email)
    statusCode = 409;
    body = { error: 'A resource with that value already exists' };
  }

  // Log with as much request context as we can. pino's default `err` serializer
  // captures the error type, message and stack, so we see exactly where it was
  // thrown. 5xx = error (our fault), 4xx = warn (client error).
  const context = {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id,
    username: req.user?.email,
    status: statusCode,
    requestId: req.requestId,
    params: req.params,
    query: req.query,
    err,
  };

  if (statusCode >= 500) {
    logger.error(context, 'request errored');
  } else {
    logger.warn(context, 'request failed');
  }

  return res.status(statusCode).json(body);
};
