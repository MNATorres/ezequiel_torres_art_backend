import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError';

export const UPLOAD_DIR = 'uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure the upload directory exists at startup.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'Only image files are allowed'));
    }
  },
});

// Wraps multer so its errors become AppErrors (400) handled by the central
// error middleware, instead of bubbling up as generic 500s.
export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message;
      return next(new AppError(400, message));
    }
    if (err) return next(err);
    next();
  });
};
