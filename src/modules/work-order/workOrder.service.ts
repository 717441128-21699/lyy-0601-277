import prisma from '../../lib/prisma';
import {
  WorkOrderType,
  WorkOrderCategory,
  Priority,
  WorkOrderStatus,
  FeedbackResult,
  ServiceChannel,
} from '../../constants/enums';

interface CreateWorkOrderInput {
  tenantId: string;
  complaintId?: string;
  propertyId?: string;
  assignedAgentId?: string;
  title: string;
  description: string;
  type: WorkOrderType;
  category: WorkOrderCategory;
  priority: Priority;
  promisedDeadline?: string;
  channel: ServiceChannel;
}

interface UpdateWorkOrderInput {
  title?: string;
  description?: string;
  type?: WorkOrderType;
  category?: WorkOrderCategory;
  priority?: Priority;
  status?: WorkOrderStatus;
  progress?: number;
  promisedDeadline?: string;
  actualCompletion?: string;
  satisfaction?: number;
  feedbackResult?: FeedbackResult;
  followUpRequired?: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  remarks?: string;
}

interface QueryWorkOrderInput {
  tenantId?: string;
  complaintId?: string;
  propertyId?: string;
  assignedAgentId?: string;
  type?: WorkOrderType;
  category?: WorkOrderCategory;
  status?: WorkOrderStatus;
  priority?: Priority;
  skip?: number;
  take?: number;
}

export async function createWorkOrder(data: CreateWorkOrderInput) {
  return prisma.$transaction(async (tx) => {
    const serviceRecord = await tx.serviceRecord.create({
      data: {
        tenantId: data.tenantId,
        type: 'WORK_ORDER',
        channel: data.channel,
        title: `工单: ${data.title}`,
        content: data.description,
      },
    });

    const workOrder = await tx.workOrder.create({
      data: {
        serviceRecordId: serviceRecord.id,
        tenantId: data.tenantId,
        complaintId: data.complaintId,
        propertyId: data.propertyId,
        assignedAgentId: data.assignedAgentId,
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        priority: data.priority,
        status: 'CREATED',
        progress: 0,
        promisedDeadline: data.promisedDeadline ? new Date(data.promisedDeadline) : undefined,
      },
      include: {
        serviceRecord: true,
        tenant: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true, propertyNo: true } },
        assignedAgent: { select: { id: true, name: true } },
        complaint: { select: { id: true, subject: true } },
      },
    });

    await tx.workOrderStatusLog.create({
      data: {
        workOrderId: workOrder.id,
        toStatus: 'CREATED',
        remarks: '工单创建',
      },
    });

    return workOrder;
  });
}

export async function getWorkOrders(params: QueryWorkOrderInput) {
  const { skip = 0, take = 10, ...whereParams } = params;

  const where: any = {};
  if (whereParams.tenantId) where.tenantId = whereParams.tenantId;
  if (whereParams.complaintId) where.complaintId = whereParams.complaintId;
  if (whereParams.propertyId) where.propertyId = whereParams.propertyId;
  if (whereParams.assignedAgentId) where.assignedAgentId = whereParams.assignedAgentId;
  if (whereParams.type) where.type = whereParams.type;
  if (whereParams.category) where.category = whereParams.category;
  if (whereParams.status) where.status = whereParams.status;
  if (whereParams.priority) where.priority = whereParams.priority;

  const [workOrders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true, propertyNo: true } },
        assignedAgent: { select: { id: true, name: true } },
        complaint: { select: { id: true, subject: true } },
      },
    }),
    prisma.workOrder.count({ where }),
  ]);

  return { workOrders, total };
}

export async function getWorkOrderById(id: string) {
  return prisma.workOrder.findUnique({
    where: { id },
    include: {
      serviceRecord: true,
      tenant: true,
      property: true,
      assignedAgent: true,
      complaint: true,
      statusLogs: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function updateWorkOrder(id: string, data: UpdateWorkOrderInput, operatorId?: string) {
  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) return null;

  const updateData: any = {};
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.progress !== undefined) updateData.progress = data.progress;
  if (data.promisedDeadline !== undefined) updateData.promisedDeadline = new Date(data.promisedDeadline);
  if (data.actualCompletion !== undefined) updateData.actualCompletion = new Date(data.actualCompletion);
  if (data.satisfaction !== undefined) updateData.satisfaction = data.satisfaction;
  if (data.feedbackResult !== undefined) updateData.feedbackResult = data.feedbackResult;
  if (data.followUpRequired !== undefined) updateData.followUpRequired = data.followUpRequired;
  if (data.followUpDate !== undefined) updateData.followUpDate = new Date(data.followUpDate);
  if (data.followUpNotes !== undefined) updateData.followUpNotes = data.followUpNotes;

  if (data.status && data.status !== workOrder.status) {
    updateData.status = data.status;

    if ((data.status === 'RESOLVED' || data.status === 'COMPLETED') && !workOrder.actualCompletion) {
      updateData.actualCompletion = new Date();
    }

    await prisma.workOrderStatusLog.create({
      data: {
        workOrderId: id,
        fromStatus: workOrder.status,
        toStatus: data.status,
        progress: data.progress,
        remarks: data.remarks,
        operatorId,
      },
    });
  } else if (data.progress !== undefined || data.remarks) {
    await prisma.workOrderStatusLog.create({
      data: {
        workOrderId: id,
        progress: data.progress,
        remarks: data.remarks,
        operatorId,
      },
    });
  }

  return prisma.workOrder.update({
    where: { id },
    data: updateData,
    include: {
      tenant: { select: { id: true, name: true, phone: true } },
      property: { select: { id: true, title: true } },
      assignedAgent: { select: { id: true, name: true } },
      statusLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function assignWorkOrder(id: string, agentId: string) {
  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) return null;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.workOrder.update({
      where: { id },
      data: {
        assignedAgentId: agentId,
        status: 'ASSIGNED',
      },
      include: {
        assignedAgent: { select: { id: true, name: true } },
      },
    });

    await tx.workOrderStatusLog.create({
      data: {
        workOrderId: id,
        fromStatus: workOrder.status,
        toStatus: 'ASSIGNED' as WorkOrderStatus,
        remarks: `分派给客服: ${agentId}`,
      },
    });

    return updated;
  });
}

export async function getOverdueWorkOrders(agentId?: string) {
  const now = new Date();
  const where: any = {
    promisedDeadline: {
      lt: now,
    },
    status: {
      in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'],
    },
  };

  if (agentId) {
    where.assignedAgentId = agentId;
  }

  return prisma.workOrder.findMany({
    where,
    orderBy: { promisedDeadline: 'asc' },
    include: {
      tenant: { select: { id: true, name: true, phone: true } },
      property: { select: { id: true, title: true } },
      assignedAgent: { select: { id: true, name: true } },
    },
  });
}

export async function getAgentTodoWorkOrders(agentId: string) {
  return prisma.workOrder.findMany({
    where: {
      assignedAgentId: agentId,
      status: {
        in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'],
      },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
    include: {
      tenant: { select: { id: true, name: true, phone: true } },
      property: { select: { id: true, title: true } },
    },
  });
}
