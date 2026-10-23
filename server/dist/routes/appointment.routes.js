"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = (0, express_1.Router)();
router.get('/', appointment_controller_1.getAppointments);
router.post('/', appointment_controller_1.bookAppointment);
router.post('/:id/checkin', appointment_controller_1.checkInAppointment);
exports.default = router;
