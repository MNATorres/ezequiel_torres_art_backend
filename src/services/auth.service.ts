import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from './user.service';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { UserRole } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export class AuthService {
  private userRepository: UserRepository;
  private userService: UserService;

  constructor(
    userRepository = new UserRepository(),
    userService = new UserService(userRepository)
  ) {
    this.userRepository = userRepository;
    this.userService = userService;
  }

  private signToken(id: unknown, role: UserRole) {
    return jwt.sign({ id, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  async login(data: LoginInput) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (!user.password) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = this.signToken(user._id, user.role);

    const userObject = user.toObject();
    delete userObject.password;

    return { token, user: userObject };
  }

  async register(data: RegisterInput) {
    // Force the USER role so public registration can never create an admin.
    const user = await this.userService.createUser({ ...data, role: UserRole.USER });

    const token = this.signToken(user._id, user.role);

    return { token, user };
  }
}
