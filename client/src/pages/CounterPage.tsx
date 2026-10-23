import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { TokenStatus } from '../types';
import {
  Users,
  PhoneCall,
  RotateCcw,
  CheckCircle,
  XCircle,
  PauseCircle,
  ArrowRightLeft,
  Power,
  Clock,
  User,
  Building,
  Check,
  ChevronDown
} from 'lucide-react';

export const CounterPage: React.FC = () => {
  const {
    counters,
    departments,
    tokens,
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
    assignStaffToCounter
  } = useQueue();

  const [selectedCounterId, setSelectedCounterId] = useState<string>(counters[0]?.id || 'c1');
  const [transferModalTokenId, setTransferModalTokenId] = useState<string | null>(null);
  const [targetDeptId, setTargetDeptId] = useState<string>('');

  // Clinical & Billing state isolated per patient token
  const [doctorTab, setDoctorTab] = useState<'prescription' | 'diagnostics'>('prescription');
  const [prescriptionText, setPrescriptionText] = useState<string>('');
  const [selectedDiagnostics, setSelectedDiagnostics] = useState<{ name: string; cost: number }[]>([]);
  const [medicineItems, setMedicineItems] = useState<{ name: string; cost: number }[]>([
    { name: 'Paracetamol 500mg (10 tabs)', cost: 80 },
  ]);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCost, setNewItemCost] = useState<string>('');
  const [consultationFee, setConsultationFee] = useState<number>(250);

  const activeCounter = counters.find(c => c.id === selectedCounterId) || counters[0];
  const activeDept = departments.find(d => d.id === activeCounter?.departmentId);

  // Active serving or calling token at this counter
  const activeToken = tokens.find(
    t => t.counterId === activeCounter?.id && (t.status === 'CALLING' || t.status === 'SERVING')
  );

  // Synchronize and isolate state specifically for active patient token
  React.useEffect(() => {
    if (!activeToken) {
      setPrescriptionText('');
      setSelectedDiagnostics([]);
      setMedicineItems([{ name: 'Paracetamol 500mg (10 tabs)', cost: 80 }]);
      return;
    }

    // 0. Auto-default to prescription tab if diagnostic referral was already used 1 time
    if (activeToken.diagnosticReport || (activeToken.diagnosticOrders && activeToken.diagnosticOrders.length > 0)) {
      setDoctorTab('prescription');
    }

    // 1. Load active patient's prescription notes
    setPrescriptionText(activeToken.prescriptionNotes || '');

    // 2. Load active patient's diagnostic orders
    if (activeToken.diagnosticOrders && activeToken.diagnosticOrders.length > 0) {
      setSelectedDiagnostics(activeToken.diagnosticOrders);
    } else {
      setSelectedDiagnostics([]);
    }

    // 3. Load or build active patient's specific medicine items (Pharmacy ONLY handles medicines)
    if (activeToken.billingDetails?.items && activeToken.billingDetails.items.length > 0) {
      const medOnly = activeToken.billingDetails.items.filter(
        i => !i.name.toLowerCase().includes('consultation') &&
             !i.name.toLowerCase().includes('prescription medication order') &&
             !i.name.toLowerCase().includes('x-ray') &&
             !i.name.toLowerCase().includes('sonography') &&
             !i.name.toLowerCase().includes('blood') &&
             !i.name.toLowerCase().includes('ecg') &&
             !i.name.toLowerCase().includes('scan')
      );
      setMedicineItems(medOnly.length > 0 ? medOnly : [{ name: 'Paracetamol 500mg (10 tabs)', cost: 80 }]);
    } else if (activeToken.prescriptionNotes) {
      const items: { name: string; cost: number }[] = [];
      const notes = activeToken.prescriptionNotes.toLowerCase();
      if (notes.includes('paracetamol')) {
        items.push({ name: 'Paracetamol 500mg (10 tabs)', cost: 80 });
      }
      if (notes.includes('amoxicillin')) {
        items.push({ name: 'Amoxicillin 250mg (10 caps)', cost: 120 });
      }
      if (notes.includes('ibuprofen')) {
        items.push({ name: 'Ibuprofen 400mg (10 tabs)', cost: 95 });
      }
      if (notes.includes('cough') || notes.includes('syrup')) {
        items.push({ name: 'Cough Expectorant Syrup 100ml', cost: 110 });
      }
      if (
        items.length === 0 &&
        activeToken.prescriptionNotes.trim() &&
        !activeToken.prescriptionNotes.toLowerCase().includes('consultation') &&
        !activeToken.prescriptionNotes.toLowerCase().includes('prescription medication order')
      ) {
        items.push({ name: activeToken.prescriptionNotes.trim(), cost: 120 });
      }
      setMedicineItems(items.length > 0 ? items : [{ name: 'Paracetamol 500mg (10 tabs)', cost: 80 }]);
    } else {
      setMedicineItems([{ name: 'Paracetamol 500mg (10 tabs)', cost: 80 }]);
    }
  }, [activeToken?.id, activeToken?.prescriptionNotes]);

  const handleUpdateItemCost = (index: number, newCost: number) => {
    setMedicineItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, cost: Math.max(0, newCost) } : item))
    );
  };

  const handleUpdateItemName = (index: number, newName: string) => {
    setMedicineItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
    );
  };

  const handleRemoveItem = (index: number) => {
    setMedicineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMedicineItem = () => {
    if (!newItemName.trim()) return;
    const cost = parseFloat(newItemCost) || 0;
    setMedicineItems(prev => [...prev, { name: newItemName.trim(), cost }]);
    setNewItemName('');
    setNewItemCost('');
  };

  // Department waiting tokens
  const waitingTokens = tokens.filter(
    t => t.departmentId === activeCounter?.departmentId && (t.status === 'WAITING' || t.status === 'HELD')
  );

  const handleCallNext = () => {
    if (!activeCounter) return;
    callNextToken(activeCounter.id);
  };

  const handleRecall = () => {
    if (activeToken) {
      recallToken(activeToken.id);
    }
  };

  const handleStatusChange = (status: TokenStatus) => {
    if (activeToken && activeCounter) {
      updateTokenStatus(activeToken.id, status, activeCounter.id);
    }
  };

  const handleExecuteTransfer = () => {
    if (transferModalTokenId && targetDeptId) {
      transferToken(transferModalTokenId, targetDeptId);
      setTransferModalTokenId(null);
      setTargetDeptId('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Station Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-teal-400 font-mono font-black text-2xl flex items-center justify-center shadow-md">
            {activeCounter?.number}
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900">{activeCounter?.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  activeCounter?.isOnline
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-rose-100 text-rose-700 border border-rose-300'
                }`}
              >
                {activeCounter?.isOnline ? 'STATION ONLINE' : 'OFFLINE / BREAK'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Assigned Staff: <span className="font-bold text-slate-800">{activeCounter?.assignedStaffName || 'Unassigned'}</span> | Dept: <span className="font-bold text-blue-600">{activeCounter?.departmentName}</span>
            </p>
          </div>
        </div>

        {/* Counter Station Selector & Online Switch */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedCounterId}
            onChange={(e) => setSelectedCounterId(e.target.value)}
            className="bg-slate-100 border border-slate-300 font-bold text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
          >
            {counters.map((c) => (
              <option key={c.id} value={c.id}>
                Counter {c.number} - {c.departmentName}
              </option>
            ))}
          </select>

          <button
            onClick={() => toggleCounterOnline(activeCounter.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
              activeCounter?.isOnline
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{activeCounter?.isOnline ? 'Go Offline' : 'Open Station'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Customer Control Panel (Cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Ticket Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Current Active Customer Ticket
              </span>
              {activeToken && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeToken.status === 'CALLING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  Status: {activeToken.status}
                </span>
              )}
            </div>

            {activeToken ? (
              <div className="space-y-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-6xl font-black font-mono text-teal-400 tracking-tight">
                      {activeToken.tokenNumber}
                    </div>
                    <p className="text-slate-300 font-medium text-sm mt-1">{activeToken.departmentName}</p>
                  </div>
                </div>

                {/* Customer Metadata */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Customer Name</span>
                    <span className="text-sm font-bold text-white">{activeToken.customerName || 'Walk-in Guest'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Contact Phone</span>
                    <span className="text-sm font-bold text-teal-300">{activeToken.customerPhone || 'N/A'}</span>
                  </div>
                </div>

                {/* Specialized Clinical & Billing Workflow Panels */}
                {/* 1. DOCTOR CONSULTATION PANEL */}
                {(activeDept?.code === 'GEN' || activeCounter?.departmentId === 'd1' || activeToken.departmentPrefix === 'A') && (
                  <div className="p-5 rounded-3xl bg-slate-800/90 border border-teal-500/30 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-teal-300 uppercase tracking-wider">
                        🩺 Physician Clinical Workspace
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Doctor Consultation Desk</span>
                    </div>

                    {/* Verified Diagnostic Scan Report Attached */}
                    {activeToken.diagnosticReport && (
                      <div className="p-4 bg-teal-950/60 border-2 border-teal-500/40 rounded-2xl text-xs space-y-2 shadow-lg">
                        <div className="flex justify-between items-center border-b border-teal-800/60 pb-2">
                          <span className="font-extrabold text-teal-300 text-sm flex items-center space-x-1.5">
                            <span>📋 Diagnostic Report Verified</span>
                          </span>
                          <span className="text-[10px] text-teal-400 font-mono">
                            {activeToken.diagnosticReport.conductedAt}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-200">
                          <h5 className="font-bold text-white text-xs">{activeToken.diagnosticReport.title}</h5>
                          <p className="text-[11px] text-teal-200 font-medium leading-relaxed">
                            <strong className="text-teal-400">Lab Findings:</strong> {activeToken.diagnosticReport.findings}
                          </p>
                          <span className="text-[10px] text-slate-400 block pt-1">
                            Verified by: {activeToken.diagnosticReport.technicianName}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Modern Segmented Tab Switcher / Status Banner */}
                    {activeToken.diagnosticReport || (activeToken.diagnosticOrders && activeToken.diagnosticOrders.length > 0) ? (
                      <div className="bg-slate-950 p-3 rounded-2xl border border-teal-500/40 text-xs flex justify-between items-center shadow-inner">
                        <span className="font-extrabold text-teal-300 flex items-center space-x-1.5">
                          <span>💊 Prescription & Medication Desk</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/30">
                          ✔ Diagnostic Referral Completed (1/1 Used)
                        </span>
                      </div>
                    ) : (
                      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-700/80">
                        <button
                          type="button"
                          onClick={() => setDoctorTab('prescription')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 ${
                            doctorTab === 'prescription'
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg scale-[1.02]'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>💊 Prescription & Medication</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDoctorTab('diagnostics')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 ${
                            doctorTab === 'diagnostics'
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-[1.02]'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>🔬 Order Diagnostic Imaging</span>
                          {selectedDiagnostics.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">
                              {selectedDiagnostics.length}
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Tab 1: Prescription & Medication Desk */}
                    {doctorTab === 'prescription' && (
                      <div className="space-y-4 pt-1">
                        {/* Doctor General Consultation Fee Field */}
                        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Doctor General Consultation Fee</span>
                            <span className="text-[10px] text-slate-400">Standard physician clinical examination fee</span>
                          </div>
                          <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-teal-500/40">
                            <span className="text-xs font-extrabold text-teal-400">₹</span>
                            <input
                              type="number"
                              value={consultationFee}
                              onChange={(e) => setConsultationFee(Math.max(0, Number(e.target.value)))}
                              className="w-16 bg-transparent text-teal-300 font-black text-xs text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-extrabold text-slate-300 block mb-1">Prescription Notes & Medication Orders:</span>
                          <textarea
                            rows={3}
                            value={prescriptionText}
                            onChange={(e) => setPrescriptionText(e.target.value)}
                            placeholder="Type prescribed medicines (e.g., Paracetamol 500mg, Amoxicillin 250mg)..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 leading-relaxed shadow-inner"
                          />
                        </div>

                        <button
                          onClick={() => {
                            const pharmDept = departments.find(d => d.code === 'PHARM') || departments[1];
                            if (pharmDept) {
                              addPrescriptionAndTransfer(
                                activeToken.id,
                                pharmDept.id,
                                prescriptionText || 'Prescription Medication Order'
                              );
                            }
                          }}
                          className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Send Prescription to Pharmacy ➔</span>
                        </button>
                      </div>
                    )}

                    {/* Tab 2: Order Diagnostic Imaging & Tests */}
                    {doctorTab === 'diagnostics' && (
                      <div className="space-y-4 pt-1">
                        <span className="text-[11px] font-extrabold text-cyan-300 block">Select Diagnostic Procedures to Order:</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { name: 'Chest X-Ray (PA View)', cost: 450 },
                            { name: 'Abdominal Sonography (Ultrasound)', cost: 850 },
                            { name: 'Complete Blood Count (CBC)', cost: 300 },
                            { name: 'ECG / Cardiac Screening', cost: 350 },
                            { name: 'Brain CT Scan', cost: 1800 },
                          ].map(test => {
                            const isSelected = selectedDiagnostics.some(t => t.name === test.name);
                            return (
                              <button
                                key={test.name}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedDiagnostics(prev => prev.filter(t => t.name !== test.name));
                                  } else {
                                    setSelectedDiagnostics(prev => [...prev, test]);
                                  }
                                }}
                                className={`p-2.5 rounded-2xl text-left border text-[11px] font-bold transition flex justify-between items-center ${
                                  isSelected
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <span className="line-clamp-1">{test.name}</span>
                                <span className="font-extrabold ml-1 text-cyan-400">₹{test.cost}</span>
                              </button>
                            );
                          })}
                        </div>

                        {selectedDiagnostics.length > 0 && (
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                            <span className="text-slate-400 font-semibold">Total Diagnostic Orders:</span>
                            <span className="font-extrabold text-cyan-400">
                              ₹{selectedDiagnostics.reduce((sum, t) => sum + t.cost, 0)} ({selectedDiagnostics.length} tests)
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            const labDept = departments.find(d => d.code === 'LAB') || departments[2];
                            if (labDept) {
                              addDiagnosticOrdersAndTransfer(
                                activeToken.id,
                                labDept.id,
                                selectedDiagnostics.length > 0 ? selectedDiagnostics : [{ name: 'Chest X-Ray (PA View)', cost: 450 }]
                              );
                            }
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Refer Patient to Diagnostic Lab Desk ➔</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DIAGNOSTIC LABORATORY & IMAGING PANEL (ONLY VISIBLE AT DIAGNOSTIC LAB STATIONS) */}
                {/* 2. DIAGNOSTIC LABORATORY & IMAGING PANEL (ONLY VISIBLE AT DIAGNOSTIC LAB STATIONS) */}
                {(activeDept?.code === 'LAB' || activeCounter?.departmentId === 'd3') && (
                  <div className="p-4 rounded-2xl bg-slate-800/90 border border-cyan-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        🔬 Diagnostic Laboratory & Imaging Station
                      </span>
                      <span className="text-[10px] text-slate-400">Radiology & Lab Desk</span>
                    </div>

                    {/* Report Selection Grid */}
                    <div className="space-y-2 text-xs">
                      <span className="text-slate-300 font-bold block">Select Diagnostic Procedure / Report Option:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { name: 'Chest X-Ray (PA View)', cost: 450 },
                          { name: 'Abdominal Sonography (Ultrasound)', cost: 650 },
                          { name: 'Complete Blood Count (CBC)', cost: 250 },
                          { name: 'ECG / Cardiac Screening', cost: 350 },
                          { name: 'Brain CT Scan', cost: 1800 },
                        ].map(test => {
                          const currentTests = selectedDiagnostics.length > 0 ? selectedDiagnostics : (activeToken.diagnosticOrders || []);
                          const isSelected = currentTests.some(t => t.name === test.name);
                          return (
                            <button
                              key={test.name}
                              type="button"
                              onClick={() => {
                                setSelectedDiagnostics([test]);
                              }}
                              className={`p-2.5 rounded-xl text-left border text-[11px] font-bold transition flex justify-between items-center ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <span className="line-clamp-1">{test.name}</span>
                              <span className="font-extrabold ml-1 text-cyan-400 shrink-0">₹{test.cost}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Procedure Fees & Total Diagnostic Charges */}
                    {(() => {
                      const displayTests = selectedDiagnostics.length > 0 
                        ? selectedDiagnostics 
                        : (activeToken.diagnosticOrders && activeToken.diagnosticOrders.length > 0 
                            ? activeToken.diagnosticOrders 
                            : [{ name: 'Chest X-Ray (PA View)', cost: 450 }]);
                      const totalCost = displayTests.reduce((s, t) => s + t.cost, 0);

                      return (
                        <div className="space-y-3">
                          <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-slate-400 font-semibold block mb-1">Selected Procedures & Diagnostic Fees:</span>
                            {displayTests.map((test, i) => (
                              <div key={i} className="flex justify-between items-center py-0.5">
                                <span className="text-slate-200 font-medium">{test.name}</span>
                                <span className="font-extrabold text-cyan-400">₹{test.cost}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-extrabold text-sm text-white mt-1">
                              <span>Total Diagnostic Charges:</span>
                              <span className="text-teal-400">₹{totalCost}</span>
                            </div>
                          </div>

                          {/* Dynamic Diagnostic Scan Attachment Preview */}
                          {(() => {
                            const primaryTestName = displayTests[0]?.name || 'Chest X-Ray (PA View)';
                            
                            const reportMap: Record<string, { title: string; imageUrl: string; findings: string }> = {
                              'Chest X-Ray (PA View)': {
                                title: 'Chest Radiogram PA Scan Report',
                                imageUrl: '/xray_scan.png',
                                findings: 'Normal lung expansion. Clear bronchial tree with no acute active infiltrates or consolidation.',
                              },
                              'Abdominal Sonography (Ultrasound)': {
                                title: 'Abdominal Ultrasound Sonography Scan',
                                imageUrl: '/ultrasound_scan.png',
                                findings: 'Normal liver echo texture and gallbladder contours. No gallstones or free fluid detected.',
                              },
                              'Complete Blood Count (CBC)': {
                                title: 'Hematology Complete Blood Count Report',
                                imageUrl: '/cbc_blood_test.png',
                                findings: 'Hemoglobin: 14.2 g/dL. WBC: 6,800/µL. Platelets: 245,000/µL. All differential counts within normal limits.',
                              },
                              'ECG / Cardiac Screening': {
                                title: '12-Lead Electrocardiogram (ECG) Report',
                                imageUrl: '/ecg_scan.png',
                                findings: 'Normal sinus rhythm at 72 bpm. PR interval 0.16s, QRS duration 0.08s. No ST-segment elevation.',
                              },
                              'Brain CT Scan': {
                                title: 'Axial Computed Tomography (CT) Brain Scan',
                                imageUrl: '/brain_ct_scan.png',
                                findings: 'Symmetrical cerebral hemispheres. Ventricles and sulci normal for age. No intracranial hemorrhage.',
                              },
                            };

                            const reportData = reportMap[primaryTestName] || reportMap['Chest X-Ray (PA View)'];

                            const isDirectDiagnosticToken = activeToken.tokenNumber?.startsWith('L-') || activeToken.departmentPrefix === 'L';

                            return (
                              <div className="space-y-3">
                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                  <span className="font-bold text-white text-xs block">{reportData.title}</span>
                                  <p className="text-[11px] text-cyan-300 font-medium leading-relaxed">
                                    <strong className="text-cyan-400">Findings:</strong> {reportData.findings}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  {isDirectDiagnosticToken ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          const pharmDept = departments.find(d => d.code === 'PHARM') || departments[1];
                                          if (pharmDept) {
                                            addDiagnosticReportAndTransferToDoctor(activeToken.id, pharmDept.id, reportData, displayTests);
                                          }
                                        }}
                                        className="w-full bg-gradient-to-r from-purple-600 via-cyan-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                                      >
                                        <ArrowRightLeft className="w-4 h-4" />
                                        <span>Attach Report & Send to Pharmacy for Medication ➔</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          const docDept = departments.find(d => d.code === 'GEN') || departments[0];
                                          if (docDept) {
                                            addDiagnosticReportAndTransferToDoctor(activeToken.id, docDept.id, reportData, displayTests);
                                          }
                                        }}
                                        className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition active:scale-95"
                                      >
                                        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Attach Report & Send to Doctor (General Consultation) ➔</span>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          const docDept = departments.find(d => d.code === 'GEN') || departments[0];
                                          if (docDept) {
                                            addDiagnosticReportAndTransferToDoctor(activeToken.id, docDept.id, reportData, displayTests);
                                          }
                                        }}
                                        className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                                      >
                                        <ArrowRightLeft className="w-4 h-4" />
                                        <span>Attach Report & Send to Doctor (General Consultation) ➔</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          const pharmDept = departments.find(d => d.code === 'PHARM') || departments[1];
                                          if (pharmDept) {
                                            addDiagnosticReportAndTransferToDoctor(activeToken.id, pharmDept.id, reportData, displayTests);
                                          }
                                        }}
                                        className="w-full bg-slate-900 hover:bg-slate-850 text-purple-300 border border-purple-500/40 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition active:scale-95"
                                      >
                                        <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                                        <span>Attach Report & Send Direct to Pharmacy ➔</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. PHARMACY STATION PANEL (ONLY VISIBLE AT PHARMACY STATIONS) */}
                {(activeDept?.code === 'PHARM' || activeCounter?.departmentId === 'd2') && (
                  <div className="p-4 rounded-2xl bg-slate-800/90 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        💊 Pharmacy Prescription & Invoice Dispenser
                      </span>
                      <span className="text-[10px] text-slate-400">Pharmacist Desk</span>
                    </div>

                    {activeToken.prescriptionNotes && (
                      <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl text-xs text-purple-200">
                        <span className="font-bold block mb-0.5 text-purple-300">Doctor Prescription Notes:</span>
                        {activeToken.prescriptionNotes}
                      </div>
                    )}

                    {activeToken.diagnosticReport && (
                      <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-xs text-cyan-200 space-y-1 shadow-sm">
                        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-1.5 mb-1.5">
                          <span className="font-bold text-cyan-300 flex items-center space-x-1 text-xs">
                            <span>🔬 Attached Customer Diagnostic Report</span>
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            {activeToken.diagnosticReport.conductedAt}
                          </span>
                        </div>
                        <h5 className="font-bold text-white text-xs">{activeToken.diagnosticReport.title}</h5>
                        <p className="text-[11px] text-cyan-200 font-medium leading-relaxed">
                          <strong className="text-cyan-400">Lab Findings:</strong> {activeToken.diagnosticReport.findings}
                        </p>
                        {activeToken.diagnosticReport.technicianName && (
                          <span className="text-[10px] text-slate-400 block pt-0.5">
                            Verified by: {activeToken.diagnosticReport.technicianName}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Modifiable Medicine Item List */}
                    <div className="space-y-2 text-xs">
                      <span className="text-slate-400 font-semibold block">Medicine Items & Modifiable Prices (Enter Prices Below):</span>
                      {medicineItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItemName(idx, e.target.value)}
                            className="flex-1 bg-transparent text-slate-200 focus:outline-none font-medium text-xs"
                          />
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              value={item.cost}
                              onChange={(e) => handleUpdateItemCost(idx, Number(e.target.value))}
                              className="w-20 bg-slate-950 border border-slate-700 text-teal-400 font-extrabold px-2 py-1 rounded-lg text-xs focus:outline-none focus:border-teal-400 text-right"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 text-xs font-bold"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* Add Custom Medicine Item Row */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add Medicine / Test..."
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 text-white p-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Price ₹"
                          value={newItemCost}
                          onChange={(e) => setNewItemCost(e.target.value)}
                          className="w-20 bg-slate-950 border border-slate-700 text-white p-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddMedicineItem}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition"
                        >
                          + Add
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-extrabold text-sm text-white">
                        <span>Pharmacy Bill Total:</span>
                        <span className="text-emerald-400">₹{medicineItems.reduce((s, i) => s + i.cost, 0)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const billDept = departments.find(d => d.code === 'BILL') || departments[3];
                        if (billDept) {
                          createPharmacyInvoiceAndTransfer(activeToken.id, medicineItems, billDept.id);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Generate Invoice & Send to Billing Counter ➔</span>
                    </button>
                  </div>
                )}

                {/* 4. BILLING COUNTER & UPI QR CODE PANEL (ONLY VISIBLE AT BILLING COUNTER) */}
                {(activeDept?.code === 'BILL' || activeCounter?.departmentId === 'd4') && (
                  <div className="p-4 rounded-2xl bg-slate-800/90 border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        💳 Billing Counter & UPI Payment Gateway
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        STATUS: {activeToken.billingDetails?.paymentStatus || 'UNPAID'}
                      </span>
                    </div>

                    {activeToken.billingDetails ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* Item Breakdown */}
                        <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="font-bold text-slate-400 block mb-1">Invoice Itemization:</span>
                          {activeToken.billingDetails.items.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-slate-300">{item.name}</span>
                              <span className="font-bold text-slate-200">₹{item.cost}</span>
                            </div>
                          ))}
                          <div className="border-t border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-white">
                            <span>Total Due:</span>
                            <span className="text-teal-400">₹{activeToken.billingDetails.totalAmount}</span>
                          </div>
                        </div>

                        {/* UPI QR Code Display */}
                        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-slate-300 text-center">
                          <img
                            src={activeToken.billingDetails.upiQrUrl}
                            alt="UPI Payment QR Code"
                            className="w-32 h-32 rounded-lg"
                          />
                          <span className="text-[10px] font-extrabold text-slate-900 mt-1">
                            Scan with GPay / PhonePe / Paytm
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">{activeToken.billingDetails.upiId}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
                        Pharmacy Invoice Pending Generation
                      </div>
                    )}

                    <button
                      onClick={() => markBillPaid(activeToken.id)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Bill Paid & Complete (PAID) ➔</span>
                    </button>
                  </div>
                )}

                {/* Counter Actions Toolbar */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeToken.status === 'CALLING' && (
                      <button
                        onClick={() => handleStatusChange('SERVING')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>Start Service</span>
                      </button>
                    )}

                    <button
                      onClick={handleRecall}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Recall Voice</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange('SKIPPED')}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Skip / No-Show</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange('HELD')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                    >
                      <PauseCircle className="w-4 h-4" />
                      <span>Put on Hold</span>
                    </button>

                    <button
                      onClick={() => setTransferModalTokenId(activeToken.id)}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Transfer</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <User className="w-8 h-8" />
                </div>
                <p className="text-slate-300 font-bold text-lg">No active token at this counter</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the button below to call the next waiting customer token in queue.
                </p>

                <button
                  onClick={handleCallNext}
                  disabled={!activeCounter?.isOnline || waitingTokens.length === 0}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-black text-sm py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/25 inline-flex items-center space-x-2 transition active:scale-98 disabled:opacity-50"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>CALL NEXT CUSTOMER ({waitingTokens.length} Waiting)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Waiting Queue List (Cols 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Department Queue</h3>
                <p className="text-xs text-slate-500">{activeDept?.name}</p>
              </div>

              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                {waitingTokens.length} Waiting
              </span>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {waitingTokens.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Queue is clear! No waiting tokens in this department.
                </div>
              ) : (
                waitingTokens.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 font-mono font-black text-sm flex items-center justify-center">
                        {t.tokenNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.customerName || 'Walk-in'}</h4>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400 font-medium">Wait Time</span>
                      <p className="font-bold text-slate-800">~{t.estimatedWaitMinutes}m</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleCallNext}
            disabled={!activeCounter?.isOnline || waitingTokens.length === 0}
            className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <PhoneCall className="w-4 h-4 text-teal-400" />
            <span>Call Next ({waitingTokens.length})</span>
          </button>
        </div>
      </div>

      {/* Transfer Token Modal */}
      {transferModalTokenId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Transfer Token to Department</h3>
            <p className="text-xs text-slate-500">Select the destination department to re-route this customer ticket.</p>

            <select
              value={targetDeptId}
              onChange={(e) => setTargetDeptId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800"
            >
              <option value="">-- Choose Target Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.prefix} Series)
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleExecuteTransfer}
                disabled={!targetDeptId}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
              >
                Confirm Transfer
              </button>
              <button
                onClick={() => setTransferModalTokenId(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
