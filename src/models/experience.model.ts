import { Schema, model, Document } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  date: Date;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const ExperienceModel = model<IExperience>('Experience', ExperienceSchema);
