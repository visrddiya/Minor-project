"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const counter_controller_1 = require("../controllers/counter.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', counter_controller_1.getCounters);
router.patch('/:id/status', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF'), counter_controller_1.updateCounterStatus);
exports.default = router;
