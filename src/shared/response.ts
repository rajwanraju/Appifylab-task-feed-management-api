import { Response } from 'express';
import { transformImageUrls } from '../utils/image-url';

interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data: data !== null && typeof data === 'object' ? (transformImageUrls(data) as T) : data,
  };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: string[]): void {
  const response: ErrorResponse = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  res.status(statusCode).json(response);
}
