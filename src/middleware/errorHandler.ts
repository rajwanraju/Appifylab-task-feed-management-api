import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../shared/errors';
import { sendError } from '../shared/response';
import { logger } from '../config/logger';
import { config } from '../config';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, path: req.path, method: req.method }, 'Error occurred');

  if (err instanceof ValidationError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  sendError(res, config.env === 'production' ? 'Internal server error' : err.message, 500);
}
