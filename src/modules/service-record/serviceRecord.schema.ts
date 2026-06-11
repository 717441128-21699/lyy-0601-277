import { z } from 'zod';
import { ServiceType, ServiceChannel } from '../../constants/enums';

export const createServiceRecordSchema = z.object({
  tenantId: z.string().min(1, '租客ID不能为空'),
  type: z.nativeEnum(ServiceType),
  channel: z.nativeEnum(ServiceChannel),
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  sourceId: z.string().optional(),
  createdById: z.string().optional(),
});

export const queryServiceRecordSchema = z.object({
  tenantId: z.string().optional(),
  type: z.nativeEnum(ServiceType).optional(),
  channel: z.nativeEnum(ServiceChannel).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export const getTenantProfileSchema = z.object({
  tenantId: z.string().min(1, '租客ID不能为空'),
});
