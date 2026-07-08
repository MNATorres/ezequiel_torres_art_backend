import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { AuthService, GoogleTokenPayload } from './auth.service';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../models/user.model';
import { env } from '../config/env';

const createUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Ezequiel Torres',
  email: 'allowed@example.com',
  role: UserRole.ADMIN,
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

// env.ALLOWED_GOOGLE_EMAILS in the test .env must include this address.
const ALLOWED_EMAIL = env.ALLOWED_GOOGLE_EMAILS.split(',')[0].trim().toLowerCase();

describe('AuthService', () => {
  it('returns a signed token and the existing user for an allowed, verified Google account', async () => {
    const user = createUser({ email: ALLOWED_EMAIL });
    const repository = {
      findByEmail: async () => user,
    } as unknown as UserRepository;
    const verifyGoogleToken = async (): Promise<GoogleTokenPayload> => ({
      email: ALLOWED_EMAIL,
      email_verified: true,
      name: user.name,
    });

    const result = await new AuthService(repository, verifyGoogleToken).googleSignIn({
      idToken: 'valid-token',
    });

    const decoded = jwt.verify(result.token, env.JWT_SECRET) as jwt.JwtPayload;
    assert.equal(decoded.id, user._id);
    assert.equal(decoded.role, UserRole.ADMIN);
    assert.deepEqual(result.user, {
      _id: user._id,
      name: user.name,
      email: ALLOWED_EMAIL,
      role: user.role,
    });
  });

  it('creates a new USER when the allowed email has no existing account', async () => {
    let createdPayload: Record<string, unknown> | undefined;
    const repository = {
      findByEmail: async () => null,
      create: async (payload: Record<string, unknown>) => {
        createdPayload = payload;
        return createUser({ ...payload, role: UserRole.USER });
      },
    } as unknown as UserRepository;
    const verifyGoogleToken = async (): Promise<GoogleTokenPayload> => ({
      email: ALLOWED_EMAIL,
      email_verified: true,
      name: 'New Admin',
    });

    const result = await new AuthService(repository, verifyGoogleToken).googleSignIn({
      idToken: 'valid-token',
    });

    assert.ok(createdPayload);
    assert.equal(createdPayload.email, ALLOWED_EMAIL);
    assert.equal(createdPayload.role, UserRole.USER);
    assert.equal(result.user.role, UserRole.USER);
  });

  it('throws when the Google email is not in the allowlist', async () => {
    const repository = {
      findByEmail: async () => {
        throw new Error('should not look up an unauthorized email');
      },
    } as unknown as UserRepository;
    const verifyGoogleToken = async (): Promise<GoogleTokenPayload> => ({
      email: 'not-allowed@example.com',
      email_verified: true,
    });

    await assert.rejects(
      () => new AuthService(repository, verifyGoogleToken).googleSignIn({ idToken: 'valid-token' }),
      /Email not authorized/
    );
  });

  it('throws when the Google email is unverified', async () => {
    const repository = {} as unknown as UserRepository;
    const verifyGoogleToken = async (): Promise<GoogleTokenPayload> => ({
      email: ALLOWED_EMAIL,
      email_verified: false,
    });

    await assert.rejects(
      () => new AuthService(repository, verifyGoogleToken).googleSignIn({ idToken: 'valid-token' }),
      /Invalid Google account/
    );
  });

  it('throws when the ID token verification fails', async () => {
    const repository = {} as unknown as UserRepository;
    const verifyGoogleToken = async (): Promise<GoogleTokenPayload> => {
      throw new Error('Firebase ID token has expired');
    };

    await assert.rejects(
      () => new AuthService(repository, verifyGoogleToken).googleSignIn({ idToken: 'expired-token' }),
      /expired/
    );
  });
});
