import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createUserSchema, updateUserSchema, getUserByIdSchema } from '../schemas/user.schema';
import { UserRole } from '../models/user.model';

const router = Router();
const userController = new UserController();

router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.USER]),
  userController.getAllUsers
);
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.USER]),
  validate(getUserByIdSchema),
  userController.getUserById
);
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.USER]),
  validate(createUserSchema),
  userController.createUser
);
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.USER]),
  validate(updateUserSchema),
  userController.updateUser
);
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.USER]),
  validate(getUserByIdSchema),
  userController.deleteUser
);

export default router;
