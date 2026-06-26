import { Router } from 'express';
import { ArtworkController } from '../controllers/artwork.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createArtworkSchema,
  updateArtworkSchema,
  getArtworkByIdSchema,
} from '../schemas/artwork.schema';

const router = Router();
const artworkController = new ArtworkController();

// Public reads — the public site lists the gallery without a token.
router.get('/', artworkController.getAllArtworks);
router.get('/:id', validate(getArtworkByIdSchema), artworkController.getArtworkById);

// Writes require any authenticated user (ADMIN or USER).
router.post('/', authenticate, validate(createArtworkSchema), artworkController.createArtwork);
router.put('/:id', authenticate, validate(updateArtworkSchema), artworkController.updateArtwork);
router.delete('/:id', authenticate, validate(getArtworkByIdSchema), artworkController.deleteArtwork);

export default router;
