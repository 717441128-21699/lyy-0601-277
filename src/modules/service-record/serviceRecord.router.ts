import { Router } from 'express';
import { validateBody, validateParams } from '../../middleware/validate';
import { paginate } from '../../middleware/paginate';
import {
  create,
  list,
  getById,
  getTenantProfile,
  mergeRecords,
} from './serviceRecord.controller';
import {
  createServiceRecordSchema,
  getTenantProfileSchema,
} from './serviceRecord.schema';

const router = Router();

router.post('/', validateBody(createServiceRecordSchema), create);
router.get('/', paginate(), list);
router.get('/:id', getById);
router.get('/tenant/:tenantId/profile', getTenantProfile);
router.post('/merge', mergeRecords);

export default router;
