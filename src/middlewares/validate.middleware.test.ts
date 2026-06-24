import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction } from 'express';
import { z } from 'zod';
import { validate } from './validate.middleware';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

const schema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

describe('validate middleware', () => {
  it('calls next() with no error when the payload is valid', async () => {
    const req = createMockRequest({
      body: { email: 'a@b.com', password: 'secret123' },
      query: {},
      params: {},
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    await validate(schema)(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], undefined);
  });

  it('responds 400 with a list of issues when the payload is invalid', async () => {
    const req = createMockRequest({
      body: { email: 'not-an-email' },
      query: {},
      params: {},
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    await validate(schema)(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 400);
    assert.equal(next.mock.calls.length, 0);

    const body = recorded.body as { status: string; errors: { path: string; message: string }[] };
    assert.equal(body.status, 'Bad Request');
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.length >= 1);
    assert.ok(body.errors.every((e) => typeof e.path === 'string' && typeof e.message === 'string'));
  });
});
