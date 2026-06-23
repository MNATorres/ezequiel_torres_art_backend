import { UserRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';

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
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const updateData = { ...data };
    if (data.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(data.password, saltRounds);
    }

    const user = await this.userRepository.update(id, updateData);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.delete(id);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }
}
