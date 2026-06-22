import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, getUserByIdSchema } from '../schemas/user.schema';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAllUsers);
router.get('/:id', validate(getUserByIdSchema), userController.getUserById);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', validate(getUserByIdSchema), userController.deleteUser);

export default router;
