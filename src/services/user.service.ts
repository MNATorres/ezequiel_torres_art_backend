import { UserRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUser(data: CreateUserInput) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    // TODO: Hash password here with bcrypt before saving
    const user = await this.userRepository.create(data);
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  async updateUser(id: string, data: UpdateUserInput) {
    // TODO: If password is provided, hash it here
    const user = await this.userRepository.update(id, data);
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.delete(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}
