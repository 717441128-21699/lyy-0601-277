import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
    code: 404,
  });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err);
  
  if (err.code === 'P2002') {
    return fail(res, '数据已存在，唯一约束冲突', 409);
  }
  if (err.code === 'P2025') {
    return fail(res, '记录不存在', 404);
  }
  
  return error(res, err.message || '服务器内部错误', 500);
}

function fail(res: Response, message: string, code: number) {
  return res.status(code).json({
    success: false,
    message,
    code,
  });
}
