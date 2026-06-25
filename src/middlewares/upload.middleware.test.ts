/* eslint-disable @typescript-eslint/no-require-imports -- swapping multer's cached module export is the cleanest way to drive its callback deterministically */
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError';
import { createMockRequest, createMockResponse } from '../test-utils/mocks';

type MulterCallback = (err: unknown) => void;
type MulterMiddleware = (req: Request, res: Response, cb: MulterCallback) => void;

const multerPath = require.resolve('multer');
const middlewarePath = require.resolve('./upload.middleware');

/**
 * The wrapper builds its multer instance at import time, so we replace multer's
 * cached module export with a fake whose single() invokes the callback with a
 * chosen error, then re-import the wrapper. Static props (MulterError, storages)
 * are preserved so `err instanceof multer.MulterError` keeps working.
 */
const withStubbedMulter = (
  middlewareError: unknown,
  run: (uploadImage: MulterMiddleware) => void
) => {
  const cached = require.cache[multerPath];
  if (!cached) throw new Error('multer is not in the require cache');
  const realExports = cached.exports;

  const fakeMiddleware: MulterMiddleware = (_req, _res, cb) => cb(middlewareError);
  const fakeFactory = Object.assign(() => ({ single: () => fakeMiddleware }), realExports);
  cached.exports = fakeFactory;

  delete require.cache[middlewarePath];

  try {
    const { uploadImage } = require('./upload.middleware') as {
      uploadImage: MulterMiddleware;
    };
    run(uploadImage);
  } finally {
    cached.exports = realExports;
    delete require.cache[middlewarePath];
  }
};

const callWrapper = (uploadImage: MulterMiddleware) => {
  const next = mock.fn();
  const { res } = createMockResponse();
  uploadImage(createMockRequest(), res, next as unknown as NextFunction);
  return next;
};

describe('uploadImage middleware', () => {
  it('calls next() with no error when multer succeeds', () => {
    withStubbedMulter(undefined, (uploadImage) => {
      const next = callWrapper(uploadImage);
      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments.length, 0);
    });
  });

  it('maps a LIMIT_FILE_SIZE MulterError to a 400 AppError', () => {
    withStubbedMulter(new multer.MulterError('LIMIT_FILE_SIZE'), (uploadImage) => {
      const next = callWrapper(uploadImage);
      const forwarded = next.mock.calls[0].arguments[0] as AppError;
      assert.ok(forwarded instanceof AppError);
      assert.equal(forwarded.statusCode, 400);
      assert.equal(forwarded.message, 'File too large (max 5MB)');
    });
  });

  it('maps any other MulterError to a 400 AppError with its message', () => {
    const multerError = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    withStubbedMulter(multerError, (uploadImage) => {
      const next = callWrapper(uploadImage);
      const forwarded = next.mock.calls[0].arguments[0] as AppError;
      assert.ok(forwarded instanceof AppError);
      assert.equal(forwarded.statusCode, 400);
      assert.equal(forwarded.message, multerError.message);
    });
  });

  it('forwards a non-multer error untouched', () => {
    const error = new AppError(400, 'Only image files are allowed');
    withStubbedMulter(error, (uploadImage) => {
      const next = callWrapper(uploadImage);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });
});
