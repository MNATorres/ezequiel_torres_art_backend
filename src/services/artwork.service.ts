import { ArtworkRepository } from '../repositories/artwork.repository';
import { CreateArtworkInput, UpdateArtworkInput } from '../schemas/artwork.schema';
import { AppError } from '../utils/AppError';

export class ArtworkService {
  private artworkRepository: ArtworkRepository;

  constructor(artworkRepository = new ArtworkRepository()) {
    this.artworkRepository = artworkRepository;
  }

  async getAllArtworks() {
    return this.artworkRepository.findAll();
  }

  async getArtworkById(id: string) {
    const artwork = await this.artworkRepository.findById(id);
    if (!artwork) throw new AppError(404, 'Artwork not found');
    return artwork;
  }

  async createArtwork(data: CreateArtworkInput) {
    return this.artworkRepository.create(data);
  }

  async updateArtwork(id: string, data: UpdateArtworkInput) {
    const artwork = await this.artworkRepository.update(id, data);
    if (!artwork) throw new AppError(404, 'Artwork not found');
    return artwork;
  }

  async deleteArtwork(id: string) {
    const artwork = await this.artworkRepository.delete(id);
    if (!artwork) throw new AppError(404, 'Artwork not found');
    return artwork;
  }
}
