import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler, notFound } from './error.middleware';
import { AppError } from '../utils/AppError';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

const noop = mock.fn() as unknown as NextFunction;

describe('notFound handler', () => {
  it('responds 404 with the attempted route', () => {
    const req = createMockRequest({ method: 'GET', originalUrl: '/api/nope' });
    const { res, recorded } = createMockResponse();

    notFound(req, res);

    assert.equal(recorded.statusCode, 404);
    const body = recorded.body as { error: string };
    assert.match(body.error, /GET \/api\/nope/);
  });
});

describe('errorHandler', () => {
  it('maps an AppError to its status code and message', () => {
    const { res, recorded } = createMockResponse();

    errorHandler(new AppError(404, 'User not found'), createMockRequest(), res, noop);

    assert.equal(recorded.statusCode, 404);
    assert.deepEqual(recorded.body, { error: 'User not found' });
  });

  it('maps a ZodError to a 400 with the issue list', () => {
    const result = z.object({ name: z.string() }).safeParse({ name: 123 });
    if (result.success) throw new Error('expected the parse to fail');

    const { res, recorded } = createMockResponse();
    errorHandler(result.error, createMockRequest(), res, noop);

    assert.equal(recorded.statusCode, 400);
    const body = recorded.body as { status: string; errors: unknown[] };
    assert.equal(body.status, 'Bad Request');
    assert.ok(Array.isArray(body.errors));
  });

  it('maps a Mongo duplicate-key error to 409', () => {
    const { res, recorded } = createMockResponse();

    errorHandler({ code: 11000 }, createMockRequest(), res, noop);

    assert.equal(recorded.statusCode, 409);
  });

  it('falls back to 500 for unknown errors', (t) => {
    t.mock.method(console, 'error', () => {});
    const { res, recorded } = createMockResponse();

    errorHandler(new Error('something broke'), createMockRequest(), res, noop);

    assert.equal(recorded.statusCode, 500);
    assert.deepEqual(recorded.body, { error: 'Internal server error' });
  });
});
