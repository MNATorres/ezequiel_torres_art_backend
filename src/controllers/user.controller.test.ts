import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction, Request } from 'express';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

const buildController = (overrides: Partial<UserService>) => {
  const service = overrides as unknown as UserService;
  return new UserController(service);
};

describe('UserController', () => {
  it('getAllUsers responds 200 with the list', async () => {
    const users = [{ _id: '1' }, { _id: '2' }];
    const controller = buildController({ getAllUsers: async () => users as never });

    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getAllUsers(createMockRequest(), res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, users);
    assert.equal(next.mock.calls.length, 0);
  });

  it('getUserById responds 200 with the user', async () => {
    const user = { _id: '507f1f77bcf86cd799439011' };
    const controller = buildController({ getUserById: async () => user as never });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: '507f1f77bcf86cd799439011' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getUserById(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, user);
    assert.equal(next.mock.calls.length, 0);
  });

  it('createUser responds 201 with the created user', async () => {
    const user = { _id: '1', name: 'New User' };
    const controller = buildController({ createUser: async () => user as never });

    const req = createMockRequest({ body: { name: 'New User' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.createUser(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 201);
    assert.deepEqual(recorded.body, user);
    assert.equal(next.mock.calls.length, 0);
  });

  it('updateUser responds 200 with the updated user', async () => {
    const user = { _id: '1', name: 'Updated' };
    const controller = buildController({ updateUser: async () => user as never });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: '1' },
      body: { name: 'Updated' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.updateUser(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, user);
    assert.equal(next.mock.calls.length, 0);
  });

  it('deleteUser responds 200 with a confirmation message', async () => {
    const user = { _id: '1' };
    const controller = buildController({ deleteUser: async () => user as never });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: '1' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.deleteUser(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, { message: 'User deleted successfully', user });
    assert.equal(next.mock.calls.length, 0);
  });

  it('forwards service errors to next() (getUserById)', async () => {
    const error = new Error('User not found');
    const controller = buildController({
      getUserById: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: 'missing' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getUserById(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });

  it('forwards service errors to next() (deleteUser)', async () => {
    const error = new Error('User not found');
    const controller = buildController({
      deleteUser: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: 'missing' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.deleteUser(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });
});
