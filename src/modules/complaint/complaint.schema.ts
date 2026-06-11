import { z } from 'zod';
import { ComplaintCategory, ComplaintType, Priority, ComplaintStatus, ResponsibleParty, ServiceChannel } from '../../constants/enums';

export const createComplaintSchema = z.object({
  tenantId: z.string().min(1, '租客ID不能为空'),
  propertyId: z.string().optional(),
  handlingAgentId: z.string().optional(),
  category: z.nativeEnum(ComplaintCategory),
  type: z.nativeEnum(ComplaintType).default(ComplaintType.INFORMAL),
  priority: z.nativeEnum(Priority).default(Priority.NORMAL),
  subject: z.string().min(1, '投诉主题不能为空'),
  description: z.string().min(1, '投诉描述不能为空'),
  responsibleParty: z.nativeEnum(ResponsibleParty).optional(),
  promisedDeadline: z.string().optional(),
  channel: z.nativeEnum(ServiceChannel).default(ServiceChannel.PHONE),
});

export const updateComplaintSchema = z.object({
  category: z.nativeEnum(ComplaintCategory).optional(),
  type: z.nativeEnum(ComplaintType).optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(ComplaintStatus).optional(),
  subject: z.string().optional(),
  description: z.string().optional(),
  responsibleParty: z.nativeEnum(ResponsibleParty).optional(),
  promisedDeadline: z.string().optional(),
  satisfaction: z.number().int().min(1).max(5).optional(),
  handlingAgentId: z.string().optional(),
  resolvedAt: z.string().optional(),
});

export const queryComplaintSchema = z.object({
  tenantId: z.string().optional(),
  propertyId: z.string().optional(),
  handlingAgentId: z.string().optional(),
  category: z.nativeEnum(ComplaintCategory).optional(),
  status: z.nativeEnum(ComplaintStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  isRepeat: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});
