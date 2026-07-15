import { Response, NextFunction } from 'express';
import { postService } from './service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../types';
import { uploadFile } from '../../services/s3';

async function processImage(file: Express.Multer.File | undefined): Promise<string | undefined> {
  if (!file) return undefined;
  const ext = file.originalname ? '.' + file.originalname.split('.').pop() : '';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  await uploadFile(file.buffer, filename, file.mimetype);
  return filename;
}

export const postController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const image = await processImage(req.file);
      const post = await postService.create(req.user!.id, req.body, image);
      sendSuccess(res, post, 'Post created', 201);
    } catch (error) {
      next(error);
    }
  },

  getFeed: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await postService.getFeed(req.user!.id, cursor, limit);
      sendSuccess(res, result, 'Feed retrieved');
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await postService.getById(req.params.id as string, req.user!.id);
      sendSuccess(res, post, 'Post retrieved');
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const image = await processImage(req.file);
      const post = await postService.update(req.params.id as string, req.user!.id, req.body, image);
      sendSuccess(res, post, 'Post updated');
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await postService.delete(req.params.id as string, req.user!.id);
      sendSuccess(res, null, 'Post deleted');
    } catch (error) {
      next(error);
    }
  },
};
