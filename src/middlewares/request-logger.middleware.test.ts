import { describe, it, mock, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { NextFunction, Request, Response } from 'express';
import { requestLogger } from './request-logger.middleware';
import { logger } from '../config/logger';
import { createMockRequest } from '../test-utils/mocks';

// A Response double that is a real EventEmitter so we can fire the 'finish'
// event the middleware listens on, plus a settable statusCode.
const createEmitterResponse = (statusCode = 200) => {
  const emitter = new EventEmitter();
  const res = emitter as unknown as Response;
  res.statusCode = statusCode;
  return { res, emitter };
};

afterEach(() => mock.restoreAll());

describe('requestLogger middleware', () => {
  it('assigns a requestId and calls next()', () => {
    mock.method(logger, 'info', () => undefined);
    const req = createMockRequest<Request>({ method: 'GET', originalUrl: '/api/experiences' });
    const { res } = createEmitterResponse();
    const next = mock.fn();

    requestLogger(req, res, next as unknown as NextFunction);

    assert.ok(req.requestId);
    assert.equal(next.mock.calls.length, 1);
  });

  it('logs "request start" on entry', () => {
    const info = mock.method(logger, 'info', () => undefined);
    const req = createMockRequest<Request>({ method: 'POST', originalUrl: '/api/uploads' });
    const { res } = createEmitterResponse();

    requestLogger(req, res, (() => undefined) as unknown as NextFunction);

    assert.equal(info.mock.calls.length, 1);
    assert.equal(info.mock.calls[0].arguments[1], 'request start');
  });

  it('logs "request complete" with status and ms when the response finishes', () => {
    const info = mock.method(logger, 'info', () => undefined);
    const req = createMockRequest<Request>({ method: 'GET', originalUrl: '/api/experiences/1' });
    const { res, emitter } = createEmitterResponse(404);

    requestLogger(req, res, (() => undefined) as unknown as NextFunction);
    emitter.emit('finish');

    assert.equal(info.mock.calls.length, 2);
    const [payload, message] = info.mock.calls[1].arguments as [
      { status: number; ms: number; requestId: string },
      string,
    ];
    assert.equal(message, 'request complete');
    assert.equal(payload.status, 404);
    assert.equal(typeof payload.ms, 'number');
    assert.equal(payload.requestId, req.requestId);
  });
});
