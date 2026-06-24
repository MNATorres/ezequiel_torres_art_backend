import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './config/logger';
import { requestLogger } from './middlewares/request-logger.middleware';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(requestLogger);

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import experienceRoutes from './routes/experience.routes';
import uploadsRoutes from './routes/uploads.routes';
import { UPLOAD_DIR } from './middlewares/upload.middleware';
import { notFound, errorHandler } from './middlewares/error.middleware';

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve uploaded files. CORP cross-origin lets other origins (the manager /
// public site) embed the images via <img>.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  })
);

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/uploads', uploadsRoutes);

// 404 + global error handler (must be registered after the routes)
app.use(notFound);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `🚀 Server running on http://localhost:${env.PORT}`
    );
  });
};

startServer();
