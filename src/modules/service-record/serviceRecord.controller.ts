import { Request, Response } from 'express';
import { success, fail } from '../../utils/response';
import { buildPagination } from '../../middleware/paginate';
import {
  createServiceRecord,
  getServiceRecords,
  getServiceRecordById,
  getTenantServiceProfile,
  mergeTenantRecords,
} from './serviceRecord.service';
import { ServiceType, ServiceChannel } from '../../constants/enums';

export async function create(req: Request, res: Response) {
  const record = await createServiceRecord(req.body);
  return success(res, record, '创建成功');
}

export async function list(req: Request, res: Response) {
  const { tenantId, type, channel } = req.query;
  const { skip, take, page, pageSize } = req.pagination!;

  const { records, total } = await getServiceRecords(
    tenantId as string,
    type as ServiceType,
    channel as ServiceChannel,
    skip,
    take
  );

  return success(res, records, '查询成功', buildPagination(page, pageSize, total));
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const record = await getServiceRecordById(id);
  if (!record) {
    return fail(res, '记录不存在', 404);
  }
  return success(res, record, '查询成功');
}

export async function getTenantProfile(req: Request, res: Response) {
  const { tenantId } = req.params;
  const profile = await getTenantServiceProfile(tenantId);
  if (!profile) {
    return fail(res, '租客不存在', 404);
  }
  return success(res, profile, '查询成功');
}

export async function mergeRecords(req: Request, res: Response) {
  const { primaryTenantId, secondaryTenantIds } = req.body;
  if (!primaryTenantId || !secondaryTenantIds?.length) {
    return fail(res, '参数不完整', 400);
  }
  const result = await mergeTenantRecords(primaryTenantId, secondaryTenantIds);
  return success(res, result, '合并成功');
}
