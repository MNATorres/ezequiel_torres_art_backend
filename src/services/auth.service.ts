import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { LoginInput } from '../schemas/auth.schema';
import { env } from '../config/env';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async login(data: LoginInput) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password!);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const payload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });

    const userObject = user.toObject();
    delete userObject.password;

    return { token, user: userObject };
  }
}
