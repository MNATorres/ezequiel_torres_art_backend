import { Router } from 'express';
import { ExperienceController } from '../controllers/experience.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createExperienceSchema,
  updateExperienceSchema,
  getExperienceByIdSchema,
} from '../schemas/experience.schema';

const router = Router();
const experienceController = new ExperienceController();

// Public reads — the public site lists the full trajectory without a token.
router.get('/', experienceController.getAllExperiences);
router.get('/:id', validate(getExperienceByIdSchema), experienceController.getExperienceById);

// Writes require any authenticated user (ADMIN or USER).
router.post('/', authenticate, validate(createExperienceSchema), experienceController.createExperience);
router.put(
  '/:id',
  authenticate,
  validate(updateExperienceSchema),
  experienceController.updateExperience
);
router.delete(
  '/:id',
  authenticate,
  validate(getExperienceByIdSchema),
  experienceController.deleteExperience
);

export default router;
