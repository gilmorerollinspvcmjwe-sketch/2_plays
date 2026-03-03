import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${new Date().toISOString()}`);
    console.error(`Status: ${statusCode}`);
    console.error(`Message: ${message}`);
    console.error(`Stack: ${err.stack}`);
    console.error(`Path: ${req.originalUrl}`);
    console.error(`Method: ${req.method}`);
  }

  if (err.name === 'ValidationError') {
    const validationErrors = err as ValidationError[];
    res.status(400).json({
      success: false,
      message: '验证失败',
      errors: validationErrors.map((error) => ({
        field: (error as any).path,
        message: error.msg,
      })),
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export class HttpError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'HttpError';

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = '请求无效') {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = '未授权') {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = '禁止访问') {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = '资源不存在') {
    super(404, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = '服务器内部错误') {
    super(500, message);
  }
}
