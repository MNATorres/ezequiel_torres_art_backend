import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction, Request } from 'express';
import { ArtworkController } from './artwork.controller';
import { ArtworkService } from '../services/artwork.service';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

const buildController = (overrides: Partial<ArtworkService>) => {
  const service = overrides as unknown as ArtworkService;
  return new ArtworkController(service);
};

describe('ArtworkController', () => {
  it('getAllArtworks responds 200 with the list', async () => {
    const artworks = [{ _id: '1' }, { _id: '2' }];
    const controller = buildController({ getAllArtworks: async () => artworks as never });

    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getAllArtworks(createMockRequest(), res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, artworks);
    assert.equal(next.mock.calls.length, 0);
  });

  it('getArtworkById responds 200 with the artwork', async () => {
    const artwork = { _id: '507f1f77bcf86cd799439011' };
    const controller = buildController({ getArtworkById: async () => artwork as never });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: '507f1f77bcf86cd799439011' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getArtworkById(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, artwork);
    assert.equal(next.mock.calls.length, 0);
  });

  it('createArtwork responds 201 with the created artwork', async () => {
    const artwork = { _id: '1', title: 'New Artwork' };
    const controller = buildController({ createArtwork: async () => artwork as never });

    const req = createMockRequest({ body: { title: 'New Artwork' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.createArtwork(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 201);
    assert.deepEqual(recorded.body, artwork);
    assert.equal(next.mock.calls.length, 0);
  });

  it('updateArtwork responds 200 with the updated artwork', async () => {
    const artwork = { _id: '1', title: 'Updated' };
    const controller = buildController({ updateArtwork: async () => artwork as never });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: '1' },
      body: { title: 'Updated' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.updateArtwork(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, artwork);
    assert.equal(next.mock.calls.length, 0);
  });

  it('deleteArtwork responds 200 with a confirmation message', async () => {
    const artwork = { _id: '1' };
    const controller = buildController({ deleteArtwork: async () => artwork as never });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: '1' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.deleteArtwork(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 200);
    assert.deepEqual(recorded.body, {
      message: 'Artwork deleted successfully',
      artwork,
    });
    assert.equal(next.mock.calls.length, 0);
  });

  it('forwards service errors to next() (getArtworkById)', async () => {
    const error = new Error('Artwork not found');
    const controller = buildController({
      getArtworkById: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: 'missing' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.getArtworkById(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });

  it('forwards service errors to next() (createArtwork)', async () => {
    const error = new Error('boom');
    const controller = buildController({
      createArtwork: async () => {
        throw error;
      },
    });

    const req = createMockRequest({ body: {} });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.createArtwork(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });

  it('forwards service errors to next() (updateArtwork)', async () => {
    const error = new Error('Artwork not found');
    const controller = buildController({
      updateArtwork: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({
      params: { id: 'missing' },
      body: { title: 'X' },
    });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.updateArtwork(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });

  it('forwards service errors to next() (deleteArtwork)', async () => {
    const error = new Error('Artwork not found');
    const controller = buildController({
      deleteArtwork: async () => {
        throw error;
      },
    });

    const req = createMockRequest<Request<{ id: string }>>({ params: { id: 'missing' } });
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.deleteArtwork(req, res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], error);
  });
});
