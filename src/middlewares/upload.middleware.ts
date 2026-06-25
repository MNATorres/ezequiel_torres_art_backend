import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Keep the file in memory; it's streamed straight to Cloudinary (no disk).
const upload = multer({
  storage: multer.memoryStorage(),
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
