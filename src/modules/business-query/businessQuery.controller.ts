import { Request, Response } from 'express';
import { success, fail } from '../../utils/response';
import { buildPagination } from '../../middleware/paginate';
import {
  checkLeaseValidity,
  getArrearsStatus,
  getMaintenanceHistory,
  getRepeatComplaintAlerts,
  getPropertyStatus,
} from './businessQuery.service';

export async function getLeaseValidity(req: Request, res: Response) {
  const { tenantId } = req.params;
  const result = await checkLeaseValidity(tenantId);
  return success(res, result, '查询成功');
}

export async function getArrears(req: Request, res: Response) {
  const { tenantId } = req.params;
  const result = await getArrearsStatus(tenantId);
  return success(res, result, '查询成功');
}

export async function getMaintenance(req: Request, res: Response) {
  const { propertyId } = req.params;
  const { skip, take, page, pageSize } = req.pagination!;
  const result = await getMaintenanceHistory(propertyId, skip, take);
  return success(
    res,
    result.records,
    '查询成功',
    buildPagination(page, pageSize, result.total)
  );
}

export async function getRepeatComplaints(req: Request, res: Response) {
  const { tenantId } = req.params;
  const result = await getRepeatComplaintAlerts(tenantId);
  return success(res, result, '查询成功');
}

export async function getPropertyStatusById(req: Request, res: Response) {
  const { propertyId } = req.params;
  const result = await getPropertyStatus(propertyId);
  if (!result) {
    return fail(res, '房源不存在', 404);
  }
  return success(res, result, '查询成功');
}
