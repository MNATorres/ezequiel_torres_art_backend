import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);

export default router;
