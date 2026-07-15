import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { sendError } from './shared/response';

import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import postRoutes from './modules/posts/routes';
import commentRoutes from './modules/comments/routes';
import replyRoutes from './modules/replies/routes';
import likeRoutes from './modules/likes/routes';
import shareRoutes from './modules/shares/routes';
import savedPostRoutes from './modules/savedPosts/routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later' },
  }),
);

app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', replyRoutes);
app.use('/api', likeRoutes);
app.use('/api', shareRoutes);
app.use('/api', savedPostRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } });
});

app.use((_req, res) => {
  sendError(res, 'Route not found', 404);
});

app.use(errorHandler);

export default app;
