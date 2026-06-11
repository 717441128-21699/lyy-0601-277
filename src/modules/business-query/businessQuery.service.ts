import prisma from '../../lib/prisma';

export async function checkLeaseValidity(tenantId: string) {
  const activeLeases = await prisma.lease.findMany({
    where: {
      tenantId,
      status: 'ACTIVE',
    },
    include: {
      property: {
        select: { id: true, title: true, propertyNo: true, address: true },
      },
    },
  });

  const now = new Date();
  const results = activeLeases.map((lease) => {
    const isExpired = lease.endDate < now;
    const daysRemaining = Math.ceil(
      (lease.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      leaseId: lease.id,
      leaseNo: lease.leaseNo,
      property: lease.property,
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyRent: lease.monthlyRent,
      status: lease.status,
      isValid: !isExpired && lease.status === 'ACTIVE',
      daysRemaining,
      isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0,
    };
  });

  return {
    tenantId,
    hasActiveLease: results.some((r) => r.isValid),
    leases: results,
  };
}

export async function getArrearsStatus(tenantId: string) {
  const leases = await prisma.lease.findMany({
    where: {
      tenantId,
      status: 'ACTIVE',
    },
    include: {
      property: { select: { id: true, title: true, propertyNo: true } },
      payments: {
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  const now = new Date();
  let totalArrears = 0;
  let overdueCount = 0;
  const leaseDetails: any[] = [];

  for (const lease of leases) {
    const overduePayments = lease.payments.filter(
      (p) => p.status === 'OVERDUE' || (p.status === 'PENDING' && p.dueDate < now)
    );
    const leaseArrears = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    
    totalArrears += leaseArrears;
    overdueCount += overduePayments.length;

    leaseDetails.push({
      leaseId: lease.id,
      leaseNo: lease.leaseNo,
      property: lease.property,
      monthlyRent: lease.monthlyRent,
      totalArrears: leaseArrears,
      overdueCount: overduePayments.length,
      overduePayments: overduePayments.map((p) => ({
        id: p.id,
        period: p.period,
        amount: p.amount,
        dueDate: p.dueDate,
        status: p.status,
      })),
    });
  }

  return {
    tenantId,
    hasArrears: totalArrears > 0,
    totalArrears,
    overdueCount,
    leaseDetails,
  };
}

export async function getMaintenanceHistory(propertyId: string, skip: number = 0, take: number = 20) {
  const [records, total] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      where: { propertyId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.maintenanceRecord.count({ where: { propertyId } }),
  ]);

  const stats = {
    total,
    completed: records.filter((r) => r.status === 'COMPLETED').length,
    inProgress: records.filter((r) => r.status === 'IN_PROGRESS').length,
    pending: records.filter((r) => r.status === 'PENDING').length,
  };

  return {
    propertyId,
    records,
    stats,
    total,
  };
}

export async function getRepeatComplaintAlerts(tenantId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const complaints = await prisma.complaint.findMany({
    where: {
      tenantId,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      relatedComplaint: {
        select: { id: true, subject: true, category: true, createdAt: true },
      },
    },
  });

  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const repeatedCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count >= 2)
    .map(([category, count]) => ({ category, count }));

  return {
    tenantId,
    totalComplaints30Days: complaints.length,
    repeatedCategories,
    hasRepeatComplaints: repeatedCategories.length > 0,
    recentComplaints: complaints.slice(0, 10),
  };
}

export async function getPropertyStatus(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      leases: {
        where: { status: 'ACTIVE' },
        include: {
          tenant: { select: { id: true, name: true, phone: true } },
        },
      },
      maintenanceRecords: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!property) return null;

  const activeLease = property.leases[0];

  return {
    property: {
      id: property.id,
      propertyNo: property.propertyNo,
      title: property.title,
      address: property.address,
      type: property.type,
      status: property.status,
      rentAmount: property.rentAmount,
      area: property.area,
      rooms: property.rooms,
    },
    currentTenant: activeLease?.tenant || null,
    activeLease: activeLease
      ? {
          id: activeLease.id,
          leaseNo: activeLease.leaseNo,
          startDate: activeLease.startDate,
          endDate: activeLease.endDate,
          monthlyRent: activeLease.monthlyRent,
        }
      : null,
    recentMaintenance: property.maintenanceRecords,
    isAvailable: property.status === 'AVAILABLE',
    isRented: property.status === 'RENTED',
  };
}
