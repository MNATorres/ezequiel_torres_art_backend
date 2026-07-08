import { UserRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { AppError } from '../utils/AppError';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async createUser(data: CreateUserInput) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(409, 'Email already in use');
    }

    return this.userRepository.create(data);
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const user = await this.userRepository.update(id, data);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.delete(id);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }
}
