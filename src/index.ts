import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './config/logger';
import { requestLogger } from './middlewares/request-logger.middleware';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import experienceRoutes from './routes/experience.routes';
import uploadsRoutes from './routes/uploads.routes';
import { notFound, errorHandler } from './middlewares/error.middleware';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(requestLogger);

// Ensure MongoDB is connected before handling any request. The connection is
// cached, so it's opened once per (cold) instance and reused across requests —
// this is what makes the app work on serverless platforms like Vercel.
let dbReady: Promise<void> | null = null;
app.use(async (req, res, next) => {
  try {
    if (!dbReady) dbReady = connectDB();
    await dbReady;
    next();
  } catch (err) {
    dbReady = null; // let the next request retry the connection
    next(err);
  }
});

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/uploads', uploadsRoutes);

// 404 + global error handler (must be registered after the routes)
app.use(notFound);
app.use(errorHandler);

// Long-running server for local dev / non-serverless hosts. On Vercel the app
// is invoked as a serverless function via the default export below, so we must
// NOT call app.listen there (Vercel sets the VERCEL env var).
if (!process.env.VERCEL) {
  const startServer = async () => {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT, env: env.NODE_ENV },
        `🚀 Server running on http://localhost:${env.PORT}`
      );
    });
  };

  startServer().catch((err) => {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  });
}

export default app;
