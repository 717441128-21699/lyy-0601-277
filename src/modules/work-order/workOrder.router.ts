import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { paginate } from '../../middleware/paginate';
import {
  create,
  list,
  getById,
  update,
  assign,
  getOverdue,
  getAgentTodo,
} from './workOrder.controller';
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  assignWorkOrderSchema,
} from './workOrder.schema';

const router = Router();

router.post('/', validateBody(createWorkOrderSchema), create);
router.get('/', paginate(), list);
router.get('/overdue', getOverdue);
router.get('/agent/:agentId/todo', getAgentTodo);
router.get('/:id', getById);
router.put('/:id', validateBody(updateWorkOrderSchema), update);
router.post('/:id/assign', validateBody(assignWorkOrderSchema), assign);

export default router;
