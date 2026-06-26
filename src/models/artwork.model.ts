import { Schema, model, Document } from 'mongoose';

export interface IArtwork extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArtworkSchema = new Schema<IArtwork>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ArtworkModel = model<IArtwork>('Artwork', ArtworkSchema);
