import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

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

  getUserById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  deleteUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.deleteUser(req.params.id);
      res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
