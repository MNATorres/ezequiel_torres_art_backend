import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export class UploadController {
  uploadImage = (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'No image file provided (field name must be "image")');
      }
      const url = `${env.API_PUBLIC_URL}/uploads/${req.file.filename}`;
      res.status(201).json({ url });
    } catch (error) {
      next(error);
    }
  };
}
