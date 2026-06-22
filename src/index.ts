import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  });
};

startServer();
