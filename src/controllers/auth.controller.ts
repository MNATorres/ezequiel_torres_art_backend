import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unexpected error';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error: unknown) {
      res.status(401).json({ error: getErrorMessage(error) });
    }
  };
}
