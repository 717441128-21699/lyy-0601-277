import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  code?: number;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function success<T>(
  res: Response,
  data?: T,
  message: string = '操作成功',
  pagination?: ApiResponse['pagination']
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  if (pagination) {
    response.pagination = pagination;
  }
  return res.json(response);
}

export function fail(res: Response, message: string = '操作失败', code: number = 400) {
  return res.status(code).json({
    success: false,
    message,
    code,
  });
}

export function error(res: Response, message: string = '服务器内部错误', code: number = 500) {
  return res.status(code).json({
    success: false,
    message,
    code,
  });
}
