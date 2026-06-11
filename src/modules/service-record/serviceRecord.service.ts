import prisma from '../../lib/prisma';
import { ServiceType, ServiceChannel } from '../../constants/enums';

interface CreateServiceRecordInput {
  tenantId: string;
  type: ServiceType;
  channel: ServiceChannel;
  title: string;
  content: string;
  sourceId?: string;
  createdById?: string;
}

export async function createServiceRecord(data: CreateServiceRecordInput) {
  return prisma.serviceRecord.create({
    data,
    include: {
      tenant: true,
      createdBy: true,
    },
  });
}

export async function getServiceRecords(
  tenantId?: string,
  type?: ServiceType,
  channel?: ServiceChannel,
  skip: number = 0,
  take: number = 10
) {
  const where: any = {};
  if (tenantId) where.tenantId = tenantId;
  if (type) where.type = type;
  if (channel) where.channel = channel;

  const [records, total] = await Promise.all([
    prisma.serviceRecord.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: { id: true, name: true, phone: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        consultation: true,
        complaint: true,
        workOrder: true,
      },
    }),
    prisma.serviceRecord.count({ where }),
  ]);

  return { records, total };
}

export async function getServiceRecordById(id: string) {
  return prisma.serviceRecord.findUnique({
    where: { id },
    include: {
      tenant: true,
      createdBy: true,
      consultation: true,
      complaint: true,
      workOrder: true,
    },
  });
}

export async function getTenantServiceProfile(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      serviceRecords: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          consultation: true,
          complaint: true,
          workOrder: true,
        },
      },
      consultations: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      complaints: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      workOrders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      leases: {
        where: { status: 'ACTIVE' },
        include: {
          property: true,
          payments: {
            orderBy: { dueDate: 'desc' },
            take: 5,
          },
        },
      },
    },
  });

  if (!tenant) return null;

  const stats = {
    totalRecords: tenant.serviceRecords.length,
    totalConsultations: tenant.consultations.length,
    totalComplaints: tenant.complaints.length,
    totalWorkOrders: tenant.workOrders.length,
    openComplaints: tenant.complaints.filter(c => 
      ['RECEIVED', 'UNDER_INVESTIGATION', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)
    ).length,
    openWorkOrders: tenant.workOrders.filter(w =>
      ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_APPROVAL'].includes(w.status)
    ).length,
  };

  const activeLease = tenant.leases.find(l => l.status === 'ACTIVE');

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email,
      tags: tenant.tags,
    },
    stats,
    activeLease,
    recentRecords: tenant.serviceRecords,
  };
}

export async function mergeTenantRecords(
  primaryTenantId: string,
  secondaryTenantIds: string[]
) {
  return prisma.$transaction(async (tx) => {
    for (const secondaryId of secondaryTenantIds) {
      await tx.serviceRecord.updateMany({
        where: { tenantId: secondaryId },
        data: { tenantId: primaryTenantId },
      });
      await tx.consultation.updateMany({
        where: { tenantId: secondaryId },
        data: { tenantId: primaryTenantId },
      });
      await tx.complaint.updateMany({
        where: { tenantId: secondaryId },
        data: { tenantId: primaryTenantId },
      });
      await tx.workOrder.updateMany({
        where: { tenantId: secondaryId },
        data: { tenantId: primaryTenantId },
      });
      await tx.lease.updateMany({
        where: { tenantId: secondaryId },
        data: { tenantId: primaryTenantId },
      });
      await tx.tenant.delete({ where: { id: secondaryId } });
    }
    return tx.tenant.findUnique({ where: { id: primaryTenantId } });
  });
}
