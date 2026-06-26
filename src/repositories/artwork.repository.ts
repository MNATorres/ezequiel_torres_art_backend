import { ArtworkModel, IArtwork } from '../models/artwork.model';
import { CreateArtworkInput, UpdateArtworkInput } from '../schemas/artwork.schema';

export class ArtworkRepository {
  async findAll(): Promise<IArtwork[]> {
    return ArtworkModel.find().sort({ order: 1, createdAt: 1 }).exec();
  }

  async findById(id: string): Promise<IArtwork | null> {
    return ArtworkModel.findById(id).exec();
  }

  async create(data: CreateArtworkInput): Promise<IArtwork> {
    const artwork = new ArtworkModel(data);
    return artwork.save();
  }

  async update(id: string, data: UpdateArtworkInput): Promise<IArtwork | null> {
    return ArtworkModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<IArtwork | null> {
    return ArtworkModel.findByIdAndDelete(id).exec();
  }
}
