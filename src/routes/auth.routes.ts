import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { googleAuthSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/google', validate(googleAuthSchema), authController.googleSignIn);

export default router;
