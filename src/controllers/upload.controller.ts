import { Request, Response, NextFunction } from 'express';
import type { UploadApiResponse } from 'cloudinary';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { AppError } from '../utils/AppError';

export class UploadController {
  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCloudinaryConfigured) {
        throw new AppError(503, 'Image uploads are not configured (missing CLOUDINARY_URL)');
      }
      if (!req.file) {
        throw new AppError(400, 'No image file provided (field name must be "image")');
      }

      const buffer = req.file.buffer;
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ezequiel_torres_art' },
          (error, uploaded) => {
            if (error || !uploaded) {
              return reject(error ?? new Error('Cloudinary upload failed'));
            }
            resolve(uploaded);
          }
        );
        stream.end(buffer);
      });

      res.status(201).json({ url: result.secure_url });
    } catch (error) {
      next(error);
    }
  };
}
