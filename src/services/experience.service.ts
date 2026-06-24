import { ExperienceRepository } from '../repositories/experience.repository';
import { CreateExperienceInput, UpdateExperienceInput } from '../schemas/experience.schema';
import { AppError } from '../utils/AppError';

export class ExperienceService {
  private experienceRepository: ExperienceRepository;

  constructor(experienceRepository = new ExperienceRepository()) {
    this.experienceRepository = experienceRepository;
  }

  async getAllExperiences() {
    return this.experienceRepository.findAll();
  }

  async getExperienceById(id: string) {
    const experience = await this.experienceRepository.findById(id);
    if (!experience) throw new AppError(404, 'Experience not found');
    return experience;
  }

  async createExperience(data: CreateExperienceInput) {
    return this.experienceRepository.create(data);
  }

  async updateExperience(id: string, data: UpdateExperienceInput) {
    const experience = await this.experienceRepository.update(id, data);
    if (!experience) throw new AppError(404, 'Experience not found');
    return experience;
  }

  async deleteExperience(id: string) {
    const experience = await this.experienceRepository.delete(id);
    if (!experience) throw new AppError(404, 'Experience not found');
    return experience;
  }
}
