import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createArtworkSchema,
  updateArtworkSchema,
  getArtworkByIdSchema,
} from './artwork.schema';

const VALID_ID = '507f1f77bcf86cd799439011';

describe('createArtworkSchema', () => {
  it('accepts a valid artwork (imageUrl and order optional)', () => {
    const result = createArtworkSchema.safeParse({
      body: {
        title: 'Murales Humanos',
        description: 'Cada pincelada transforma la piel en una obra maestra',
      },
    });
    assert.equal(result.success, true);
  });

  it('accepts a valid imageUrl and order', () => {
    const result = createArtworkSchema.safeParse({
      body: {
        title: 'Murales Humanos',
        description: 'Cada pincelada transforma la piel en una obra maestra',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/img.jpg',
        order: 2,
      },
    });
    assert.equal(result.success, true);
  });

  it('rejects an invalid imageUrl', () => {
    const result = createArtworkSchema.safeParse({
      body: {
        title: 'Murales Humanos',
        description: 'Cada pincelada transforma la piel en una obra maestra',
        imageUrl: 'not-a-url',
      },
    });
    assert.equal(result.success, false);
  });

  it('rejects a negative order', () => {
    const result = createArtworkSchema.safeParse({
      body: {
        title: 'Murales Humanos',
        description: 'Cada pincelada transforma la piel en una obra maestra',
        order: -1,
      },
    });
    assert.equal(result.success, false);
  });

  it('rejects a non-integer order', () => {
    const result = createArtworkSchema.safeParse({
      body: {
        title: 'Murales Humanos',
        description: 'Cada pincelada transforma la piel en una obra maestra',
        order: 1.5,
      },
    });
    assert.equal(result.success, false);
  });

  it('rejects a too-short title', () => {
    const result = createArtworkSchema.safeParse({
      body: { title: 'A', description: 'Cada pincelada transforma la piel' },
    });
    assert.equal(result.success, false);
  });

  it('rejects a too-short description', () => {
    const result = createArtworkSchema.safeParse({
      body: { title: 'Murales Humanos', description: 'X' },
    });
    assert.equal(result.success, false);
  });

  it('rejects a missing required field', () => {
    const result = createArtworkSchema.safeParse({
      body: { title: 'Murales Humanos' },
    });
    assert.equal(result.success, false);
  });
});

describe('updateArtworkSchema', () => {
  it('accepts a partial body with a valid id', () => {
    const result = updateArtworkSchema.safeParse({
      body: { title: 'Updated' },
      params: { id: VALID_ID },
    });
    assert.equal(result.success, true);
  });

  it('accepts an empty body with a valid id', () => {
    const result = updateArtworkSchema.safeParse({
      body: {},
      params: { id: VALID_ID },
    });
    assert.equal(result.success, true);
  });

  it('rejects a malformed MongoDB id', () => {
    const result = updateArtworkSchema.safeParse({
      body: { title: 'Updated' },
      params: { id: 'not-an-objectid' },
    });
    assert.equal(result.success, false);
  });
});

describe('getArtworkByIdSchema', () => {
  it('accepts a valid MongoDB id', () => {
    const result = getArtworkByIdSchema.safeParse({ params: { id: VALID_ID } });
    assert.equal(result.success, true);
  });

  it('rejects a malformed MongoDB id', () => {
    const result = getArtworkByIdSchema.safeParse({ params: { id: '123' } });
    assert.equal(result.success, false);
  });
});
