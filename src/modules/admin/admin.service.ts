import prisma from '../../lib/prisma';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

function buildDateFilter(startDate?: string, endDate?: string) {
  const filter: any = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) filter.lte = new Date(endDate);
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export async function getOverallStats(range?: DateRange) {
  const createdAt = buildDateFilter(range?.startDate, range?.endDate);

  const [
    totalConsultations,
    openConsultations,
    totalComplaints,
    openComplaints,
    totalWorkOrders,
    openWorkOrders,
    overdueWorkOrders,
  ] = await Promise.all([
    prisma.consultation.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.consultation.count({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        ...(createdAt ? {} : {}),
      },
    }),
    prisma.complaint.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.complaint.count({
      where: {
        status: { in: ['RECEIVED', 'UNDER_INVESTIGATION', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    }),
    prisma.workOrder.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.workOrder.count({
      where: {
        status: { in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'] },
      },
    }),
    prisma.workOrder.count({
      where: {
        promisedDeadline: { lt: new Date() },
        status: { in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'] },
      },
    }),
  ]);

  const avgSatisfaction = await getAverageSatisfaction();

  return {
    consultation: {
      total: totalConsultations,
      open: openConsultations,
      resolved: totalConsultations - openConsultations,
    },
    complaint: {
      total: totalComplaints,
      open: openComplaints,
      resolved: totalComplaints - openComplaints,
    },
    workOrder: {
      total: totalWorkOrders,
      open: openWorkOrders,
      completed: totalWorkOrders - openWorkOrders,
      overdue: overdueWorkOrders,
    },
    satisfaction: {
      avgScore: avgSatisfaction,
    },
  };
}

async function getAverageSatisfaction() {
  const [consultationStats, complaintStats, workOrderStats] = await Promise.all([
    prisma.consultation.aggregate({
      where: { satisfaction: { not: null } },
      _avg: { satisfaction: true },
      _count: { satisfaction: true },
    }),
    prisma.complaint.aggregate({
      where: { satisfaction: { not: null } },
      _avg: { satisfaction: true },
      _count: { satisfaction: true },
    }),
    prisma.workOrder.aggregate({
      where: { satisfaction: { not: null } },
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

export async function getFAQCategoryStats() {
  const consultationByCategory = await prisma.consultation.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });

  const complaintByCategory = await prisma.complaint.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });

  const workOrderByCategory = await prisma.workOrder.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });

  return {
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
