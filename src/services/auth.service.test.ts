import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../models/user.model';
import { env } from '../config/env';

const createUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Ezequiel Torres',
  email: 'ezequiel@example.com',
  password: '$2b$10$placeholder',
  role: UserRole.ADMIN,
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

describe('AuthService', () => {
  it('returns a signed token and the user without password when credentials are valid', async () => {
    const hashedPassword = await bcrypt.hash('secret123', 10);
    const user = createUser({ password: hashedPassword });
    const repository = {
      findByEmail: async () => user,
    } as unknown as UserRepository;

    const result = await new AuthService(repository).login({
      email: 'ezequiel@example.com',
      password: 'secret123',
    });

    const decoded = jwt.verify(result.token, env.JWT_SECRET) as jwt.JwtPayload;
    assert.equal(decoded.id, user._id);
    assert.equal(decoded.role, UserRole.ADMIN);
    assert.deepEqual(result.user, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    assert.equal('password' in result.user, false);
  });

  it('throws when the email does not exist', async () => {
    const repository = {
      findByEmail: async () => null,
    } as unknown as UserRepository;

    await assert.rejects(
      () => new AuthService(repository).login({ email: 'missing@example.com', password: 'secret123' }),
      /Invalid email or password/
    );
  });

  it('throws when the password is invalid', async () => {
    const user = createUser({ password: await bcrypt.hash('secret123', 10) });
    const repository = {
      findByEmail: async () => user,
    } as unknown as UserRepository;

    await assert.rejects(
      () => new AuthService(repository).login({ email: 'ezequiel@example.com', password: 'wrong-password' }),
      /Invalid email or password/
    );
  });
});