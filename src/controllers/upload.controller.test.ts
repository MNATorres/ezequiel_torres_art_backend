import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction, Request } from 'express';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';
import { AppError } from '../utils/AppError';
import type { UploadController as UploadControllerType } from './upload.controller';

// Must be set before config/cloudinary is imported: `isCloudinaryConfigured` is
// a const captured at import time. We import the module dynamically in before().
process.env.CLOUDINARY_URL = 'cloudinary://key:secret@demo';

type FakeUploader = {
  upload_stream: (
    options: unknown,
    callback: (error: Error | null, result?: { secure_url: string }) => void
  ) => { end: (buffer: Buffer) => void };
};

let controller: UploadControllerType;
let uploader: FakeUploader;

const fileRequest = () =>
  createMockRequest<Request>({
    file: { buffer: Buffer.from('image-bytes') } as unknown as Express.Multer.File,
  });

before(async () => {
  const controllerModule = await import('./upload.controller');
  controller = new controllerModule.UploadController();
  const cloudinaryModule = await import('../config/cloudinary');
  uploader = cloudinaryModule.cloudinary.uploader as unknown as FakeUploader;
});

describe('UploadController.uploadImage', () => {
  it('responds 400 when no file is provided', async () => {
    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.uploadImage(createMockRequest(), res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    const error = next.mock.calls[0].arguments[0] as AppError;
    assert.ok(error instanceof AppError);
    assert.equal(error.statusCode, 400);
  });

  it('responds 201 with the secure url on a successful upload', async () => {
    const secureUrl = 'https://res.cloudinary.com/demo/image/upload/v1/img.jpg';
    uploader.upload_stream = (_options, callback) => ({
      end: () => callback(null, { secure_url: secureUrl }),
    });

    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.uploadImage(fileRequest(), res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, 201);
    assert.deepEqual(recorded.body, { url: secureUrl });
    assert.equal(next.mock.calls.length, 0);
  });

  it('forwards the error to next() when Cloudinary fails', async () => {
    const cloudinaryError = new Error('Cloudinary is down');
    uploader.upload_stream = (_options, callback) => ({
      end: () => callback(cloudinaryError),
    });

    const { res, recorded } = createMockResponse();
    const next = mock.fn();
    await controller.uploadImage(fileRequest(), res, next as unknown as NextFunction);

    assert.equal(recorded.statusCode, undefined);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0].arguments[0], cloudinaryError);
  });

  it('forwards a generic error when Cloudinary returns no result', async () => {
    uploader.upload_stream = (_options, callback) => ({
      end: () => callback(null, undefined),
    });

    const { res } = createMockResponse();
    const next = mock.fn();
    await controller.uploadImage(fileRequest(), res, next as unknown as NextFunction);

    assert.equal(next.mock.calls.length, 1);
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error);
  });
});
