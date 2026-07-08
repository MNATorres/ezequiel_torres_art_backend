import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { GoogleAuthInput } from '../schemas/auth.schema';
import { UserRole } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { getFirebaseAuth } from '../config/firebase';

export interface GoogleTokenPayload {
  email?: string;
  email_verified?: boolean;
  name?: string;
}

type VerifyGoogleToken = (idToken: string) => Promise<GoogleTokenPayload>;

export class AuthService {
  private userRepository: UserRepository;
  private verifyGoogleToken: VerifyGoogleToken;

  constructor(
    userRepository = new UserRepository(),
    verifyGoogleToken: VerifyGoogleToken = (idToken) => getFirebaseAuth().verifyIdToken(idToken)
  ) {
    this.userRepository = userRepository;
    this.verifyGoogleToken = verifyGoogleToken;
  }

  private signToken(id: unknown, role: UserRole, email: string) {
    return jwt.sign({ id, role, email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  private isAllowedEmail(email: string) {
    return env.ALLOWED_GOOGLE_EMAILS.split(',')
      .map((allowed) => allowed.trim().toLowerCase())
      .filter(Boolean)
      .includes(email);
  }

  async googleSignIn(data: GoogleAuthInput) {
    const decoded = await this.verifyGoogleToken(data.idToken);

    if (!decoded.email || !decoded.email_verified) {
      throw new AppError(401, 'Invalid Google account');
    }

    const email = decoded.email.toLowerCase();
    if (!this.isAllowedEmail(email)) {
      throw new AppError(403, 'Email not authorized');
    }

    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.userRepository.create({
        name: decoded.name ?? email,
        email,
        role: UserRole.USER,
      });
    }

    const token = this.signToken(user._id, user.role, user.email);

    return { token, user: user.toObject() };
  }
}
