import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize, authorizeSelfOrAdmin, preventRoleEscalation } from '../middlewares/role.middleware';
import { createUserSchema, updateUserSchema, getUserByIdSchema } from '../schemas/user.schema';
import { UserRole } from '../models/user.model';

const router = Router();
const userController = new UserController();

// Every route requires a valid token.
router.use(authenticate);

// Listing every user is an admin-only operation.
router.get('/', authorize([UserRole.ADMIN]), userController.getAllUsers);

// Creating an arbitrary user (and assigning roles) is admin-only.
router.post('/', authorize([UserRole.ADMIN]), validate(createUserSchema), userController.createUser);

// A user can read or update their own record; admins can do it for anyone.
// `preventRoleEscalation` stops a non-admin from promoting themselves via the role field.
router.get('/:id', validate(getUserByIdSchema), authorizeSelfOrAdmin, userController.getUserById);
router.put(
  '/:id',
  validate(updateUserSchema),
  authorizeSelfOrAdmin,
  preventRoleEscalation,
  userController.updateUser
);

// Deleting a user is admin-only.
router.delete(
  '/:id',
  authorize([UserRole.ADMIN]),
  validate(getUserByIdSchema),
  userController.deleteUser
);

export default router;
