import { UserModel, IUser } from '../models/user.model';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

export class UserRepository {
  async findAll(): Promise<IUser[]> {
    return UserModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).select('-password').exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async create(userData: CreateUserInput): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  async update(id: string, userData: UpdateUserInput): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, userData, { new: true }).select('-password').exec();
  }

  async delete(id: string): Promise<IUser | null> {
    return UserModel.findByIdAndDelete(id).exec();
  }
}
