import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => e.message).join('; ');
      return fail(res, `参数验证失败: ${errors || err.message}`, 400);
    }
  };
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return fail(res, `参数验证失败: ${errors || err.message}`, 400);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => e.message).join('; ');
      return fail(res, `参数验证失败: ${errors || err.message}`, 400);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result;
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => e.message).join('; ');
      return fail(res, `参数验证失败: ${errors || err.message}`, 400);
    }
  };
}
