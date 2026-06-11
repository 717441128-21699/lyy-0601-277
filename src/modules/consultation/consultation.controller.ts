import { Request, Response } from 'express';
import { success, fail } from '../../utils/response';
import { buildPagination } from '../../middleware/paginate';
import {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
} from './consultation.service';
import { ConsultCategory, ConsultStatus, Priority } from '../../constants/enums';

export async function create(req: Request, res: Response) {
  const consultation = await createConsultation(req.body);
  return success(res, consultation, '创建咨询成功');
}

export async function list(req: Request, res: Response) {
  const { tenantId, propertyId, agentId, category, status, priority } = req.query;
  const { skip, take, page, pageSize } = req.pagination!;

  const { consultations, total } = await getConsultations({
    tenantId: tenantId as string,
    propertyId: propertyId as string,
    agentId: agentId as string,
    category: category as ConsultCategory,
    status: status as ConsultStatus,
    priority: priority as Priority,
    skip,
    take,
  });

  return success(res, consultations, '查询成功', buildPagination(page, pageSize, total));
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const consultation = await getConsultationById(id);
  if (!consultation) {
    return fail(res, '咨询记录不存在', 404);
  }
  return success(res, consultation, '查询成功');
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const consultation = await updateConsultation(id, req.body);
  if (!consultation) {
    return fail(res, '咨询记录不存在', 404);
  }
  return success(res, consultation, '更新成功');
}
