import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const uploadController = new UploadController();

// Any authenticated user can upload an image; returns { url }.
router.post('/', authenticate, uploadImage, uploadController.uploadImage);

export default router;
