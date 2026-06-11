import { Request, Response } from 'express';
import { success, fail } from '../../utils/response';
import { buildPagination } from '../../middleware/paginate';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignComplaint,
  getRepeatComplaintAlerts,
} from './complaint.service';
import { ComplaintCategory, ComplaintStatus, Priority } from '../../constants/enums';

export async function create(req: Request, res: Response) {
  const complaint = await createComplaint(req.body);
  return success(res, complaint, '投诉登记成功');
}

export async function list(req: Request, res: Response) {
  const { tenantId, propertyId, handlingAgentId, category, status, priority, isRepeat } = req.query;
  const { skip, take, page, pageSize } = req.pagination!;

  const { complaints, total } = await getComplaints({
    tenantId: tenantId as string,
    propertyId: propertyId as string,
    handlingAgentId: handlingAgentId as string,
    category: category as ComplaintCategory,
    status: status as ComplaintStatus,
    priority: priority as Priority,
    isRepeat: isRepeat === 'true',
    skip,
    take,
  });

  return success(res, complaints, '查询成功', buildPagination(page, pageSize, total));
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const complaint = await getComplaintById(id);
  if (!complaint) {
    return fail(res, '投诉记录不存在', 404);
  }
  return success(res, complaint, '查询成功');
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const complaint = await updateComplaint(id, req.body);
  if (!complaint) {
    return fail(res, '投诉记录不存在', 404);
  }
  return success(res, complaint, '更新成功');
}

export async function assign(req: Request, res: Response) {
  const { id } = req.params;
  const { agentId } = req.body;
  if (!agentId) {
    return fail(res, '客服ID不能为空', 400);
  }
  const complaint = await assignComplaint(id, agentId);
  return success(res, complaint, '分派成功');
}

export async function getRepeatAlerts(req: Request, res: Response) {
  const { tenantId } = req.params;
  const alerts = await getRepeatComplaintAlerts(tenantId);
  return success(res, alerts, '查询成功');
}
