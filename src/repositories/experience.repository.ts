import { ExperienceModel, IExperience } from '../models/experience.model';
import { CreateExperienceInput, UpdateExperienceInput } from '../schemas/experience.schema';

export class ExperienceRepository {
  async findAll(): Promise<IExperience[]> {
    return ExperienceModel.find().sort({ date: -1 }).exec();
  }

  async findById(id: string): Promise<IExperience | null> {
    return ExperienceModel.findById(id).exec();
  }

  async create(data: CreateExperienceInput): Promise<IExperience> {
    const experience = new ExperienceModel(data);
    return experience.save();
  }

  async update(id: string, data: UpdateExperienceInput): Promise<IExperience | null> {
    return ExperienceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<IExperience | null> {
    return ExperienceModel.findByIdAndDelete(id).exec();
  }
}
