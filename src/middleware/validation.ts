import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface TypedRequest<T = any> extends Request {
  body: T;
}

export interface TypedResponse<T = any> extends Response {
  json: (body: T) => this;
}

export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (req: TypedRequest<T>, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.params);
      req.params = result as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid parameters',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string): void => {
  res.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
};

export const sendError = (res: Response, error: string, statusCode = 500): void => {
  res.status(statusCode).json({
    success: false,
    error,
  } as ApiResponse);
};