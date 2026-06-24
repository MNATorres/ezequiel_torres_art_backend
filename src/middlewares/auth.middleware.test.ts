import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from './auth.middleware';
import { UserRole } from '../models/user.model';
import { env } from '../config/env';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

describe('authenticate middleware', () => {
  it('rejects with 401 when no Authorization header is present', () => {
    const req = createMockRequest({ headers: {} });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    authenticate(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 401);
    assert.equal(next.mock.calls.length, 0);
  });

  it('rejects with 401 when the header does not use the Bearer scheme', () => {
    const req = createMockRequest({ headers: { authorization: 'Basic abc' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    authenticate(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 401);
    assert.equal(next.mock.calls.length, 0);
  });

  it('rejects with 401 when the token is invalid', () => {
    const req = createMockRequest({ headers: { authorization: 'Bearer not-a-real-token' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    authenticate(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 401);
    assert.equal(next.mock.calls.length, 0);
  });

  it('attaches the decoded user and calls next() for a valid token', () => {
    const token = jwt.sign({ id: 'user-123', role: UserRole.ADMIN }, env.JWT_SECRET);
    const req = createMockRequest({ headers: { authorization: `Bearer ${token}` } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    authenticate(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.deepEqual(req.user, { id: 'user-123', role: UserRole.ADMIN });
  });
});
