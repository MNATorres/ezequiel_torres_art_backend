import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ExperienceService } from './experience.service';
import { ExperienceRepository } from '../repositories/experience.repository';

const createExperienceDocument = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  title: 'Fundador de ANIMARTE',
  date: new Date('2018-01-01'),
  description: 'Creación y gestión de ANIMARTE',
  ...overrides,
});

describe('ExperienceService', () => {
  it('returns all experiences from the repository', async () => {
    const experiences = [createExperienceDocument()];
    const repository = {
      findAll: async () => experiences,
    } as unknown as ExperienceRepository;

    const result = await new ExperienceService(repository).getAllExperiences();

    assert.equal(result, experiences);
  });

  it('returns an experience by id', async () => {
    const experience = createExperienceDocument();
    const repository = {
      findById: async (id: string) => (id === '507f1f77bcf86cd799439011' ? experience : null),
    } as unknown as ExperienceRepository;

    const result = await new ExperienceService(repository).getExperienceById(
      '507f1f77bcf86cd799439011'
    );

    assert.equal(result, experience);
  });

  it('throws when an experience id is not found', async () => {
    const repository = {
      findById: async () => null,
    } as unknown as ExperienceRepository;

    await assert.rejects(
      () => new ExperienceService(repository).getExperienceById('missing-id'),
      /Experience not found/
    );
  });

  it('creates an experience through the repository', async () => {
    let createdPayload: Record<string, unknown> | undefined;
    const created = createExperienceDocument();
    const repository = {
      create: async (payload: Record<string, unknown>) => {
        createdPayload = payload;
        return created;
      },
    } as unknown as ExperienceRepository;

    const result = await new ExperienceService(repository).createExperience({
      title: 'Exposición en el Museo de Bellas Artes',
      date: new Date('2020-06-01'),
      description: 'Muestra individual',
    });

    assert.equal(result, created);
    assert.ok(createdPayload);
    assert.equal(createdPayload.title, 'Exposición en el Museo de Bellas Artes');
  });

  it('updates an experience', async () => {
    const updated = createExperienceDocument({ title: 'Updated title' });
    const repository = {
      update: async () => updated,
    } as unknown as ExperienceRepository;

    const result = await new ExperienceService(repository).updateExperience(
      '507f1f77bcf86cd799439011',
      { title: 'Updated title' }
    );

    assert.equal(result, updated);
  });

  it('throws when updating a missing experience', async () => {
    const repository = {
      update: async () => null,
    } as unknown as ExperienceRepository;

    await assert.rejects(
      () => new ExperienceService(repository).updateExperience('missing-id', { title: 'X' }),
      /Experience not found/
    );
  });

  it('deletes an experience by id', async () => {
    const experience = createExperienceDocument();
    const repository = {
      delete: async () => experience,
    } as unknown as ExperienceRepository;

    const result = await new ExperienceService(repository).deleteExperience(
      '507f1f77bcf86cd799439011'
    );

    assert.equal(result, experience);
  });

  it('throws when deleting a missing experience', async () => {
    const repository = {
      delete: async () => null,
    } as unknown as ExperienceRepository;

    await assert.rejects(
      () => new ExperienceService(repository).deleteExperience('missing-id'),
      /Experience not found/
    );
  });
});
