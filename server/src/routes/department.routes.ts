import { Router } from 'express';
import { getDepartments, createDepartment } from '../controllers/department.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getDepartments);
router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'BRANCH_ADMIN'), createDepartment);

export default router;
