import { Request, Response } from 'express';
import { success } from '../../utils/response';
import {
  getOverallStats,
  getSatisfactionStats,
  getFAQCategoryStats,
  getAgentPerformanceStats,
  getAdminTodo,
  getOverdueWorkOrders,
} from './admin.service';

export async function getStats(req: Request, res: Response) {
  const { startDate, endDate } = req.query;
  const stats = await getOverallStats({
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  });
  return success(res, stats, '查询成功');
}

export async function getSatisfaction(req: Request, res: Response) {
  const stats = await getSatisfactionStats();
  return success(res, stats, '查询成功');
}

export async function getFAQCategories(req: Request, res: Response) {
  const stats = await getFAQCategoryStats();
  return success(res, stats, '查询成功');
}

export async function getAgentPerformance(req: Request, res: Response) {
  const stats = await getAgentPerformanceStats();
  return success(res, stats, '查询成功');
}

export async function getTodo(req: Request, res: Response) {
  const { agentId } = req.params;
  const todo = await getAdminTodo(agentId);
  return success(res, todo, '查询成功');
}

export async function getOverdue(req: Request, res: Response) {
  const { agentId } = req.query;
  const result = await getOverdueWorkOrders(agentId as string | undefined);
  return success(res, result, '查询成功');
}
