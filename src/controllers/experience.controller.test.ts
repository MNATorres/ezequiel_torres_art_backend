import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction, Request } from 'express';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from '../services/experience.service';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

const buildController = (overrides: Partial<ExperienceService>) => {
  const service = overrides as unknown as ExperienceService;
  return new ExperienceController(service);
};

describe('ExperienceController', () => {
  it('getAllExperiences responds 200 with the list', async () => {
    const experiences = [{ _id: '1' }, { _id: '2' }];
    const controller = buildController({ getAllExperiences: async () => experiences as never });

    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getAllExperiences(createMockRequest(), res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, experiences);
    assert.equal(next.mock.calls.length, 0);
  });

  it('getExperienceById responds 200 with the experience', async () => {
    const experience = { _id: '507f1f77bcf86cd799439011' };
    const controller = buildController({ getExperienceById: async () => experience as never });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: '507f1f77bcf86cd799439011' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getExperienceById(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, experience);
    assert.equal(next.mock.calls.length, 0);
  });

  it('createExperience responds 201 with the created experience', async () => {
    const experience = { _id: '1', title: 'New Experience' };
    const controller = buildController({ createExperience: async () => experience as never });

    const req = createMockRequest({ body: { title: 'New Experience' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.createExperience(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 201);
    assert.deepEqual(recorded.body, experience);
    assert.equal(next.mock.calls.length, 0);
  });

  it('updateExperience responds 200 with the updated experience', async () => {
    const experience = { _id: '1', title: 'Updated' };
    const controller = buildController({ updateExperience: async () => experience as never });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: '1' },
      body: { title: 'Updated' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.updateExperience(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, experience);
    assert.equal(next.mock.calls.length, 0);
  });

  it('deleteExperience responds 200 with a confirmation message', async () => {
    const experience = { _id: '1' };
    const controller = buildController({ deleteExperience: async () => experience as never });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: '1' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.deleteExperience(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, {
      message: 'Experience deleted successfully',
      experience,
    });
    assert.equal(next.mock.calls.length, 0);
  });

  it('forwards service errors to next() (getExperienceById)', async () => {
    const error = new Error('Experience not found');
    const controller = buildController({
      getExperienceById: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: 'missing' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getExperienceById(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });

  it('forwards service errors to next() (createExperience)', async () => {
    const error = new Error('boom');
    const controller = buildController({
      createExperience: async () => {
        throw error;
      },
    });

    const req = createMockRequest({ body: {} });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.createExperience(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });

  it('forwards service errors to next() (updateExperience)', async () => {
    const error = new Error('Experience not found');
    const controller = buildController({
      updateExperience: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: 'missing' },
      body: { title: 'X' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.updateExperience(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });

  it('forwards service errors to next() (deleteExperience)', async () => {
    const error = new Error('Experience not found');
    const controller = buildController({
      deleteExperience: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: 'missing' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.deleteExperience(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });
});
