import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../lib/socket';
import {
  QueueToken,
  Branch,
  Department,
  ServiceCounter,
  Appointment,
  TokenStatus,
  PriorityLevel,
  QueueMetrics,
  User,
  Role
} from '../types';
import { Language, translations, TranslationDictionary } from '../lib/i18n';

import { ToastMessage } from '../components/ToastContainer';

interface IssueTokenInput {
  branchId: string;
  departmentId: string;
  priority: PriorityLevel;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

interface BookAppointmentInput {
  branchId: string;
  departmentId: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  timeSlot: string;
}

interface QueueContextType {
  branches: Branch[];
  departments: Department[];
  counters: ServiceCounter[];
  tokens: QueueToken[];
  appointments: Appointment[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary) => string;
  activeRole: 'ADMIN' | 'STAFF' | 'KIOSK' | 'CUSTOMER';
  setActiveRole: (role: 'ADMIN' | 'STAFF' | 'KIOSK' | 'CUSTOMER') => void;
  currentUser: User | null;
  loginUser: (userData: Partial<User> & { email: string }) => void;
  logoutUser: () => void;
  lastCalledToken: QueueToken | null;
  audioAnnouncementMessage: string | null;
  clearAudioAnnouncement: () => void;
  toasts: ToastMessage[];
  addToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Actions
  issueToken: (input: IssueTokenInput) => QueueToken;
  callNextToken: (counterId: string) => QueueToken | null;
  recallToken: (tokenId: string) => void;
  updateTokenStatus: (tokenId: string, status: TokenStatus, counterId?: string) => void;
  transferToken: (tokenId: string, targetDepartmentId: string) => void;
  addPrescriptionAndTransfer: (tokenId: string, targetDepartmentId: string, prescriptionNotes: string) => void;
  addDiagnosticOrdersAndTransfer: (tokenId: string, targetDepartmentId: string, testOrders: { name: string; cost: number }[]) => void;
  addDiagnosticReportAndTransferToDoctor: (tokenId: string, targetDepartmentId: string, report: { title: string; imageUrl: string; findings: string }, diagnosticOrders?: { name: string; cost: number }[]) => void;
  createPharmacyInvoiceAndTransfer: (tokenId: string, items: { name: string; cost: number }[], targetDepartmentId: string) => void;
  markBillPaid: (tokenId: string) => void;
  toggleCounterOnline: (counterId: string) => void;
  assignStaffToCounter: (counterId: string, staffName: string) => void;
  bookAppointment: (input: BookAppointmentInput) => Appointment;
  checkInAppointment: (appointmentId: string) => QueueToken | null;
  getMetrics: () => QueueMetrics;
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'Central Plaza Healthcare & Services Hub',
    code: 'CPH-01',
    address: '100 Metro Tower Plaza, Financial District',
    city: 'Metropolis',
    phone: '+1 (555) 019-2834',
    email: 'central@queuesphere.com',
    openingTime: '08:00',
    closingTime: '18:00',
    isActive: true,
  },
  {
    id: 'b2',
    name: 'Northside Civic & Banking Branch',
    code: 'NCB-02',
    address: '450 Northside Avenue, Suite 200',
    city: 'Metropolis',
    phone: '+1 (555) 018-9922',
    email: 'northside@queuesphere.com',
    openingTime: '08:30',
    closingTime: '17:00',
    isActive: true,
  }
];

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'd1',
    name: 'General Consultations & Admissions',
    code: 'GEN',
    prefix: 'A',
    description: 'Patient check-in, triage, general medical records, and physician consulting.',
    branchId: 'b1',
    avgServiceMinutes: 8,
    activeQueueCount: 5,
    isActive: true,
  },
  {
    id: 'd2',
    name: 'Pharmacy & Prescriptions',
    code: 'PHARM',
    prefix: 'P',
    description: 'Medication dispensing, prescription validation, and consulting.',
    branchId: 'b1',
    avgServiceMinutes: 5,
    activeQueueCount: 3,
    isActive: true,
  },
  {
    id: 'd3',
    name: 'Diagnostic Laboratory & Imaging',
    code: 'LAB',
    prefix: 'L',
    description: 'Blood sample collection, X-Ray, MRI, and diagnostics.',
    branchId: 'b1',
    avgServiceMinutes: 12,
    activeQueueCount: 4,
    isActive: true,
  },
  {
    id: 'd4',
    name: 'Account & Billing Services',
    code: 'BILL',
    prefix: 'B',
    description: 'Insurance claims, co-pay settlements, invoice clearance, and refunds.',
    branchId: 'b1',
    avgServiceMinutes: 6,
    activeQueueCount: 2,
    isActive: true,
  }
];

const INITIAL_COUNTERS: ServiceCounter[] = [
  {
    id: 'c1',
    number: '01',
    name: 'Counter 01 (General Consultation)',
    departmentId: 'd1',
    departmentName: 'General Consultations',
    branchId: 'b1',
    isOnline: true,
    assignedStaffId: 'u1',
    assignedStaffName: 'Dr. Sarah Jenkins',
    currentTokenNumber: 'A-102',
  },
  {
    id: 'c2',
    number: '02',
    name: 'Counter 02 (Express Pharmacy)',
    departmentId: 'd2',
    departmentName: 'Pharmacy & Prescriptions',
    branchId: 'b1',
    isOnline: true,
    assignedStaffId: 'u3',
    assignedStaffName: 'Elena Rostova',
    currentTokenNumber: 'P-201',
  },
  {
    id: 'c3',
    number: '03',
    name: 'Counter 03 (Lab Collection)',
    departmentId: 'd3',
    departmentName: 'Diagnostic Laboratory',
    branchId: 'b1',
    isOnline: false,
    assignedStaffId: undefined,
    assignedStaffName: undefined,
    currentTokenNumber: undefined,
  },
  {
    id: 'c4',
    number: '04',
    name: 'Counter 04 (Billing & Cashier)',
    departmentId: 'd4',
    departmentName: 'Account & Billing Services',
    branchId: 'b1',
    isOnline: true,
    assignedStaffId: 'u4',
    assignedStaffName: 'David Sterling',
    currentTokenNumber: 'B-401',
  }
];

const INITIAL_TOKENS: QueueToken[] = [
  {
    id: 't1',
    tokenNumber: 'A-101',
    sequenceNumber: 101,
    status: 'COMPLETED',
    priority: 'NORMAL',
    customerName: 'Robert Vance',
    customerPhone: '+1 555-0144',
    customerEmail: 'robert.vance@example.com',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd1',
    departmentName: 'General Consultations',
    departmentPrefix: 'A',
    counterId: 'c1',
    counterNumber: '01',
    servedByName: 'Dr. Sarah Jenkins',
    estimatedWaitMinutes: 0,
    calledAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    servedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 't2',
    tokenNumber: 'A-102',
    sequenceNumber: 102,
    status: 'SERVING',
    priority: 'EMERGENCY',
    customerName: 'Eleanor Vance',
    customerPhone: '+1 555-0199',
    customerEmail: 'eleanor@example.com',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd1',
    departmentName: 'General Consultations',
    departmentPrefix: 'A',
    counterId: 'c1',
    counterNumber: '01',
    servedByName: 'Dr. Sarah Jenkins',
    estimatedWaitMinutes: 0,
    calledAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    servedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 't3',
    tokenNumber: 'A-103',
    sequenceNumber: 103,
    status: 'WAITING',
    priority: 'PRIORITY',
    customerName: 'James Wilson',
    customerPhone: '+1 555-0821',
    customerEmail: 'jwilson@example.com',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd1',
    departmentName: 'General Consultations',
    departmentPrefix: 'A',
    estimatedWaitMinutes: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 't4',
    tokenNumber: 'A-104',
    sequenceNumber: 104,
    status: 'WAITING',
    priority: 'NORMAL',
    customerName: 'Sophia Martinez',
    customerPhone: '+1 555-0377',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd1',
    departmentName: 'General Consultations',
    departmentPrefix: 'A',
    billingDetails: {
      items: [{ name: 'Doctor General Consultation Fee', cost: 250 }],
      totalAmount: 250,
      paymentStatus: 'UNPAID',
      upiId: '9173351298@superyes',
      upiQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D9173351298%2540superyes%26pn%3DQueueSphere_Pharmacy%26am%3D250%26tn%3DToken_A-104_Bill',
    },
    estimatedWaitMinutes: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 't5',
    tokenNumber: 'P-201',
    sequenceNumber: 201,
    status: 'SERVING',
    priority: 'NORMAL',
    customerName: 'David Miller',
    customerPhone: '+1 555-0482',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd2',
    departmentName: 'Pharmacy & Prescriptions',
    departmentPrefix: 'P',
    counterId: 'c2',
    counterNumber: '02',
    servedByName: 'Elena Rostova',
    estimatedWaitMinutes: 0,
    calledAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    servedAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 't6',
    tokenNumber: 'P-202',
    sequenceNumber: 202,
    status: 'WAITING',
    priority: 'NORMAL',
    customerName: 'Linda Albright',
    customerPhone: '+1 555-0911',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd2',
    departmentName: 'Pharmacy & Prescriptions',
    departmentPrefix: 'P',
    estimatedWaitMinutes: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 't7',
    tokenNumber: 'L-301',
    sequenceNumber: 301,
    status: 'WAITING',
    priority: 'VIP',
    customerName: 'Jonathan Hayes',
    customerPhone: '+1 555-0744',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd3',
    departmentName: 'Diagnostic Laboratory',
    departmentPrefix: 'L',
    estimatedWaitMinutes: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 't8',
    tokenNumber: 'B-401',
    sequenceNumber: 401,
    status: 'SERVING',
    priority: 'NORMAL',
    customerName: 'Catherine Bell',
    customerPhone: '+1 555-0552',
    branchId: 'b1',
    branchName: 'Central Plaza',
    departmentId: 'd4',
    departmentName: 'Account & Billing Services',
    departmentPrefix: 'B',
    counterId: 'c4',
    counterNumber: '04',
    servedByName: 'David Sterling',
    estimatedWaitMinutes: 0,
    calledAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    servedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-101',
    bookingRef: 'QS-88291',
    customerName: 'Arthur Dent',
    phone: '+1 (555) 420-1984',
    email: 'arthur.dent@example.com',
    branchId: 'b1',
    branchName: 'Central Plaza Healthcare & Services Hub',
    departmentId: 'd1',
    departmentName: 'General Consultations & Admissions',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:30 AM',
    status: 'SCHEDULED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'app-102',
    bookingRef: 'QS-99412',
    customerName: 'Clara Oswald',
    phone: '+1 (555) 773-2012',
    email: 'clara.oswald@example.com',
    branchId: 'b1',
    branchName: 'Central Plaza Healthcare & Services Hub',
    departmentId: 'd3',
    departmentName: 'Diagnostic Laboratory & Imaging',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:15 AM',
    status: 'SCHEDULED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  }
];

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [counters, setCounters] = useState<ServiceCounter[]>(INITIAL_COUNTERS);
  const [tokens, setTokens] = useState<QueueToken[]>(INITIAL_TOKENS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b1');
  
  // Persistent language state ('en', 'es', 'fr', 'hi')
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('queuesphere_language');
    if (saved && ['en', 'es', 'fr', 'hi'].includes(saved)) {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('queuesphere_language', lang);
  };

  const t = (key: keyof TranslationDictionary): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };
  
  // User state defaults strictly to null Guest Mode on initial app launch
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'STAFF' | 'KIOSK' | 'CUSTOMER'>('CUSTOMER');

  // Purge any saved staff session on initial load so app always starts with no one logged in
  useEffect(() => {
    localStorage.removeItem('queuesphere_current_user');
    localStorage.removeItem('queuesphere_token');
  }, []);

  const [lastCalledToken, setLastCalledToken] = useState<QueueToken | null>(null);
  const [audioAnnouncementMessage, setAudioAnnouncementMessage] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (title: string, desc?: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev.slice(-3), { id, title, desc, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  // Auto-recalculate active waiting counts per department
  useEffect(() => {
    setDepartments(prev =>
      prev.map(dept => {
        const count = tokens.filter(
          t => t.departmentId === dept.id && (t.status === 'WAITING' || t.status === 'HELD')
        ).length;
        return { ...dept, activeQueueCount: count };
      })
    );
  }, [tokens]);

  // Real-Time WebSockets Event Listeners
  useEffect(() => {
    if (selectedBranchId) {
      socket.emit('join_branch', selectedBranchId);
    }

    const handleTokenIssued = (newToken: QueueToken) => {
      setTokens(prev => {
        if (prev.some(t => t.id === newToken.id)) return prev;
        return [...prev, newToken];
      });
      addToast('Ticket Issued (Live)', `Token ${newToken.tokenNumber} issued`, 'success');
    };

    const handleTokenCalled = (calledToken: QueueToken) => {
      setTokens(prev => prev.map(t => (t.id === calledToken.id ? calledToken : t)));
      if (calledToken.counterId) {
        setCounters(prev =>
          prev.map(c => (c.id === calledToken.counterId ? { ...c, currentTokenNumber: calledToken.tokenNumber } : c))
        );
      }
      setLastCalledToken(calledToken);
      const counterNum = calledToken.counterNumber || (calledToken as any).counter?.number || '01';
      const msg = `Attention please: Token ${calledToken.tokenNumber} proceed to Counter ${counterNum}`;
      setAudioAnnouncementMessage(msg);
      addToast('Calling Next Customer (Live)', `Token ${calledToken.tokenNumber} called to Counter ${counterNum}`, 'info');
    };

    const handleTokenUpdated = (updatedToken: QueueToken) => {
      setTokens(prev => prev.map(t => (t.id === updatedToken.id ? updatedToken : t)));
    };

    const handleCounterUpdated = (updatedCounter: ServiceCounter) => {
      setCounters(prev => prev.map(c => (c.id === updatedCounter.id ? { ...c, ...updatedCounter } : c)));
    };

    const handleAppointmentCreated = (newApp: Appointment) => {
      setAppointments(prev => {
        if (prev.some(a => a.id === newApp.id)) return prev;
        return [newApp, ...prev];
      });
      addToast('New Appointment (Live)', `Appointment ${newApp.bookingRef} booked`, 'info');
    };

    socket.on('token:issued', handleTokenIssued);
    socket.on('token:called', handleTokenCalled);
    socket.on('token:updated', handleTokenUpdated);
    socket.on('counter:updated', handleCounterUpdated);
    socket.on('appointment:created', handleAppointmentCreated);

    return () => {
      socket.off('token:issued', handleTokenIssued);
      socket.off('token:called', handleTokenCalled);
      socket.off('token:updated', handleTokenUpdated);
      socket.off('counter:updated', handleCounterUpdated);
      socket.off('appointment:created', handleAppointmentCreated);
    };
  }, [selectedBranchId]);

  const loginUser = (userData: Partial<User> & { email: string }) => {
    let assignedRole: Role = userData.role || 'CUSTOMER';
    let viewRole: 'ADMIN' | 'STAFF' | 'KIOSK' | 'CUSTOMER' = 'CUSTOMER';

    if (userData.email.includes('admin') || assignedRole === 'SUPER_ADMIN' || assignedRole === 'BRANCH_ADMIN') {
      assignedRole = 'SUPER_ADMIN';
      viewRole = 'ADMIN';
    } else if (userData.email.includes('staff') || userData.email.includes('counter') || assignedRole === 'STAFF' || assignedRole === 'RECEPTIONIST') {
      assignedRole = 'STAFF';
      viewRole = 'STAFF';
    }

    const userObj: User = {
      id: userData.id || `u_${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName || userData.email.split('@')[0],
      lastName: userData.lastName || 'User',
      role: assignedRole,
      branchId: userData.branchId || selectedBranchId,
    };

    setCurrentUser(userObj);
    setActiveRole(viewRole);
    localStorage.setItem('queuesphere_current_user', JSON.stringify(userObj));
    localStorage.setItem('queuesphere_token', 'mock_jwt_token_2026');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('queuesphere_current_user');
    localStorage.removeItem('queuesphere_token');
  };

  const clearAudioAnnouncement = () => {
    setAudioAnnouncementMessage(null);
  };

  const issueToken = (input: IssueTokenInput): QueueToken => {
    const dept = departments.find(d => d.id === input.departmentId);
    const branch = branches.find(b => b.id === input.branchId);

    const prefix = dept?.prefix || 'T';
    const deptTokens = tokens.filter(t => t.departmentId === input.departmentId);
    const nextSeq = deptTokens.length + 101;
    const tokenNumber = `${prefix}-${nextSeq}`;

    const waitingBefore = tokens.filter(
      t => t.departmentId === input.departmentId && t.status === 'WAITING'
    ).length;
    const estimatedWaitMinutes = Math.max(2, waitingBefore * (dept?.avgServiceMinutes || 5));

    const isGen =
      input.departmentId === 'd1' ||
      prefix === 'A' ||
      (dept?.name && dept.name.toLowerCase().includes('general'));

    const initialBilling = isGen
      ? {
          items: [{ name: 'Doctor General Consultation Fee', cost: 250 }],
          totalAmount: 250,
          paymentStatus: 'UNPAID' as const,
          upiId: '9173351298@superyes',
          upiQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D9173351298%2540superyes%26pn%3DQueueSphere_Pharmacy%26am%3D250%26tn%3DToken_${tokenNumber}_Bill`,
        }
      : undefined;

    const newToken: QueueToken = {
      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tokenNumber,
      sequenceNumber: nextSeq,
      status: 'WAITING',
      priority: input.priority,
      customerName: input.customerName || `Guest ${nextSeq}`,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      branchId: input.branchId,
      branchName: branch?.name || 'Central Branch',
      departmentId: input.departmentId,
      departmentName: dept?.name || 'General',
      departmentPrefix: prefix,
      billingDetails: initialBilling,
      estimatedWaitMinutes,
      createdAt: new Date().toISOString(),
    };

    setTokens(prev => [...prev, newToken]);
    addToast('Ticket Issued Successfully!', `Token ${newToken.tokenNumber} issued for ${dept?.name}`, 'success');
    return newToken;
  };

  const callNextToken = (counterId: string): QueueToken | null => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return null;

    const deptTokens = tokens.filter(
      t => t.departmentId === counter.departmentId && (t.status === 'WAITING' || t.status === 'HELD')
    );

    if (deptTokens.length === 0) return null;

    const sorted = [...deptTokens].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const nextToken = sorted[0];

    const updatedToken: QueueToken = {
      ...nextToken,
      status: 'CALLING',
      counterId: counter.id,
      counterNumber: counter.number,
      servedById: counter.assignedStaffId,
      servedByName: counter.assignedStaffName || 'Station Operator',
      calledAt: new Date().toISOString(),
    };

    setTokens(prev => prev.map(t => (t.id === nextToken.id ? updatedToken : t)));
    setCounters(prev =>
      prev.map(c => (c.id === counterId ? { ...c, currentTokenNumber: nextToken.tokenNumber } : c))
    );

    setLastCalledToken(updatedToken);
    const msg = `Attention please: Token ${updatedToken.tokenNumber} proceed to Counter ${counter.number}, ${counter.departmentName || ''}`;
    setAudioAnnouncementMessage(msg);
    addToast('Calling Next Customer', `Token ${updatedToken.tokenNumber} called to Counter ${counter.number}`, 'info');

    return updatedToken;
  };

  const recallToken = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      setLastCalledToken(token);
      const counterNum = token.counterNumber || '01';
      const msg = `Recall notice: Token ${token.tokenNumber}, please report to Counter ${counterNum} immediately.`;
      setAudioAnnouncementMessage(msg);
      addToast('Recall Announcement Sent', `Token ${token.tokenNumber} recalled to Counter ${counterNum}`, 'warning');
    }
  };

  const updateTokenStatus = (tokenId: string, status: TokenStatus, counterId?: string) => {
    const now = new Date().toISOString();
    const token = tokens.find(t => t.id === tokenId);

    setTokens(prev =>
      prev.map(t => {
        if (t.id !== tokenId) return t;
        const updated = { ...t, status };
        if (status === 'SERVING') updated.servedAt = now;
        if (status === 'COMPLETED') updated.completedAt = now;
        return updated;
      })
    );

    if (status === 'COMPLETED' || status === 'SKIPPED' || status === 'CANCELLED') {
      setAudioAnnouncementMessage(null);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }

      if (counterId) {
        setCounters(prev =>
          prev.map(c => (c.id === counterId ? { ...c, currentTokenNumber: undefined } : c))
        );
      }

      if (status === 'COMPLETED') {
        addToast('Service Completed', `Token ${token?.tokenNumber || ''} marked completed`, 'success');
      } else if (status === 'CANCELLED') {
        addToast('Ticket Cancelled', `Token ${token?.tokenNumber || ''} cancelled`, 'warning');
      }
    }
  };

  const transferToken = (tokenId: string, targetDepartmentId: string) => {
    const targetDept = departments.find(d => d.id === targetDepartmentId);
    if (!targetDept) return;

    const token = tokens.find(t => t.id === tokenId);

    setTokens(prev =>
      prev.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          departmentId: targetDepartmentId,
          departmentName: targetDept.name,
          departmentPrefix: targetDept.prefix,
          status: 'WAITING',
          counterId: undefined,
          counterNumber: undefined,
          servedById: undefined,
          servedByName: undefined,
        };
      })
    );

    addToast('Token Transferred', `Token ${token?.tokenNumber || ''} transferred to ${targetDept.name}`, 'info');
  };

  const addPrescriptionAndTransfer = (tokenId: string, targetDepartmentId: string, prescriptionNotes: string) => {
    const targetDept = departments.find(d => d.id === targetDepartmentId);
    if (!targetDept) return;
    const token = tokens.find(t => t.id === tokenId);

    setTokens(prev =>
      prev.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          prescriptionNotes,
          departmentId: targetDepartmentId,
          departmentName: targetDept.name,
          departmentPrefix: targetDept.prefix,
          status: 'WAITING',
          counterId: undefined,
          counterNumber: undefined,
          servedById: undefined,
          servedByName: undefined,
        };
      })
    );

    addToast('Prescription Added & Transferred', `Token ${token?.tokenNumber || ''} sent to Pharmacy`, 'success');
  };

  const addDiagnosticOrdersAndTransfer = (
    tokenId: string,
    targetDepartmentId: string,
    testOrders: { name: string; cost: number }[]
  ) => {
    const targetDept = departments.find(d => d.id === targetDepartmentId);
    if (!targetDept) return;
    const token = tokens.find(t => t.id === tokenId);

    setTokens(prev =>
      prev.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          diagnosticOrders: testOrders,
          departmentId: targetDepartmentId,
          departmentName: targetDept.name,
          departmentPrefix: targetDept.prefix,
          status: 'WAITING',
          counterId: undefined,
          counterNumber: undefined,
          servedById: undefined,
          servedByName: undefined,
        };
      })
    );

    addToast('Diagnostic Referral Sent', `Token ${token?.tokenNumber || ''} referred to Diagnostics Lab`, 'success');
  };

  const addDiagnosticReportAndTransferToDoctor = (
    tokenId: string,
    targetDepartmentId: string,
    report: { title: string; imageUrl: string; findings: string },
    diagnosticOrders?: { name: string; cost: number }[]
  ) => {
    const targetDept = departments.find(d => d.id === targetDepartmentId);
    if (!targetDept) return;
    const token = tokens.find(t => t.id === tokenId);

    setTokens(prev =>
      prev.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          diagnosticReport: {
            ...report,
            conductedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            technicianName: 'Dr. Elena Rostova (Radiology)',
          },
          diagnosticOrders: diagnosticOrders && diagnosticOrders.length > 0 ? diagnosticOrders : t.diagnosticOrders,
          departmentId: targetDepartmentId,
          departmentName: targetDept.name,
          departmentPrefix: targetDept.prefix,
          status: 'WAITING',
          counterId: undefined,
          counterNumber: undefined,
          servedById: undefined,
          servedByName: undefined,
        };
      })
    );

    addToast('Diagnostic Scan Report Ready', `Report attached for Token ${token?.tokenNumber || ''} & sent to ${targetDept.name}`, 'success');
  };

  const createPharmacyInvoiceAndTransfer = (
    tokenId: string,
    items: { name: string; cost: number }[],
    targetDepartmentId: string
  ) => {
    const targetDept = departments.find(d => d.id === targetDepartmentId);
    const token = tokens.find(t => t.id === tokenId);
    if (!targetDept || !token) return;

    // Consolidate billing items: Doctor Consultation Fee (General Consultation only) + Diagnostic Orders + Pharmacy Medicines
    const consolidatedItems: { name: string; cost: number }[] = [];

    // 1. Add Doctor General Consultation Fee ONLY if token belongs to General Consultations department OR has consultation fee in billingDetails
    const isGeneralConsultation =
      token.departmentId === 'd1' ||
      token.departmentPrefix === 'A' ||
      (token.departmentName && token.departmentName.toLowerCase().includes('general consultation')) ||
      (token.billingDetails?.items && token.billingDetails.items.some(i => i.name.toLowerCase().includes('consultation')));

    if (isGeneralConsultation) {
      consolidatedItems.push({ name: 'Doctor General Consultation Fee', cost: 250 });
    }

    // 2. Add Diagnostic Test Orders if patient had diagnostics
    if (token.diagnosticOrders && token.diagnosticOrders.length > 0) {
      token.diagnosticOrders.forEach(order => {
        if (!consolidatedItems.some(i => i.name === order.name)) {
          consolidatedItems.push(order);
        }
      });
    }

    // 3. Add Pharmacy Medicine Items
    items.forEach(item => {
      if (!consolidatedItems.some(i => i.name === item.name)) {
        consolidatedItems.push(item);
      }
    });

    const totalAmount = consolidatedItems.reduce((sum, item) => sum + item.cost, 0);
    const upiId = '9173351298@superyes';
    const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(upiId)}%26pn%3DQueueSphere_Pharmacy%26am%3D${totalAmount}%26tn%3DToken_${token.tokenNumber}_Bill`;

    setTokens(prev =>
      prev.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          billingDetails: {
            items: consolidatedItems,
            totalAmount,
            paymentStatus: 'UNPAID',
            upiId,
            upiQrUrl,
          },
          departmentId: targetDepartmentId,
          departmentName: targetDept.name,
          departmentPrefix: targetDept.prefix,
          status: 'WAITING',
          counterId: undefined,
          counterNumber: undefined,
          servedById: undefined,
          servedByName: undefined,
        };
      })
    );

    addToast('Invoice Created & Sent to Billing', `Token ${token.tokenNumber} transferred to Billing Counter for payment (₹${totalAmount})`, 'success');
    setAudioAnnouncementMessage(`Attention please. Token ${token.tokenNumber}, please proceed to Account and Billing Services counter for invoice payment clearance.`);
  };

  const markBillPaid = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    setTokens(prev =>
      prev.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          status: 'COMPLETED',
          billingDetails: t.billingDetails
            ? { ...t.billingDetails, paymentStatus: 'PAID' }
            : undefined,
        };
      })
    );

    addToast('Payment Received', `Token ${token?.tokenNumber || ''} payment settled (PAID)`, 'success');
  };

  const toggleCounterOnline = (counterId: string) => {
    setCounters(prev =>
      prev.map(c => (c.id === counterId ? { ...c, isOnline: !c.isOnline } : c))
    );
  };

  const assignStaffToCounter = (counterId: string, staffName: string) => {
    setCounters(prev =>
      prev.map(c => (c.id === counterId ? { ...c, assignedStaffName: staffName, isOnline: true } : c))
    );
  };

  const bookAppointment = (input: BookAppointmentInput): Appointment => {
    const branch = branches.find(b => b.id === input.branchId);
    const dept = departments.find(d => d.id === input.departmentId);

    const newApp: Appointment = {
      id: `app_${Date.now()}`,
      bookingRef: `QS-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      branchId: input.branchId,
      branchName: branch?.name || 'Central Branch',
      departmentId: input.departmentId,
      departmentName: dept?.name || 'General',
      date: input.date,
      timeSlot: input.timeSlot,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };

    setAppointments(prev => [newApp, ...prev]);
    return newApp;
  };

  const checkInAppointment = (appointmentId: string): QueueToken | null => {
    const app = appointments.find(a => a.id === appointmentId);
    if (!app) return null;

    const token = issueToken({
      branchId: app.branchId,
      departmentId: app.departmentId,
      priority: 'PRIORITY',
      customerName: app.customerName,
      customerPhone: app.phone,
      customerEmail: app.email,
    });

    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, status: 'CHECKED_IN' } : a))
    );

    return token;
  };

  const getMetrics = (): QueueMetrics => {
    const branchTokens = tokens.filter(t => t.branchId === selectedBranchId);
    const waiting = branchTokens.filter(t => t.status === 'WAITING' || t.status === 'HELD').length;
    const serving = branchTokens.filter(t => t.status === 'CALLING' || t.status === 'SERVING').length;
    const completed = branchTokens.filter(t => t.status === 'COMPLETED').length;

    return {
      totalTokensToday: branchTokens.length,
      currentlyWaiting: waiting,
      currentlyServing: serving,
      completedToday: completed,
      avgWaitMinutes: 7.5,
      avgServiceMinutes: 6.2,
      peakHour: '10:00 AM - 11:30 AM',
      customerSatisfaction: 94.8,
    };
  };

  return (
    <QueueContext.Provider
      value={{
        branches,
        departments,
        counters,
        tokens,
        appointments,
        selectedBranchId,
        setSelectedBranchId,
        language,
        setLanguage,
        t,
        activeRole,
        setActiveRole,
        currentUser,
        loginUser,
        logoutUser,
        lastCalledToken,
        audioAnnouncementMessage,
        clearAudioAnnouncement,
        toasts,
        addToast,
        removeToast,
        issueToken,
        callNextToken,
        recallToken,
        updateTokenStatus,
        transferToken,
        addPrescriptionAndTransfer,
        addDiagnosticOrdersAndTransfer,
        addDiagnosticReportAndTransferToDoctor,
        createPharmacyInvoiceAndTransfer,
        markBillPaid,
        toggleCounterOnline,
        assignStaffToCounter,
        bookAppointment,
        checkInAppointment,
        getMetrics,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
