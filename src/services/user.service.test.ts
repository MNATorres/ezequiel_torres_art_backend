import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../models/user.model';

const createUserDocument = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Ezequiel Torres',
  email: 'ezequiel@example.com',
  password: '$2b$10$placeholder',
  role: UserRole.USER,
  toObject() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    };
  },
  ...overrides,
});

describe('UserService', () => {
  it('returns all users from the repository', async () => {
    const users = [createUserDocument({ password: undefined })];
    const repository = {
      findAll: async () => users,
    } as unknown as UserRepository;

    const result = await new UserService(repository).getAllUsers();

    assert.equal(result, users);
  });

  it('returns a user by id', async () => {
    const user = createUserDocument({ password: undefined });
    const repository = {
      findById: async (id: string) => (id === '507f1f77bcf86cd799439011' ? user : null),
    } as unknown as UserRepository;

    const result = await new UserService(repository).getUserById('507f1f77bcf86cd799439011');

    assert.equal(result, user);
  });

  it('throws when a user id is not found', async () => {
    const repository = {
      findById: async () => null,
    } as unknown as UserRepository;

    await assert.rejects(
      () => new UserService(repository).getUserById('missing-id'),
      /User not found/
    );
  });

  it('creates a user with a hashed password and omits password from the response', async () => {
    let createdPayload: Record<string, unknown> | undefined;
    const repository = {
      findByEmail: async () => null,
      create: async (payload: Record<string, unknown>) => {
        createdPayload = payload;
        return createUserDocument(payload);
      },
    } as unknown as UserRepository;

    const result = await new UserService(repository).createUser({
      name: 'Ezequiel Torres',
      email: 'ezequiel@example.com',
      password: 'secret123',
      role: UserRole.ADMIN,
    });

    assert.ok(createdPayload);
    assert.notEqual(createdPayload.password, 'secret123');
    assert.equal(await bcrypt.compare('secret123', createdPayload.password as string), true);
    assert.deepEqual(result, {
      _id: '507f1f77bcf86cd799439011',
      name: 'Ezequiel Torres',
      email: 'ezequiel@example.com',
      role: UserRole.ADMIN,
    });
    assert.equal('password' in result, false);
  });

  it('throws when creating a user with an existing email', async () => {
    const repository = {
      findByEmail: async () => createUserDocument(),
      create: async () => {
        throw new Error('create should not be called');
      },
    } as unknown as UserRepository;

    await assert.rejects(
      () =>
        new UserService(repository).createUser({
          name: 'Ezequiel Torres',
          email: 'ezequiel@example.com',
          password: 'secret123',
        }),
      /Email already in use/
    );
  });

  it('hashes password before updating a user', async () => {
    let updatePayload: Record<string, unknown> | undefined;
    const updatedUser = createUserDocument({ password: undefined, name: 'Updated Name' });
    const repository = {
      update: async (_id: string, payload: Record<string, unknown>) => {
        updatePayload = payload;
        return updatedUser;
      },
    } as unknown as UserRepository;

    const result = await new UserService(repository).updateUser('507f1f77bcf86cd799439011', {
      name: 'Updated Name',
      password: 'newSecret123',
    });

    assert.equal(result, updatedUser);
    assert.ok(updatePayload);
    assert.notEqual(updatePayload.password, 'newSecret123');
    assert.equal(await bcrypt.compare('newSecret123', updatePayload.password as string), true);
  });

  it('throws when updating a missing user', async () => {
    const repository = {
      update: async () => null,
    } as unknown as UserRepository;

    await assert.rejects(
      () => new UserService(repository).updateUser('missing-id', { name: 'Missing User' }),
      /User not found/
    );
  });

  it('deletes a user by id', async () => {
    const user = createUserDocument({ password: undefined });
    const repository = {
      delete: async () => user,
    } as unknown as UserRepository;

    const result = await new UserService(repository).deleteUser('507f1f77bcf86cd799439011');

    assert.equal(result, user);
  });

  it('throws when deleting a missing user', async () => {
    const repository = {
      delete: async () => null,
    } as unknown as UserRepository;

    await assert.rejects(
      () => new UserService(repository).deleteUser('missing-id'),
      /User not found/
    );
  });
});
