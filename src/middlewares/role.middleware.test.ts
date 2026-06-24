import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction, Request } from 'express';
import { authorize, authorizeSelfOrAdmin, preventRoleEscalation } from './role.middleware';
import { UserRole } from '../models/user.model';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

describe('authorize middleware', () => {
  it('rejects with 403 when there is no authenticated user', () => {
    const req = createMockRequest({});
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    authorize([UserRole.ADMIN])(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 403);
    assert.equal(next.mock.calls.length, 0);
  });

  it('rejects with 403 when the role is not allowed', () => {
    const req = createMockRequest({
      user: { id: '1', role: UserRole.USER, email: 'user@example.com' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    authorize([UserRole.ADMIN])(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 403);
    assert.equal(next.mock.calls.length, 0);
  });

  it('calls next() when the role is allowed', () => {
    const req = createMockRequest({
      user: { id: '1', role: UserRole.ADMIN, email: 'admin@example.com' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    authorize([UserRole.ADMIN, UserRole.USER])(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
  });
});

describe('authorizeSelfOrAdmin middleware', () => {
  const run = (
    user: { id: string; role: UserRole; email: string } | undefined,
    paramsId: string
  ) => {
    const req = createMockRequest({ user, params: { id: paramsId } }) as Request<{ id: string }>;
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    authorizeSelfOrAdmin(req, res, next as unknown as NextFunction);
    return { recorded, next };
  };

  it('rejects with 401 when there is no authenticated user', () => {
    const { recorded, next } = run(undefined, '1');
    assert.equal(recorded.statusCode, 401);
    assert.equal(next.mock.calls.length, 0);
  });

  it('allows an admin to act on any user', () => {
    const { recorded, next } = run(
      { id: 'admin-1', role: UserRole.ADMIN, email: 'admin@example.com' },
      'someone-else'
    );
    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
  });

  it('allows a user to act on their own record', () => {
    const { recorded, next } = run(
      { id: 'user-1', role: UserRole.USER, email: 'user@example.com' },
      'user-1'
    );
    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
  });

  it('rejects with 403 when a user targets another record', () => {
    const { recorded, next } = run(
      { id: 'user-1', role: UserRole.USER, email: 'user@example.com' },
      'user-2'
    );
    assert.equal(recorded.statusCode, 403);
    assert.equal(next.mock.calls.length, 0);
  });
});

describe('preventRoleEscalation middleware', () => {
  it('allows an admin to set the role field', () => {
    const req = createMockRequest({
      user: { id: '1', role: UserRole.ADMIN, email: 'admin@example.com' },
      body: { role: UserRole.ADMIN },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    preventRoleEscalation(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
  });

  it('rejects with 403 when a non-admin sends the role field', () => {
    const req = createMockRequest({
      user: { id: '1', role: UserRole.USER, email: 'user@example.com' },
      body: { name: 'X', role: UserRole.ADMIN },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    preventRoleEscalation(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 403);
    assert.equal(next.mock.calls.length, 0);
  });

  it('calls next() when a non-admin does not send the role field', () => {
    const req = createMockRequest({
      user: { id: '1', role: UserRole.USER, email: 'user@example.com' },
      body: { name: 'X' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();

    preventRoleEscalation(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
  });
});
