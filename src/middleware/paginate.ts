import { Request, Response, NextFunction } from 'express';

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
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(
      parseInt(req.query.pageSize as string) || defaultPageSize,
      maxPageSize
    );
    
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
