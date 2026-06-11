import prisma from '../../lib/prisma';
import { ConsultCategory, ConsultStatus, Priority, ServiceChannel } from '../../constants/enums';

interface CreateConsultationInput {
  tenantId: string;
  propertyId?: string;
  agentId?: string;
  category: ConsultCategory;
  question: string;
  priority: Priority;
  channel: ServiceChannel;
}

interface UpdateConsultationInput {
  answer?: string;
  status?: ConsultStatus;
  priority?: Priority;
  satisfaction?: number;
  agentId?: string;
}

interface QueryConsultationInput {
  tenantId?: string;
  propertyId?: string;
  agentId?: string;
  category?: ConsultCategory;
  status?: ConsultStatus;
  priority?: Priority;
  skip?: number;
  take?: number;
}

export async function createConsultation(data: CreateConsultationInput) {
  return prisma.$transaction(async (tx) => {
    const serviceRecord = await tx.serviceRecord.create({
      data: {
        tenantId: data.tenantId,
        type: 'CONSULTATION',
        channel: data.channel,
        title: `咨询: ${data.category}`,
        content: data.question,
        createdById: data.agentId,
      },
    });

    const consultation = await tx.consultation.create({
      data: {
        serviceRecordId: serviceRecord.id,
        tenantId: data.tenantId,
        propertyId: data.propertyId,
        agentId: data.agentId,
        category: data.category,
        question: data.question,
        priority: data.priority,
        status: 'OPEN',
      },
      include: {
        serviceRecord: true,
        tenant: { select: { id: true, name: true, phone: true } },
        property: true,
        agent: { select: { id: true, name: true } },
      },
    });

    return consultation;
  });
}

export async function getConsultations(params: QueryConsultationInput) {
  const { skip = 0, take = 10, ...whereParams } = params;

  const where: any = {};
  if (whereParams.tenantId) where.tenantId = whereParams.tenantId;
  if (whereParams.propertyId) where.propertyId = whereParams.propertyId;
  if (whereParams.agentId) where.agentId = whereParams.agentId;
  if (whereParams.category) where.category = whereParams.category;
  if (whereParams.status) where.status = whereParams.status;
  if (whereParams.priority) where.priority = whereParams.priority;

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true, propertyNo: true } },
        agent: { select: { id: true, name: true } },
      },
    }),
    prisma.consultation.count({ where }),
  ]);

  return { consultations, total };
}

export async function getConsultationById(id: string) {
  return prisma.consultation.findUnique({
    where: { id },
    include: {
      serviceRecord: true,
      tenant: true,
      property: true,
      agent: true,
    },
  });
}

export async function updateConsultation(id: string, data: UpdateConsultationInput) {
  const consultation = await prisma.consultation.findUnique({ where: { id } });
  if (!consultation) return null;

  const updateData: any = { ...data };
  
  if (data.status === 'RESOLVED' && !consultation.resolvedAt) {
    updateData.resolvedAt = new Date();
  }

  return prisma.consultation.update({
    where: { id },
    data: updateData,
    include: {
      tenant: { select: { id: true, name: true, phone: true } },
      property: true,
      agent: { select: { id: true, name: true } },
    },
  });
}
