"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.asyncHandler = exports.validateParams = exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.body);
            req.body = result;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
exports.validateRequest = validateRequest;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.params);
            req.params = result;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
exports.validateParams = validateParams;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const sendSuccess = (res, data, message) => {
    res.json({
        success: true,
        data,
        message,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error, statusCode = 500) => {
    res.status(statusCode).json({
        success: false,
        error,
    });
};
exports.sendError = sendError;
//# sourceMappingURL=validation.js.map