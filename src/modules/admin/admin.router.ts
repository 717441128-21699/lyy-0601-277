import { Router } from 'express';
import {
  getStats,
  getSatisfaction,
  getFAQCategories,
  getAgentPerformance,
  getTodo,
  getOverdue,
} from './admin.controller';

const router = Router();

router.get('/stats', getStats);
router.get('/satisfaction', getSatisfaction);
router.get('/faq-categories', getFAQCategories);
router.get('/agent-performance', getAgentPerformance);
router.get('/todo/:agentId', getTodo);
router.get('/overdue', getOverdue);

export default router;
