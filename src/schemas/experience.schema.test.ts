import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createExperienceSchema,
  updateExperienceSchema,
  getExperienceByIdSchema,
} from './experience.schema';

const VALID_ID = '507f1f77bcf86cd799439011';

describe('createExperienceSchema', () => {
  it('accepts a valid experience (imageUrl optional)', () => {
    const result = createExperienceSchema.safeParse({
      body: {
        title: 'Exposición individual',
        date: '2020-06-01',
        description: 'Muestra en el museo',
      },
    });
    assert.equal(result.success, true);
  });

  it('coerces an ISO date string into a Date', () => {
    const result = createExperienceSchema.safeParse({
      body: {
        title: 'Exposición individual',
        date: '2020-06-01',
        description: 'Muestra en el museo',
      },
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.ok(result.data.body.date instanceof Date);
    }
  });

  it('accepts a valid imageUrl', () => {
    const result = createExperienceSchema.safeParse({
      body: {
        title: 'Exposición individual',
        date: '2020-06-01',
        description: 'Muestra en el museo',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/img.jpg',
      },
    });
    assert.equal(result.success, true);
  });

  it('rejects an invalid imageUrl', () => {
    const result = createExperienceSchema.safeParse({
      body: {
        title: 'Exposición individual',
        date: '2020-06-01',
        description: 'Muestra en el museo',
        imageUrl: 'not-a-url',
      },
    });
    assert.equal(result.success, false);
  });

  it('rejects a too-short title', () => {
    const result = createExperienceSchema.safeParse({
      body: { title: 'A', date: '2020-06-01', description: 'Muestra en el museo' },
    });
    assert.equal(result.success, false);
  });

  it('rejects a too-short description', () => {
    const result = createExperienceSchema.safeParse({
      body: { title: 'Exposición', date: '2020-06-01', description: 'X' },
    });
    assert.equal(result.success, false);
  });

  it('rejects an unparseable date', () => {
    const result = createExperienceSchema.safeParse({
      body: { title: 'Exposición', date: 'not-a-date', description: 'Muestra' },
    });
    assert.equal(result.success, false);
  });

  it('rejects a missing required field', () => {
    const result = createExperienceSchema.safeParse({
      body: { title: 'Exposición', description: 'Muestra' },
    });
    assert.equal(result.success, false);
  });
});

describe('updateExperienceSchema', () => {
  it('accepts a partial body with a valid id', () => {
    const result = updateExperienceSchema.safeParse({
      body: { title: 'Updated' },
      params: { id: VALID_ID },
    });
    assert.equal(result.success, true);
  });

  it('accepts an empty body with a valid id', () => {
    const result = updateExperienceSchema.safeParse({
      body: {},
      params: { id: VALID_ID },
    });
    assert.equal(result.success, true);
  });

  it('rejects a malformed MongoDB id', () => {
    const result = updateExperienceSchema.safeParse({
      body: { title: 'Updated' },
      params: { id: 'not-an-objectid' },
    });
    assert.equal(result.success, false);
  });
});

describe('getExperienceByIdSchema', () => {
  it('accepts a valid MongoDB id', () => {
    const result = getExperienceByIdSchema.safeParse({ params: { id: VALID_ID } });
    assert.equal(result.success, true);
  });

  it('rejects a malformed MongoDB id', () => {
    const result = getExperienceByIdSchema.safeParse({ params: { id: '123' } });
    assert.equal(result.success, false);
  });
});
