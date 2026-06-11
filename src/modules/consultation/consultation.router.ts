import { Router } from 'express';
import { validateBody, validateParams } from '../../middleware/validate';
import { paginate } from '../../middleware/paginate';
import {
  create,
  list,
  getById,
  update,
} from './consultation.controller';
import {
  createConsultationSchema,
  updateConsultationSchema,
  idParamSchema,
} from './consultation.schema';

const router = Router();

router.post('/', validateBody(createConsultationSchema), create);
router.get('/', paginate(), list);
router.get('/:id', getById);
router.put('/:id', validateBody(updateConsultationSchema), update);

export default router;
