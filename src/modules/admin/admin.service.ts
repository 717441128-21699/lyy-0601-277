import prisma from '../../lib/prisma';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function buildDateFilter(startDate?: string, endDate?: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const filter: any = {};
  if (start) filter.gte = start;
  if (end) filter.lte = end;
  return Object.keys(filter).length > 0 ? filter : undefined;
}

function isFutureRange(startDate?: string, endDate?: string): boolean {
  const now = new Date();
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start && start > now) return true;
  if (end && end > now && (!start || start >= now)) return true;
  return false;
}

const OPEN_CONSULT_STATUSES = ['OPEN', 'IN_PROGRESS'];
const CLOSED_CONSULT_STATUSES = ['RESOLVED', 'CLOSED'];
const OPEN_COMPLAINT_STATUSES = ['RECEIVED', 'UNDER_INVESTIGATION', 'ASSIGNED', 'IN_PROGRESS'];
const CLOSED_COMPLAINT_STATUSES = ['RESOLVED', 'CLOSED'];
const OPEN_WORKORDER_STATUSES = ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'];
const CLOSED_WORKORDER_STATUSES = ['RESOLVED', 'COMPLETED', 'CANCELLED'];

export async function getOverallStats(range?: DateRange) {
  const { startDate, endDate } = range || {};

  if (isFutureRange(startDate, endDate)) {
    return {
      consultation: { total: 0, open: 0, resolved: 0 },
      complaint: { total: 0, open: 0, resolved: 0 },
      workOrder: { total: 0, open: 0, completed: 0, overdue: 0 },
      satisfaction: { avgScore: 0 },
      isFutureRange: true,
    };
  }

  const createdAtFilter = buildDateFilter(startDate, endDate);
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const whereCreated = createdAtFilter ? { createdAt: createdAtFilter } : undefined;

  const [
    totalConsultations,
    totalComplaints,
    totalWorkOrders,
  ] = await Promise.all([
    prisma.consultation.count({ where: whereCreated }),
    prisma.complaint.count({ where: whereCreated }),
    prisma.workOrder.count({ where: whereCreated }),
  ]);

  const whereOpenConsult: any = { ...whereCreated };
  whereOpenConsult.status = { in: OPEN_CONSULT_STATUSES };
  const whereClosedConsult: any = { ...whereCreated };
  whereClosedConsult.status = { in: CLOSED_CONSULT_STATUSES };

  const whereOpenComplaint: any = { ...whereCreated };
  whereOpenComplaint.status = { in: OPEN_COMPLAINT_STATUSES };
  const whereClosedComplaint: any = { ...whereCreated };
  whereClosedComplaint.status = { in: CLOSED_COMPLAINT_STATUSES };

  const whereOpenWorkOrder: any = { ...whereCreated };
  whereOpenWorkOrder.status = { in: OPEN_WORKORDER_STATUSES };
  const whereClosedWorkOrder: any = { ...whereCreated };
  whereClosedWorkOrder.status = { in: CLOSED_WORKORDER_STATUSES };

  const whereOverdueWorkOrder: any = { ...whereCreated };
  whereOverdueWorkOrder.status = { in: OPEN_WORKORDER_STATUSES };
  if (start && end) {
    whereOverdueWorkOrder.promisedDeadline = {
      gte: start,
      lte: end,
    };
  } else if (start) {
    whereOverdueWorkOrder.promisedDeadline = { gte: start, lt: new Date() };
  } else if (end) {
    whereOverdueWorkOrder.promisedDeadline = { lte: end };
  } else {
    whereOverdueWorkOrder.promisedDeadline = { lt: new Date() };
  }

  const [
    openConsultations,
    closedConsultations,
    openComplaints,
    closedComplaints,
    openWorkOrders,
    closedWorkOrders,
    overdueWorkOrders,
  ] = await Promise.all([
    prisma.consultation.count({ where: whereOpenConsult }),
    prisma.consultation.count({ where: whereClosedConsult }),
    prisma.complaint.count({ where: whereOpenComplaint }),
    prisma.complaint.count({ where: whereClosedComplaint }),
    prisma.workOrder.count({ where: whereOpenWorkOrder }),
    prisma.workOrder.count({ where: whereClosedWorkOrder }),
    prisma.workOrder.count({ where: whereOverdueWorkOrder }),
  ]);

  const avgSatisfaction = await getAverageSatisfaction(startDate, endDate);

  return {
    consultation: {
      total: totalConsultations,
      open: openConsultations,
      resolved: closedConsultations,
    },
    complaint: {
      total: totalComplaints,
      open: openComplaints,
      resolved: closedComplaints,
    },
    workOrder: {
      total: totalWorkOrders,
      open: openWorkOrders,
      completed: closedWorkOrders,
      overdue: overdueWorkOrders,
    },
    satisfaction: {
      avgScore: avgSatisfaction,
    },
  };
}

async function getAverageSatisfaction(startDate?: string, endDate?: string) {
  const createdAtFilter = buildDateFilter(startDate, endDate);
  const baseWhere = createdAtFilter ? { createdAt: createdAtFilter } : undefined;

  const [consultationStats, complaintStats, workOrderStats] = await Promise.all([
    prisma.consultation.aggregate({
      where: { ...baseWhere, satisfaction: { not: null } } as any,
      _avg: { satisfaction: true },
      _count: { satisfaction: true },
    }),
    prisma.complaint.aggregate({
      where: { ...baseWhere, satisfaction: { not: null } } as any,
      _avg: { satisfaction: true },
      _count: { satisfaction: true },
    }),
    prisma.workOrder.aggregate({
      where: { ...baseWhere, satisfaction: { not: null } } as any,
      _avg: { satisfaction: true },
      _count: { satisfaction: true },
    }),
  ]);

  const totalCount =
    (consultationStats._count.satisfaction || 0) +
    (complaintStats._count.satisfaction || 0) +
    (workOrderStats._count.satisfaction || 0);

  if (totalCount === 0) return 0;

  const totalSum =
    (consultationStats._avg.satisfaction || 0) * (consultationStats._count.satisfaction || 0) +
    (complaintStats._avg.satisfaction || 0) * (complaintStats._count.satisfaction || 0) +
    (workOrderStats._avg.satisfaction || 0) * (workOrderStats._count.satisfaction || 0);

  return parseFloat((totalSum / totalCount).toFixed(2));
}

export async function getSatisfactionStats() {
  const satisfactionLevels = [5, 4, 3, 2, 1];

  const [consultationStats, complaintStats, workOrderStats] = await Promise.all([
    Promise.all(
      satisfactionLevels.map((level) =>
        prisma.consultation.count({ where: { satisfaction: level } })
      )
    ),
    Promise.all(
      satisfactionLevels.map((level) =>
        prisma.complaint.count({ where: { satisfaction: level } })
      )
    ),
    Promise.all(
      satisfactionLevels.map((level) =>
        prisma.workOrder.count({ where: { satisfaction: level } })
      )
    ),
  ]);

  const distribution = satisfactionLevels.map((level, index) => ({
    level,
    count:
      consultationStats[index] + complaintStats[index] + workOrderStats[index],
  }));

  const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);
  const avgScore = totalCount > 0
    ? distribution.reduce((sum, d) => sum + d.level * d.count, 0) / totalCount
    : 0;

  const feedbackResults = await prisma.workOrder.groupBy({
    by: ['feedbackResult'],
    where: { feedbackResult: { not: null } },
    _count: true,
  });

  return {
    avgScore: parseFloat(avgScore.toFixed(2)),
    totalRatings: totalCount,
    distribution,
    feedbackResults: feedbackResults.map((r) => ({
      result: r.feedbackResult,
      count: r._count,
    })),
  };
}

export async function getFAQCategories() {
  const categories = await prisma.fAQCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      description: true,
      sortOrder: true,
      isActive: true,
      parentId: true,
    },
  });

  const [consultationByCategory, complaintByCategory, workOrderByCategory] = await Promise.all([
    prisma.consultation.groupBy({
      by: ['category'],
      _count: true,
    }),
    prisma.complaint.groupBy({
      by: ['category'],
      _count: true,
    }),
    prisma.workOrder.groupBy({
      by: ['category'],
      _count: true,
    }),
  ]);

  const stats = {
    consultationByCategory: consultationByCategory.map((c) => ({
      category: c.category,
      count: c._count,
    })),
    complaintByCategory: complaintByCategory.map((c) => ({
      category: c.category,
      count: c._count,
    })),
    workOrderByCategory: workOrderByCategory.map((c) => ({
      category: c.category,
      count: c._count,
    })),
  };

  return {
    categories,
    stats,
  };
}

export async function getAgentPerformanceStats() {
  const agents = await prisma.agent.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      role: true,
      department: true,
    },
  });

  const agentStats = await Promise.all(
    agents.map(async (agent) => {
      const [consultationCount, complaintCount, workOrderCount, avgWorkOrderSatisfaction] =
        await Promise.all([
          prisma.consultation.count({ where: { agentId: agent.id } }),
          prisma.complaint.count({ where: { handlingAgentId: agent.id } }),
          prisma.workOrder.count({ where: { assignedAgentId: agent.id } }),
          prisma.workOrder.aggregate({
            where: { assignedAgentId: agent.id, satisfaction: { not: null } },
            _avg: { satisfaction: true },
          }),
        ]);

      const openWorkOrders = await prisma.workOrder.count({
        where: {
          assignedAgentId: agent.id,
          status: { in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS'] },
        },
      });

      return {
        agent,
        stats: {
          totalConsultations: consultationCount,
          totalComplaints: complaintCount,
          totalWorkOrders: workOrderCount,
          openWorkOrders,
          avgSatisfaction: avgWorkOrderSatisfaction._avg.satisfaction || 0,
        },
      };
    })
  );

  return agentStats;
}

export async function getAdminTodo(agentId: string) {
  const [todoWorkOrders, todoConsultations, todoComplaints] = await Promise.all([
    prisma.workOrder.findMany({
      where: {
        assignedAgentId: agentId,
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'] },
      },
      take: 10,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true } },
      },
    }),
    prisma.consultation.findMany({
      where: {
        agentId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      take: 10,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.complaint.findMany({
      where: {
        handlingAgentId: agentId,
        status: { in: ['RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_INVESTIGATION'] },
      },
      take: 10,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
      },
    }),
  ]);

  return {
    workOrders: todoWorkOrders,
    consultations: todoConsultations,
    complaints: todoComplaints,
    totalTodo: todoWorkOrders.length + todoConsultations.length + todoComplaints.length,
  };
}

export async function getOverdueWorkOrders(agentId?: string) {
  const now = new Date();
  const where: any = {
    promisedDeadline: { lt: now },
    status: { in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'] },
  };

  if (agentId) where.assignedAgentId = agentId;

  const orders = await prisma.workOrder.findMany({
    where,
    orderBy: { promisedDeadline: 'asc' },
    include: {
      tenant: { select: { id: true, name: true, phone: true } },
      property: { select: { id: true, title: true } },
      assignedAgent: { select: { id: true, name: true } },
    },
  });

  const totalOverdue = orders.length;
  const overdueByPriority: Record<string, number> = {};
  orders.forEach((o) => {
    overdueByPriority[o.priority] = (overdueByPriority[o.priority] || 0) + 1;
  });

  return {
    total: totalOverdue,
    overdueByPriority,
    orders,
  };
}
