import api from '../lib/axios';
import { Appointment, QueueToken } from '../types';

export interface BookAppointmentPayload {
  branchId: string;
  departmentId: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  timeSlot: string;
}

export const appointmentService = {
  async getAppointments(branchId?: string): Promise<Appointment[]> {
    try {
      const response = await api.get('/appointments', { params: { branchId } });
      return response.data.data.appointments;
    } catch (error) {
      return [];
    }
  },

  async bookAppointment(payload: BookAppointmentPayload): Promise<Appointment | null> {
    try {
      const response = await api.post('/appointments', payload);
      return response.data.data.appointment;
    } catch (error) {
      return null;
    }
  },

  async checkInAppointment(appointmentId: string): Promise<{ appointment: Appointment; token: QueueToken } | null> {
    try {
      const response = await api.post(`/appointments/${appointmentId}/checkin`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
};
