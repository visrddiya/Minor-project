import { Router } from 'express';
import { bookAppointment, checkInAppointment, getAppointments } from '../controllers/appointment.controller';

const router = Router();

router.get('/', getAppointments);
router.post('/', bookAppointment);
router.post('/:id/checkin', checkInAppointment);

export default router;
