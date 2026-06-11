import { z } from 'zod';
import { ConsultCategory, Priority, ServiceChannel } from '../../constants/enums';

export const createConsultationSchema = z.object({
  tenantId: z.string().min(1, '租客ID不能为空'),
  propertyId: z.string().optional(),
  agentId: z.string().optional(),
  category: z.nativeEnum(ConsultCategory),
  question: z.string().min(1, '咨询内容不能为空'),
  priority: z.nativeEnum(Priority).default(Priority.NORMAL),
  channel: z.nativeEnum(ServiceChannel).default(ServiceChannel.ONLINE_CHAT),
});

export const updateConsultationSchema = z.object({
  answer: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.nativeEnum(Priority).optional(),
  satisfaction: z.number().int().min(1).max(5).optional(),
  agentId: z.string().optional(),
});

export const queryConsultationSchema = z.object({
  tenantId: z.string().optional(),
  propertyId: z.string().optional(),
  agentId: z.string().optional(),
  category: z.nativeEnum(ConsultCategory).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.nativeEnum(Priority).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
});
