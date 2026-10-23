"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', department_controller_1.getDepartments);
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('SUPER_ADMIN', 'BRANCH_ADMIN'), department_controller_1.createDepartment);
exports.default = router;
