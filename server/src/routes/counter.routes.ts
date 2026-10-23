import { Router } from 'express';
import { getCounters, updateCounterStatus } from '../controllers/counter.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getCounters);
router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF'),
  updateCounterStatus
);

export default router;
