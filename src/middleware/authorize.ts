import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors';
import { AuthenticatedRequest } from '../types';

export function authorize(resourceOwnership: (req: AuthenticatedRequest) => Promise<boolean> | boolean) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const isOwner = await resourceOwnership(req);
      if (!isOwner) {
        throw new ForbiddenError('You do not have permission to perform this action');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
