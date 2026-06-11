import prisma from '../../lib/prisma';
import {
  ComplaintCategory,
  ComplaintType,
  Priority,
  ComplaintStatus,
  ResponsibleParty,
  ServiceChannel,
} from '../../constants/enums';

interface CreateComplaintInput {
  tenantId: string;
  propertyId?: string;
  handlingAgentId?: string;
  category: ComplaintCategory;
  type: ComplaintType;
  priority: Priority;
  subject: string;
  description: string;
  responsibleParty?: ResponsibleParty;
  promisedDeadline?: string;
  channel: ServiceChannel;
}

interface UpdateComplaintInput {
  category?: ComplaintCategory;
  type?: ComplaintType;
  priority?: Priority;
  status?: ComplaintStatus;
  subject?: string;
  description?: string;
  responsibleParty?: ResponsibleParty;
  promisedDeadline?: string;
  satisfaction?: number;
  handlingAgentId?: string;
  resolvedAt?: string;
}

interface QueryComplaintInput {
  tenantId?: string;
  propertyId?: string;
  handlingAgentId?: string;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: Priority;
  isRepeat?: boolean;
  skip?: number;
  take?: number;
}

async function checkRepeatComplaint(tenantId: string, category: ComplaintCategory): Promise<boolean> {
  const recentComplaints = await prisma.complaint.findMany({
    where: {
      tenantId,
      category,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    take: 1,
  });
  return recentComplaints.length > 0;
}

export async function createComplaint(data: CreateComplaintInput) {
  const isRepeat = await checkRepeatComplaint(data.tenantId, data.category);

  return prisma.$transaction(async (tx) => {
    const serviceRecord = await tx.serviceRecord.create({
      data: {
        tenantId: data.tenantId,
        type: 'COMPLAINT',
        channel: data.channel,
        title: `投诉: ${data.subject}`,
        content: data.description,
        createdById: data.handlingAgentId,
      },
    });

    const complaint = await tx.complaint.create({
      data: {
        serviceRecordId: serviceRecord.id,
        tenantId: data.tenantId,
        propertyId: data.propertyId,
        handlingAgentId: data.handlingAgentId,
        category: data.category,
        type: data.type,
        priority: data.priority,
        status: 'RECEIVED',
        subject: data.subject,
        description: data.description,
        responsibleParty: data.responsibleParty,
        promisedDeadline: data.promisedDeadline ? new Date(data.promisedDeadline) : undefined,
        isRepeat,
      },
      include: {
        serviceRecord: true,
        tenant: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true, propertyNo: true } },
        handlingAgent: { select: { id: true, name: true } },
      },
    });

    return complaint;
  });
}

export async function getComplaints(params: QueryComplaintInput) {
  const { skip = 0, take = 10, ...whereParams } = params;

  const where: any = {};
  if (whereParams.tenantId) where.tenantId = whereParams.tenantId;
  if (whereParams.propertyId) where.propertyId = whereParams.propertyId;
  if (whereParams.handlingAgentId) where.handlingAgentId = whereParams.handlingAgentId;
  if (whereParams.category) where.category = whereParams.category;
  if (whereParams.status) where.status = whereParams.status;
  if (whereParams.priority) where.priority = whereParams.priority;
  if (whereParams.isRepeat !== undefined) where.isRepeat = whereParams.isRepeat;

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true, propertyNo: true } },
        handlingAgent: { select: { id: true, name: true } },
        workOrders: {
          select: { id: true, status: true, title: true },
        },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return { complaints, total };
}

export async function getComplaintById(id: string) {
  return prisma.complaint.findUnique({
    where: { id },
    include: {
      serviceRecord: true,
      tenant: true,
      property: true,
      handlingAgent: true,
      workOrders: true,
      relatedComplaints: true,
    },
  });
}

export async function updateComplaint(id: string, data: UpdateComplaintInput) {
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) return null;

  const updateData: any = { ...data };
  
  if (data.promisedDeadline) {
    updateData.promisedDeadline = new Date(data.promisedDeadline);
  }
  
  if (data.status === 'RESOLVED' && !complaint.resolvedAt) {
    updateData.resolvedAt = new Date();
  }

  return prisma.complaint.update({
    where: { id },
    data: updateData,
    include: {
      tenant: { select: { id: true, name: true, phone: true } },
      property: { select: { id: true, title: true } },
      handlingAgent: { select: { id: true, name: true } },
    },
  });
}

export async function assignComplaint(id: string, agentId: string) {
  return prisma.complaint.update({
    where: { id },
    data: {
      handlingAgentId: agentId,
      status: 'ASSIGNED',
    },
    include: {
      handlingAgent: { select: { id: true, name: true } },
    },
  });
}

export async function getRepeatComplaintAlerts(tenantId: string) {
  const complaints = await prisma.complaint.findMany({
    where: {
      tenantId,
      isRepeat: true,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      relatedComplaint: true,
    },
  });
  return complaints;
}
