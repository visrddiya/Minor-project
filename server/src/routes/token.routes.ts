import { Router } from 'express';
import {
  issueKioskToken,
  callNextToken,
  updateTokenStatus,
  trackToken,
  getTokens,
} from '../controllers/token.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getTokens);
router.post('/kiosk', issueKioskToken);
router.post(
  '/call-next',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF', 'RECEPTIONIST'),
  callNextToken
);
router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF', 'RECEPTIONIST'),
  updateTokenStatus
);
router.get('/track/:tokenNumber', trackToken);

export default router;
