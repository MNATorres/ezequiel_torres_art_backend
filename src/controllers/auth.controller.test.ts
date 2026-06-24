import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

describe('AuthController', () => {
  describe('login', () => {
    it('responds 200 with the auth result', async () => {
      const result = { token: 'jwt-token', user: { _id: '1', email: 'a@b.com' } };
      const authService = { login: async () => result } as unknown as AuthService;
      const controller = new AuthController(authService);

      const req = createMockRequest({ body: { email: 'a@b.com', password: 'secret123' } });
      const { res, recorded } = createMockResponse();
      const next = mock.fn();

      await controller.login(req, res, next as unknown as NextFunction);

      assert.equal(recorded.statusCode, 200);
      assert.deepEqual(recorded.body, result);
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards errors to next() without writing a response', async () => {
      const error = new Error('invalid credentials');
      const authService = {
        login: async () => {
          throw error;
        },
      } as unknown as AuthService;
      const controller = new AuthController(authService);

      const req = createMockRequest({ body: {} });
      const { res, recorded } = createMockResponse();
      const next = mock.fn();

      await controller.login(req, res, next as unknown as NextFunction);

      assert.equal(recorded.statusCode, undefined);
      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  describe('register', () => {
    it('responds 201 with the auth result', async () => {
      const result = { token: 'jwt-token', user: { _id: '2', email: 'new@b.com' } };
      const authService = { register: async () => result } as unknown as AuthService;
      const controller = new AuthController(authService);

      const req = createMockRequest({
        body: { name: 'New User', email: 'new@b.com', password: 'secret123' },
      });
      const { res, recorded } = createMockResponse();
      const next = mock.fn();

      await controller.register(req, res, next as unknown as NextFunction);

      assert.equal(recorded.statusCode, 201);
      assert.deepEqual(recorded.body, result);
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards errors to next()', async () => {
      const error = new Error('email already in use');
      const authService = {
        register: async () => {
          throw error;
        },
      } as unknown as AuthService;
      const controller = new AuthController(authService);

      const req = createMockRequest({ body: {} });
      const { res, recorded } = createMockResponse();
      const next = mock.fn();

      await controller.register(req, res, next as unknown as NextFunction);

      assert.equal(recorded.statusCode, undefined);
      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });
});
