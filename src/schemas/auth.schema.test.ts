import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { googleAuthSchema } from './auth.schema';

describe('googleAuthSchema', () => {
  it('accepts a non-empty idToken', () => {
    const result = googleAuthSchema.safeParse({ body: { idToken: 'a-firebase-id-token' } });
    assert.equal(result.success, true);
  });

  it('rejects an empty idToken', () => {
    const result = googleAuthSchema.safeParse({ body: { idToken: '' } });
    assert.equal(result.success, false);
  });

  it('rejects a missing idToken', () => {
    const result = googleAuthSchema.safeParse({ body: {} });
    assert.equal(result.success, false);
  });
});
