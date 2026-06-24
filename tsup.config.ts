import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  clean: true,
  minify: true,
  sourcemap: true,
  splitting: false,
  // pino resolves transports/serializers via dynamic requires that a bundler
  // can't statically follow — keep it external and load from node_modules.
  external: ['pino', 'pino-pretty'],
});
