import { Router } from 'express';
import { paginate } from '../../middleware/paginate';
import {
  getLeaseValidity,
  getArrears,
  getMaintenance,
  getRepeatComplaints,
  getPropertyStatusById,
} from './businessQuery.controller';

const router = Router();

router.get('/lease-validity/:tenantId', getLeaseValidity);
router.get('/arrears/:tenantId', getArrears);
router.get('/maintenance/:propertyId', paginate(), getMaintenance);
router.get('/repeat-complaints/:tenantId', getRepeatComplaints);
router.get('/property-status/:propertyId', getPropertyStatusById);

export default router;
