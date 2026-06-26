import { Request, Response, NextFunction } from 'express';
import { ArtworkService } from '../services/artwork.service';

export class ArtworkController {
  private artworkService: ArtworkService;

  constructor(artworkService = new ArtworkService()) {
    this.artworkService = artworkService;
  }

  getAllArtworks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artworks = await this.artworkService.getAllArtworks();
      res.status(200).json(artworks);
    } catch (error) {
      next(error);
    }
  };

  getArtworkById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const artwork = await this.artworkService.getArtworkById(req.params.id);
      res.status(200).json(artwork);
    } catch (error) {
      next(error);
    }
  };

  createArtwork = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artwork = await this.artworkService.createArtwork(req.body);
      res.status(201).json(artwork);
    } catch (error) {
      next(error);
    }
  };

  updateArtwork = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const artwork = await this.artworkService.updateArtwork(req.params.id, req.body);
      res.status(200).json(artwork);
    } catch (error) {
      next(error);
    }
  };

  deleteArtwork = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const artwork = await this.artworkService.deleteArtwork(req.params.id);
      res.status(200).json({ message: 'Artwork deleted successfully', artwork });
    } catch (error) {
      next(error);
    }
  };
}
