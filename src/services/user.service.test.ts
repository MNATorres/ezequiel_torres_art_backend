import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../models/user.model';

const createUserDocument = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Ezequiel Torres',
  email: 'ezequiel@example.com',
  role: UserRole.USER,
  toObject() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
    };
  },
  ...overrides,
});

describe('UserService', () => {
  it('returns all users from the repository', async () => {
    const users = [createUserDocument()];
    const repository = {
      findAll: async () => users,
    } as unknown as UserRepository;

    const result = await new UserService(repository).getAllUsers();

    assert.equal(result, users);
  });

  it('returns a user by id', async () => {
    const user = createUserDocument();
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

  it('creates a user via the repository', async () => {
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
      role: UserRole.ADMIN,
    });

    assert.ok(createdPayload);
    assert.equal(createdPayload.email, 'ezequiel@example.com');
    assert.equal(result.role, UserRole.ADMIN);
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
        }),
      /Email already in use/
    );
  });

  it('updates a user via the repository', async () => {
    let updatePayload: Record<string, unknown> | undefined;
    const updatedUser = createUserDocument({ name: 'Updated Name' });
    const repository = {
      update: async (_id: string, payload: Record<string, unknown>) => {
        updatePayload = payload;
        return updatedUser;
      },
    } as unknown as UserRepository;

    const result = await new UserService(repository).updateUser('507f1f77bcf86cd799439011', {
      name: 'Updated Name',
    });

    assert.equal(result, updatedUser);
    assert.deepEqual(updatePayload, { name: 'Updated Name' });
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
    const user = createUserDocument();
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
