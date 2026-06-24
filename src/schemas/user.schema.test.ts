import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createUserSchema, updateUserSchema, getUserByIdSchema } from './user.schema';
import { UserRole } from '../models/user.model';

const VALID_ID = '507f1f77bcf86cd799439011';

describe('createUserSchema', () => {
  it('accepts a valid user (role optional)', () => {
    const result = createUserSchema.safeParse({
      body: { name: 'Ezequiel', email: 'a@b.com', password: 'secret123' },
    });
    assert.equal(result.success, true);
  });

  it('accepts an explicit valid role', () => {
    const result = createUserSchema.safeParse({
      body: { name: 'Ezequiel', email: 'a@b.com', password: 'secret123', role: UserRole.ADMIN },
    });
    assert.equal(result.success, true);
  });

  it('rejects an unknown role value', () => {
    const result = createUserSchema.safeParse({
      body: { name: 'Ezequiel', email: 'a@b.com', password: 'secret123', role: 'SUPERADMIN' },
    });
    assert.equal(result.success, false);
  });

  it('rejects a short password', () => {
    const result = createUserSchema.safeParse({
      body: { name: 'Ezequiel', email: 'a@b.com', password: '123' },
    });
    assert.equal(result.success, false);
  });

  it('rejects an invalid email', () => {
    const result = createUserSchema.safeParse({
      body: { name: 'Ezequiel', email: 'nope', password: 'secret123' },
    });
    assert.equal(result.success, false);
  });
});

describe('updateUserSchema', () => {
  it('accepts a partial body with a valid id', () => {
    const result = updateUserSchema.safeParse({
      body: { name: 'Updated' },
      params: { id: VALID_ID },
    });
    assert.equal(result.success, true);
  });

  it('rejects a malformed MongoDB id', () => {
    const result = updateUserSchema.safeParse({
      body: { name: 'Updated' },
      params: { id: 'not-an-objectid' },
    });
    assert.equal(result.success, false);
  });
});

describe('getUserByIdSchema', () => {
  it('accepts a valid MongoDB id', () => {
    const result = getUserByIdSchema.safeParse({ params: { id: VALID_ID } });
    assert.equal(result.success, true);
  });

  it('rejects a malformed MongoDB id', () => {
    const result = getUserByIdSchema.safeParse({ params: { id: '123' } });
    assert.equal(result.success, false);
  });
});
