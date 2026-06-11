import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response';

export interface PaginationQuery {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationQuery;
    }
  }
}

export function paginate(defaultPageSize: number = 10, maxPageSize: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const pageStr = req.query.page as string | undefined;
    const pageSizeStr = req.query.pageSize as string | undefined;

    let page = 1;
    if (pageStr !== undefined) {
      const parsed = parseInt(pageStr, 10);
      if (isNaN(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
        return fail(res, 'page 参数必须是正整数', 400);
      }
      page = parsed;
    }

    let pageSize = defaultPageSize;
    if (pageSizeStr !== undefined) {
      const parsed = parseInt(pageSizeStr, 10);
      if (isNaN(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
        return fail(res, 'pageSize 参数必须是正整数', 400);
      }
      pageSize = Math.min(parsed, maxPageSize);
    }

    req.pagination = {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
      take: pageSize,
    };

    next();
  };
}

export function buildPagination(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
