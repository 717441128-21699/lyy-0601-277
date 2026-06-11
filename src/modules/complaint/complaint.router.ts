import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { paginate } from '../../middleware/paginate';
import {
  create,
  list,
  getById,
  update,
  assign,
  getRepeatAlerts,
} from './complaint.controller';
import {
  createComplaintSchema,
  updateComplaintSchema,
} from './complaint.schema';

const router = Router();

router.post('/', validateBody(createComplaintSchema), create);
router.get('/', paginate(), list);
router.get('/:id', getById);
router.put('/:id', validateBody(updateComplaintSchema), update);
router.post('/:id/assign', assign);
router.get('/tenant/:tenantId/repeat-alerts', getRepeatAlerts);

export default router;
