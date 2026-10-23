export type Role = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'RECEPTIONIST' | 'STAFF' | 'CUSTOMER';

export type TokenStatus = 
  | 'WAITING'
  | 'CALLING'
  | 'SERVING'
  | 'HELD'
  | 'SKIPPED'
  | 'TRANSFERRED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PriorityLevel = 'NORMAL' | 'PRIORITY' | 'VIP' | 'EMERGENCY';

export type AppointmentStatus = 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  branchId?: string;
  counterId?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  prefix: string;
  description: string;
  branchId: string;
  avgServiceMinutes: number;
  activeQueueCount: number;
  isActive: boolean;
}

export interface ServiceCounter {
  id: string;
  number: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  branchId: string;
  isOnline: boolean;
  assignedStaffId?: string;
  assignedStaffName?: string;
  currentTokenNumber?: string;
}

export interface QueueToken {
  id: string;
  tokenNumber: string;
  sequenceNumber: number;
  status: TokenStatus;
  priority: PriorityLevel;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  branchId: string;
  branchName?: string;
  departmentId: string;
  departmentName?: string;
  departmentPrefix?: string;
  counterId?: string;
  counterNumber?: string;
  servedById?: string;
  servedByName?: string;
  estimatedWaitMinutes: number;
  prescriptionNotes?: string;
  diagnosticOrders?: { name: string; cost: number }[];
  diagnosticReport?: {
    title: string;
    imageUrl: string;
    findings: string;
    conductedAt: string;
    technicianName?: string;
  };
  billingDetails?: {
    items: { name: string; cost: number }[];
    totalAmount: number;
    paymentStatus: 'UNPAID' | 'PAID';
    upiId: string;
    upiQrUrl: string;
  };
  calledAt?: string;
  servedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  bookingRef: string;
  customerName: string;
  phone: string;
  email: string;
  branchId: string;
  branchName: string;
  departmentId: string;
  departmentName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface QueueMetrics {
  totalTokensToday: number;
  currentlyWaiting: number;
  currentlyServing: number;
  completedToday: number;
  avgWaitMinutes: number;
  avgServiceMinutes: number;
  peakHour: string;
  customerSatisfaction: number;
}
