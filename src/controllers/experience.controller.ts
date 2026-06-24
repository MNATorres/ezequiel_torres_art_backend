import { Request, Response, NextFunction } from 'express';
import { ExperienceService } from '../services/experience.service';

export class ExperienceController {
  private experienceService: ExperienceService;

  constructor(experienceService = new ExperienceService()) {
    this.experienceService = experienceService;
  }

  getAllExperiences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const experiences = await this.experienceService.getAllExperiences();
      res.status(200).json(experiences);
    } catch (error) {
      next(error);
    }
  };

  getExperienceById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const experience = await this.experienceService.getExperienceById(req.params.id);
      res.status(200).json(experience);
    } catch (error) {
      next(error);
    }
  };

  createExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const experience = await this.experienceService.createExperience(req.body);
      res.status(201).json(experience);
    } catch (error) {
      next(error);
    }
  };

  updateExperience = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const experience = await this.experienceService.updateExperience(req.params.id, req.body);
      res.status(200).json(experience);
    } catch (error) {
      next(error);
    }
  };

  deleteExperience = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const experience = await this.experienceService.deleteExperience(req.params.id);
      res.status(200).json({ message: 'Experience deleted successfully', experience });
    } catch (error) {
      next(error);
    }
  };
}
