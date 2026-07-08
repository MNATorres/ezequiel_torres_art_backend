import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor(authService = new AuthService()) {
    this.authService = authService;
  }

  googleSignIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.googleSignIn(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
