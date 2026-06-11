import { z } from 'zod';
import { WorkOrderType, WorkOrderCategory, Priority, WorkOrderStatus, FeedbackResult, ServiceChannel } from '../../constants/enums';

export const createWorkOrderSchema = z.object({
  tenantId: z.string().min(1, '租客ID不能为空'),
  complaintId: z.string().optional(),
  propertyId: z.string().optional(),
  assignedAgentId: z.string().optional(),
  title: z.string().min(1, '工单标题不能为空'),
  description: z.string().min(1, '工单描述不能为空'),
  type: z.nativeEnum(WorkOrderType),
  category: z.nativeEnum(WorkOrderCategory),
  priority: z.nativeEnum(Priority).default(Priority.NORMAL),
  promisedDeadline: z.string().optional(),
  channel: z.nativeEnum(ServiceChannel).default(ServiceChannel.PHONE),
});

export const updateWorkOrderSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(WorkOrderType).optional(),
  category: z.nativeEnum(WorkOrderCategory).optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(WorkOrderStatus).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  promisedDeadline: z.string().optional(),
  actualCompletion: z.string().optional(),
  satisfaction: z.number().int().min(1).max(5).optional(),
  feedbackResult: z.nativeEnum(FeedbackResult).optional(),
  followUpRequired: z.boolean().optional(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  remarks: z.string().optional(),
});

export const assignWorkOrderSchema = z.object({
  agentId: z.string().min(1, '客服ID不能为空'),
});

export const queryWorkOrderSchema = z.object({
  tenantId: z.string().optional(),
  complaintId: z.string().optional(),
  propertyId: z.string().optional(),
  assignedAgentId: z.string().optional(),
  type: z.nativeEnum(WorkOrderType).optional(),
  category: z.nativeEnum(WorkOrderCategory).optional(),
  status: z.nativeEnum(WorkOrderStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});
