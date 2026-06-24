import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, registerSchema } from './auth.schema';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      body: { email: 'a@b.com', password: 'secret' },
    });
    assert.equal(result.success, true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ body: { email: 'nope', password: 'secret' } });
    assert.equal(result.success, false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ body: { email: 'a@b.com', password: '' } });
    assert.equal(result.success, false);
  });
});

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      body: { name: 'Ezequiel', email: 'a@b.com', password: 'secret123' },
    });
    assert.equal(result.success, true);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = registerSchema.safeParse({
      body: { name: 'Ezequiel', email: 'a@b.com', password: '123' },
    });
    assert.equal(result.success, false);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({
      body: { name: 'E', email: 'a@b.com', password: 'secret123' },
    });
    assert.equal(result.success, false);
  });

  it('strips an injected role so it cannot be self-assigned', () => {
    const result = registerSchema.safeParse({
      body: { name: 'Ezequiel', email: 'a@b.com', password: 'secret123', role: 'ADMIN' },
    });
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal('role' in result.data.body, false);
  });
});
