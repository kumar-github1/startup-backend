import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export interface TypedRequest<T = any> extends Request {
    body: T;
}
export interface TypedResponse<T = any> extends Response {
    json: (body: T) => this;
}
export declare const validateRequest: <T>(schema: z.ZodSchema<T>) => (req: TypedRequest<T>, res: Response, next: NextFunction) => void;
export declare const validateParams: <T>(schema: z.ZodSchema<T>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export declare const sendSuccess: <T>(res: Response, data: T, message?: string) => void;
export declare const sendError: (res: Response, error: string, statusCode?: number) => void;
//# sourceMappingURL=validation.d.ts.map