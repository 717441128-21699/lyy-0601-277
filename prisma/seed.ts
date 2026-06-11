import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充种子数据...');

  const agent1 = await prisma.agent.upsert({
    where: { email: 'admin@rental.com' },
    update: {},
    create: {
      name: '张管理',
      email: 'admin@rental.com',
      phone: '13800000001',
      role: 'ADMIN',
      department: '客服部',
    },
  });

  const agent2 = await prisma.agent.upsert({
    where: { email: 'agent1@rental.com' },
    update: {},
    create: {
      name: '李客服',
      email: 'agent1@rental.com',
      phone: '13800000002',
      role: 'AGENT',
      department: '客服部',
    },
  });

  const agent3 = await prisma.agent.upsert({
    where: { email: 'agent2@rental.com' },
    update: {},
    create: {
      name: '王客服',
      email: 'agent2@rental.com',
      phone: '13800000003',
      role: 'AGENT',
      department: '维修部',
    },
  });

  console.log('✅ 客服数据已创建');

  const tenant1 = await prisma.tenant.upsert({
    where: { phone: '13900000001' },
    update: {},
    create: {
      name: '陈小明',
      phone: '13900000001',
      idCard: '110101199001010001',
      email: 'chenxm@email.com',
      address: '北京市朝阳区...',
      tags: JSON.stringify(['VIP', '长期租户']),
    },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { phone: '13900000002' },
    update: {},
    create: {
      name: '刘小红',
      phone: '13900000002',
      idCard: '110101199202020002',
      email: 'liuxh@email.com',
      tags: JSON.stringify(['新租户']),
    },
  });

  const tenant3 = await prisma.tenant.upsert({
    where: { phone: '13900000003' },
    update: {},
    create: {
      name: '赵大伟',
      phone: '13900000003',
      idCard: '110101198505050003',
      email: 'zhaodw@email.com',
      tags: JSON.stringify(['投诉常客']),
    },
  });

  console.log('✅ 租客数据已创建');

  const property1 = await prisma.property.upsert({
    where: { propertyNo: 'BJ-CY-0001' },
    update: {},
    create: {
      propertyNo: 'BJ-CY-0001',
      title: '朝阳公园附近精装一居',
      address: '北京市朝阳区朝阳公园南路1号',
      type: 'APARTMENT',
      area: 65.5,
      rooms: 1,
      bathrooms: 1,
      floor: '12/20',
      rentAmount: 5500,
      depositAmount: 11000,
      status: 'RENTED',
      description: '精装修，家具家电齐全，拎包入住',
      images: JSON.stringify([]),
      amenities: JSON.stringify(['空调', '洗衣机', '冰箱', 'WiFi', '电梯']),
    },
  });

  const property2 = await prisma.property.upsert({
    where: { propertyNo: 'BJ-HD-0002' },
    update: {},
    create: {
      propertyNo: 'BJ-HD-0002',
      title: '海淀中关村两居室',
      address: '北京市海淀区中关村大街1号',
      type: 'APARTMENT',
      area: 85.0,
      rooms: 2,
      bathrooms: 1,
      floor: '5/6',
      rentAmount: 7800,
      depositAmount: 15600,
      status: 'AVAILABLE',
      description: '南北通透，采光好，交通便利',
      images: JSON.stringify([]),
      amenities: JSON.stringify(['空调', '洗衣机', '冰箱', 'WiFi']),
    },
  });

  const property3 = await prisma.property.upsert({
    where: { propertyNo: 'BJ-TZ-0003' },
    update: {},
    create: {
      propertyNo: 'BJ-TZ-0003',
      title: '通州loft公寓',
      address: '北京市通州区长楹天街',
      type: 'LOFT',
      area: 50.0,
      rooms: 1,
      bathrooms: 1,
      floor: '8/15',
      rentAmount: 4200,
      depositAmount: 8400,
      status: 'RENTED',
      description: '挑高loft，时尚装修',
      images: JSON.stringify([]),
      amenities: JSON.stringify(['空调', '洗衣机', '冰箱', 'WiFi', '电梯']),
    },
  });

  console.log('✅ 房源数据已创建');

  const lease1 = await prisma.lease.upsert({
    where: { leaseNo: 'LS-2024-0001' },
    update: {},
    create: {
      leaseNo: 'LS-2024-0001',
      tenantId: tenant1.id,
      propertyId: property1.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      monthlyRent: 5500,
      depositAmount: 11000,
      payCycle: 'MONTHLY',
      status: 'ACTIVE',
      signDate: new Date('2023-12-20'),
    },
  });

  const lease2 = await prisma.lease.upsert({
    where: { leaseNo: 'LS-2024-0002' },
    update: {},
    create: {
      leaseNo: 'LS-2024-0002',
      tenantId: tenant3.id,
      propertyId: property3.id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-03-01'),
      monthlyRent: 4200,
      depositAmount: 8400,
      payCycle: 'QUARTERLY',
      status: 'ACTIVE',
      signDate: new Date('2024-02-15'),
    },
  });

  console.log('✅ 租约数据已创建');

  const leasePayments = [
    { leaseId: lease1.id, period: '2024-01', amount: 5500, dueDate: new Date('2024-01-01'), status: 'PAID', paidDate: new Date('2023-12-31') },
    { leaseId: lease1.id, period: '2024-02', amount: 5500, dueDate: new Date('2024-02-01'), status: 'PAID', paidDate: new Date('2024-01-30') },
    { leaseId: lease1.id, period: '2024-03', amount: 5500, dueDate: new Date('2024-03-01'), status: 'OVERDUE' },
    { leaseId: lease2.id, period: '2024-Q1', amount: 12600, dueDate: new Date('2024-03-01'), status: 'PAID', paidDate: new Date('2024-02-25') },
    { leaseId: lease2.id, period: '2024-Q2', amount: 12600, dueDate: new Date('2024-06-01'), status: 'PENDING' },
  ];
  for (const p of leasePayments) {
    await prisma.leasePayment.create({ data: p }).catch(() => {});
  }

  console.log('✅ 缴费记录数据已创建');

  const maintenanceRecords = [
    { propertyId: property1.id, type: 'PLUMBING', description: '卫生间水龙头漏水', status: 'COMPLETED', startTime: new Date('2024-01-15'), endTime: new Date('2024-01-16'), cost: 200, contractor: '张师傅维修' },
    { propertyId: property1.id, type: 'ELECTRICAL', description: '客厅灯不亮了', status: 'COMPLETED', startTime: new Date('2024-02-10'), endTime: new Date('2024-02-10'), cost: 80, contractor: '李电工' },
    { propertyId: property1.id, type: 'APPLIANCE', description: '空调不制冷', status: 'IN_PROGRESS', startTime: new Date('2024-06-01'), cost: 0, contractor: '空调售后服务' },
    { propertyId: property3.id, type: 'HVAC', description: '暖气不热', status: 'COMPLETED', startTime: new Date('2024-01-05'), endTime: new Date('2024-01-06'), cost: 150, contractor: '热力公司' },
  ];
  for (const r of maintenanceRecords) {
    await prisma.maintenanceRecord.create({ data: r }).catch(() => {});
  }

  console.log('✅ 维修记录数据已创建');

  const consultation1 = await prisma.serviceRecord.create({
    data: {
      tenantId: tenant1.id,
      type: 'CONSULTATION',
      channel: 'ONLINE_CHAT',
      title: '咨询: 租期续约',
      content: '你好，我想问一下租约快到期了，怎么续约？',
      createdById: agent2.id,
      consultation: {
        create: {
          tenantId: tenant1.id,
          propertyId: property1.id,
          agentId: agent2.id,
          category: 'LEASE_TERMS',
          question: '租约快到期了，怎么续约？',
          answer: '您好！续约可以直接在APP上操作，或者联系您的专属管家。提前一个月申请即可。',
          status: 'RESOLVED',
          priority: 'NORMAL',
          satisfaction: 5,
          resolvedAt: new Date(),
        },
      },
    },
    include: { consultation: true },
  });

  const consultation2 = await prisma.serviceRecord.create({
    data: {
      tenantId: tenant2.id,
      type: 'CONSULTATION',
      channel: 'PHONE',
      title: '咨询: 看房预约',
      content: '想预约看看海淀的那个两居室',
      consultation: {
        create: {
          tenantId: tenant2.id,
          propertyId: property2.id,
          category: 'PROPERTY_VIEWING',
          question: '想预约看一下海淀中关村的两居室，请问什么时候方便？',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
        },
      },
    },
    include: { consultation: true },
  });

  console.log('✅ 咨询数据已创建');

  const complaint1 = await prisma.serviceRecord.create({
    data: {
      tenantId: tenant1.id,
      type: 'COMPLAINT',
      channel: 'PHONE',
      title: '投诉: 空调维修进度慢',
      content: '空调报修了3天了还没人来修，夏天这么热怎么过！',
      complaint: {
        create: {
          tenantId: tenant1.id,
          propertyId: property1.id,
          handlingAgentId: agent3.id,
          category: 'MAINTENANCE_ISSUE',
          type: 'FORMAL',
          priority: 'URGENT',
          status: 'IN_PROGRESS',
          subject: '空调维修进度缓慢',
          description: '空调不制冷，6月1日报修，至今无人上门维修。天气炎热，严重影响正常生活。',
          responsibleParty: 'MAINTENANCE_TEAM',
          promisedDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          isRepeat: false,
        },
      },
    },
    include: { complaint: true },
  });

  const complaint2 = await prisma.serviceRecord.create({
    data: {
      tenantId: tenant3.id,
      type: 'COMPLAINT',
      channel: 'WECHAT',
      title: '投诉: 噪音问题',
      content: '楼上邻居太吵了，晚上经常到12点多',
      complaint: {
        create: {
          tenantId: tenant3.id,
          propertyId: property3.id,
          handlingAgentId: agent2.id,
          category: 'NOISE_COMPLAINT',
          type: 'INFORMAL',
          priority: 'NORMAL',
          status: 'ASSIGNED',
          subject: '楼上噪音扰民',
          description: '楼上住户经常晚上11点后还很吵，影响休息。已多次沟通无效。',
          responsibleParty: 'MANAGEMENT',
          promisedDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          isRepeat: true,
        },
      },
    },
    include: { complaint: true },
  });

  console.log('✅ 投诉数据已创建');

  const workOrder1 = await prisma.serviceRecord.create({
    data: {
      tenantId: tenant1.id,
      type: 'WORK_ORDER',
      channel: 'PHONE',
      title: '工单: 空调维修',
      content: '空调不制冷，需要维修',
      workOrder: {
        create: {
          tenantId: tenant1.id,
          complaintId: complaint1.complaint?.id,
          propertyId: property1.id,
          assignedAgentId: agent3.id,
          title: '空调维修工单',
          description: '主卧空调不制冷，已报修3天',
          type: 'MAINTENANCE',
          category: 'HVAC',
          priority: 'URGENT',
          status: 'IN_PROGRESS',
          progress: 30,
          promisedDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          statusLogs: {
            create: [
              { toStatus: 'CREATED', remarks: '工单创建' },
              { fromStatus: 'CREATED', toStatus: 'ASSIGNED', remarks: '分派给维修部王师傅' },
              { fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', progress: 30, remarks: '已联系师傅，预计明天上门' },
            ],
          },
        },
      },
    },
    include: { workOrder: true },
  });

  const workOrder2 = await prisma.serviceRecord.create({
    data: {
      tenantId: tenant3.id,
      type: 'WORK_ORDER',
      channel: 'APP',
      title: '工单: 入户门维修',
      content: '入户门锁不好用',
      workOrder: {
        create: {
          tenantId: tenant3.id,
          propertyId: property3.id,
          title: '入户门锁维修',
          description: '入户门锁不好开，有时钥匙插不进去',
          type: 'MAINTENANCE',
          category: 'STRUCTURAL',
          priority: 'NORMAL',
          status: 'CREATED',
          progress: 0,
          promisedDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          statusLogs: {
            create: [
              { toStatus: 'CREATED', remarks: '工单创建' },
            ],
          },
        },
      },
    },
    include: { workOrder: true },
  });

  const workOrder3 = await prisma.serviceRecord.create({
    data: {
      tenantId: tenant1.id,
      type: 'WORK_ORDER',
      channel: 'ONLINE_CHAT',
      title: '工单: 水龙头更换',
      content: '卫生间水龙头更换',
      workOrder: {
        create: {
          tenantId: tenant1.id,
          propertyId: property1.id,
          assignedAgentId: agent3.id,
          title: '卫生间水龙头更换',
          description: '水龙头老化漏水，需要更换新的',
          type: 'MAINTENANCE',
          category: 'PLUMBING',
          priority: 'LOW',
          status: 'COMPLETED',
          progress: 100,
          satisfaction: 5,
          feedbackResult: 'SATISFIED',
          actualCompletion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          followUpRequired: false,
          statusLogs: {
            create: [
              { toStatus: 'CREATED', remarks: '工单创建' },
              { fromStatus: 'CREATED', toStatus: 'ASSIGNED', remarks: '分派给维修部' },
              { fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', progress: 50, remarks: '师傅已上门' },
              { fromStatus: 'IN_PROGRESS', toStatus: 'RESOLVED', progress: 100, remarks: '维修完成' },
              { fromStatus: 'RESOLVED', toStatus: 'COMPLETED', remarks: '回访确认，客户满意' },
            ],
          },
        },
      },
    },
    include: { workOrder: true },
  });

  console.log('✅ 工单数据已创建');

  const faqCategories = [
    { name: '租约相关', description: '签约、续约、退租等问题', sortOrder: 1 },
    { name: '缴费相关', description: '房租、押金、水电费等', sortOrder: 2 },
    { name: '维修服务', description: '家电、家具、设施维修', sortOrder: 3 },
    { name: '入住退房', description: '入住流程、退房手续', sortOrder: 4 },
    { name: '物业服务', description: '保洁、安保、公共区域', sortOrder: 5 },
    { name: '其他问题', description: '其他常见问题', sortOrder: 6 },
  ];
  for (const c of faqCategories) {
    await prisma.fAQCategory.create({ data: c }).catch(() => {});
  }

  console.log('✅ 常见问题分类数据已创建');

  console.log('\n🎉 所有种子数据填充完成！');
  console.log('\n📋 数据概览:');
  console.log('   - 客服: 3人');
  console.log('   - 租客: 3人');
  console.log('   - 房源: 3套');
  console.log('   - 租约: 2份');
  console.log('   - 缴费记录: 5条');
  console.log('   - 维修记录: 4条');
  console.log('   - 咨询: 2条');
  console.log('   - 投诉: 2条');
  console.log('   - 工单: 3条');
  console.log('   - 常见问题分类: 6个');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
