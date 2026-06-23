import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unexpected error';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error: unknown) {
      res.status(404).json({ error: getErrorMessage(error) });
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  };

  updateUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error: unknown) {
      res.status(404).json({ error: getErrorMessage(error) });
    }
  };

  deleteUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await this.userService.deleteUser(req.params.id);
      res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error: unknown) {
      res.status(404).json({ error: getErrorMessage(error) });
    }
  };
}
