import { Router } from 'express';
import serviceRecordRouter from '../modules/service-record/serviceRecord.router';
import consultationRouter from '../modules/consultation/consultation.router';
import complaintRouter from '../modules/complaint/complaint.router';
import workOrderRouter from '../modules/work-order/workOrder.router';
import businessQueryRouter from '../modules/business-query/businessQuery.router';
import adminRouter from '../modules/admin/admin.router';

const router = Router();

router.use('/service-records', serviceRecordRouter);
router.use('/consultations', consultationRouter);
router.use('/complaints', complaintRouter);
router.use('/work-orders', workOrderRouter);
router.use('/business-query', businessQueryRouter);
router.use('/admin', adminRouter);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '租赁平台客服后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
