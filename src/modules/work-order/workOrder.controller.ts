import { Request, Response } from 'express';
import { success, fail } from '../../utils/response';
import { buildPagination } from '../../middleware/paginate';
import {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  assignWorkOrder,
  getOverdueWorkOrders,
  getAgentTodoWorkOrders,
} from './workOrder.service';
import { WorkOrderType, WorkOrderCategory, WorkOrderStatus, Priority } from '../../constants/enums';

export async function create(req: Request, res: Response) {
  const workOrder = await createWorkOrder(req.body);
  return success(res, workOrder, '工单创建成功');
}

export async function list(req: Request, res: Response) {
  const {
    tenantId,
    complaintId,
    propertyId,
    assignedAgentId,
    type,
    category,
    status,
    priority,
  } = req.query;
  const { skip, take, page, pageSize } = req.pagination!;

  const { workOrders, total } = await getWorkOrders({
    tenantId: tenantId as string,
    complaintId: complaintId as string,
    propertyId: propertyId as string,
    assignedAgentId: assignedAgentId as string,
    type: type as WorkOrderType,
    category: category as WorkOrderCategory,
    status: status as WorkOrderStatus,
    priority: priority as Priority,
    skip,
    take,
  });

  return success(res, workOrders, '查询成功', buildPagination(page, pageSize, total));
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const workOrder = await getWorkOrderById(id);
  if (!workOrder) {
    return fail(res, '工单不存在', 404);
  }
  return success(res, workOrder, '查询成功');
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const workOrder = await updateWorkOrder(id, req.body);
  if (!workOrder) {
    return fail(res, '工单不存在', 404);
  }
  return success(res, workOrder, '更新成功');
}

export async function assign(req: Request, res: Response) {
  const { id } = req.params;
  const { agentId } = req.body;
  if (!agentId) {
    return fail(res, '客服ID不能为空', 400);
  }
  const workOrder = await assignWorkOrder(id, agentId);
  if (!workOrder) {
    return fail(res, '工单不存在', 404);
  }
  return success(res, workOrder, '分派成功');
}

export async function getOverdue(req: Request, res: Response) {
  const { agentId } = req.query;
  const orders = await getOverdueWorkOrders(agentId as string | undefined);
  return success(res, orders, '查询成功');
}

export async function getAgentTodo(req: Request, res: Response) {
  const { agentId } = req.params;
  const orders = await getAgentTodoWorkOrders(agentId);
  return success(res, orders, '查询成功');
}
