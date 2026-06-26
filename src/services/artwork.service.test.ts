import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ArtworkService } from './artwork.service';
import { ArtworkRepository } from '../repositories/artwork.repository';

const createArtworkDocument = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  title: 'Murales Humanos',
  description: 'Cada pincelada transforma la piel en una obra maestra respirante',
  imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/murales.png',
  order: 0,
  ...overrides,
});

describe('ArtworkService', () => {
  it('returns all artworks from the repository', async () => {
    const artworks = [createArtworkDocument()];
    const repository = {
      findAll: async () => artworks,
    } as unknown as ArtworkRepository;

    const result = await new ArtworkService(repository).getAllArtworks();

    assert.equal(result, artworks);
  });

  it('returns an artwork by id', async () => {
    const artwork = createArtworkDocument();
    const repository = {
      findById: async (id: string) => (id === '507f1f77bcf86cd799439011' ? artwork : null),
    } as unknown as ArtworkRepository;

    const result = await new ArtworkService(repository).getArtworkById('507f1f77bcf86cd799439011');

    assert.equal(result, artwork);
  });

  it('throws when an artwork id is not found', async () => {
    const repository = {
      findById: async () => null,
    } as unknown as ArtworkRepository;

    await assert.rejects(
      () => new ArtworkService(repository).getArtworkById('missing-id'),
      /Artwork not found/
    );
  });

  it('creates an artwork through the repository', async () => {
    let createdPayload: Record<string, unknown> | undefined;
    const created = createArtworkDocument();
    const repository = {
      create: async (payload: Record<string, unknown>) => {
        createdPayload = payload;
        return created;
      },
    } as unknown as ArtworkRepository;

    const result = await new ArtworkService(repository).createArtwork({
      title: 'Identidad e Ilusión',
      description: 'Técnicas avanzadas de pintura corporal',
      order: 1,
    });

    assert.equal(result, created);
    assert.ok(createdPayload);
    assert.equal(createdPayload.title, 'Identidad e Ilusión');
  });

  it('updates an artwork', async () => {
    const updated = createArtworkDocument({ title: 'Updated title' });
    const repository = {
      update: async () => updated,
    } as unknown as ArtworkRepository;

    const result = await new ArtworkService(repository).updateArtwork('507f1f77bcf86cd799439011', {
      title: 'Updated title',
    });

    assert.equal(result, updated);
  });

  it('throws when updating a missing artwork', async () => {
    const repository = {
      update: async () => null,
    } as unknown as ArtworkRepository;

    await assert.rejects(
      () => new ArtworkService(repository).updateArtwork('missing-id', { title: 'X' }),
      /Artwork not found/
    );
  });

  it('deletes an artwork by id', async () => {
    const artwork = createArtworkDocument();
    const repository = {
      delete: async () => artwork,
    } as unknown as ArtworkRepository;

    const result = await new ArtworkService(repository).deleteArtwork('507f1f77bcf86cd799439011');

    assert.equal(result, artwork);
  });

  it('throws when deleting a missing artwork', async () => {
    const repository = {
      delete: async () => null,
    } as unknown as ArtworkRepository;

    await assert.rejects(
      () => new ArtworkService(repository).deleteArtwork('missing-id'),
      /Artwork not found/
    );
  });
});
