import { Router } from 'express';
import { getBranches, createBranch, getBranchById } from '../controllers/branch.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getBranches);
router.get('/:id', getBranchById);
router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'BRANCH_ADMIN'), createBranch);

export default router;
