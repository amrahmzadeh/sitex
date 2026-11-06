'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, Gift, AlertTriangle, DollarSign, Briefcase,
  Plus, Trash2, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, Clock, Ban, TrendingUp, TrendingDown,
  FileText, Edit2, Save, XCircle
} from 'lucide-react';
import {
  EmployeeItem, EmployeeRating, EmployeeBonus, EmployeePenalty,
  EmployeeSalary, EmployeeWorkLog, BonusType, PenaltyType, WorkLogStatus
} from './types';

interface Props {
  employee: EmployeeItem;
  onClose: () => void;
}

type Tab = 'rating' | 'bonuses' | 'penalties' | 'worklogs' | 'salary';

const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  CASH: 'Pul mükafatı',
  GIFT: 'Hədiyyə',
  EXTRA_LEAVE: 'Əlavə məzuniyyət',
  OTHER: 'Digər',
};

const PENALTY_TYPE_LABELS: Record<PenaltyType, string> = {
  FINE: 'Cərimə',
  WARNING: 'Xəbərdarlıq',
  SUSPENSION: 'Dayandırma',
  OTHER: 'Digər',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  APPROVED: 'text-blue-400 bg-blue-400/10',
  PAID: 'text-green-400 bg-green-400/10',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Gözləyir',
  APPROVED: 'Təsdiqlənib',
  PAID: 'Ödənilib',
};

function fmt(n: number) {
  return n.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ===== STAR RATING COMPONENT =====
function StarRater({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={`transition-colors ${(hover || value) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-[#555]'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function EmployeeFinanceModal({ employee, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('rating');

  // Rating state
  const [ratings, setRatings] = useState<EmployeeRating[]>([]);
  const [newStars, setNewStars] = useState(0);
  const [newRatingNote, setNewRatingNote] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  // Bonus state
  const [bonuses, setBonuses] = useState<EmployeeBonus[]>([]);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusForm, setBonusForm] = useState({ name: '', reason: '', amount: '', bonusType: 'CASH' as BonusType, givenAt: '', description: '' });

  // Penalty state
  const [penalties, setPenalties] = useState<EmployeePenalty[]>([]);
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyForm, setPenaltyForm] = useState({ reason: '', amount: '', penaltyType: 'WARNING' as PenaltyType, incidentAt: '', description: '' });

  // Work log state
  const [workLogs, setWorkLogs] = useState<EmployeeWorkLog[]>([]);
  const [showWorkLogForm, setShowWorkLogForm] = useState(false);
  const [wlForm, setWlForm] = useState({ title: '', description: '', amount: '', completedAt: '', status: 'PENDING' as WorkLogStatus });
  const [editingWlId, setEditingWlId] = useState<string | null>(null);

  // Salary state
  const [salaryRecords, setSalaryRecords] = useState<EmployeeSalary[]>([]);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [salaryNote, setSalaryNote] = useState('');
  const [baseSalaryEdit, setBaseSalaryEdit] = useState(String(employee.baseSalary || ''));
  const [salaryLoading, setSalaryLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseUrl = `/api/employees/${employee.id}`;

  // Fetchers
  const fetchRatings = useCallback(async () => {
    const r = await fetch(`${baseUrl}/ratings`);
    if (r.ok) setRatings((await r.json()).ratings || []);
  }, [baseUrl]);

  const fetchBonuses = useCallback(async () => {
    const r = await fetch(`${baseUrl}/bonuses`);
    if (r.ok) setBonuses((await r.json()).bonuses || []);
  }, [baseUrl]);

  const fetchPenalties = useCallback(async () => {
    const r = await fetch(`${baseUrl}/penalties`);
    if (r.ok) setPenalties((await r.json()).penalties || []);
  }, [baseUrl]);

  const fetchWorkLogs = useCallback(async () => {
    const r = await fetch(`${baseUrl}/work-logs`);
    if (r.ok) setWorkLogs((await r.json()).workLogs || []);
  }, [baseUrl]);

  const fetchSalary = useCallback(async () => {
    const r = await fetch(`${baseUrl}/salary`);
    if (r.ok) setSalaryRecords((await r.json()).salaryRecords || []);
  }, [baseUrl]);

  useEffect(() => {
    fetchRatings();
    fetchBonuses();
    fetchPenalties();
    fetchWorkLogs();
    fetchSalary();
  }, [fetchRatings, fetchBonuses, fetchPenalties, fetchWorkLogs, fetchSalary]);

  const showMsg = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  // ======= RATING ACTIONS =======
  const submitRating = async () => {
    if (!newStars) return showMsg('Ulduz sayını seçin', true);
    setRatingLoading(true);
    try {
      const r = await fetch(`${baseUrl}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: newStars, note: newRatingNote }),
      });
      if (!r.ok) return showMsg((await r.json()).error || 'Xəta', true);
      setNewStars(0); setNewRatingNote('');
      await fetchRatings();
      showMsg('Reytinq əlavə edildi');
    } finally { setRatingLoading(false); }
  };

  const deleteRating = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${baseUrl}/ratings?ratingId=${id}`, { method: 'DELETE' });
    await fetchRatings();
  };

  // Latest rating
  const latestRating = ratings[0];

  // ======= BONUS ACTIONS =======
  const submitBonus = async () => {
    if (!bonusForm.name) return showMsg('Mükafat adı daxil edin', true);
    setLoading(true);
    try {
      const r = await fetch(`${baseUrl}/bonuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bonusForm),
      });
      if (!r.ok) return showMsg((await r.json()).error || 'Xəta', true);
      setBonusForm({ name: '', reason: '', amount: '', bonusType: 'CASH', givenAt: '', description: '' });
      setShowBonusForm(false);
      await fetchBonuses();
      showMsg('Mükafat əlavə edildi');
    } finally { setLoading(false); }
  };

  const deleteBonus = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${baseUrl}/bonuses?bonusId=${id}`, { method: 'DELETE' });
    await fetchBonuses();
  };

  // ======= PENALTY ACTIONS =======
  const submitPenalty = async () => {
    if (!penaltyForm.reason) return showMsg('Səbəb daxil edin', true);
    setLoading(true);
    try {
      const r = await fetch(`${baseUrl}/penalties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(penaltyForm),
      });
      if (!r.ok) return showMsg((await r.json()).error || 'Xəta', true);
      setPenaltyForm({ reason: '', amount: '', penaltyType: 'WARNING', incidentAt: '', description: '' });
      setShowPenaltyForm(false);
      await fetchPenalties();
      showMsg('Cərimə əlavə edildi');
    } finally { setLoading(false); }
  };

  const deletePenalty = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${baseUrl}/penalties?penaltyId=${id}`, { method: 'DELETE' });
    await fetchPenalties();
  };

  // ======= WORK LOG ACTIONS =======
  const submitWorkLog = async () => {
    if (!wlForm.title) return showMsg('İş adı daxil edin', true);
    setLoading(true);
    try {
      if (editingWlId) {
        const r = await fetch(`${baseUrl}/work-logs?logId=${editingWlId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wlForm),
        });
        if (!r.ok) return showMsg((await r.json()).error || 'Xəta', true);
        setEditingWlId(null);
        showMsg('Yeniləndi');
      } else {
        const r = await fetch(`${baseUrl}/work-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wlForm),
        });
        if (!r.ok) return showMsg((await r.json()).error || 'Xəta', true);
        showMsg('İş qeydi əlavə edildi');
      }
      setWlForm({ title: '', description: '', amount: '', completedAt: '', status: 'PENDING' });
      setShowWorkLogForm(false);
      await fetchWorkLogs();
    } finally { setLoading(false); }
  };

  const deleteWorkLog = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${baseUrl}/work-logs?logId=${id}`, { method: 'DELETE' });
    await fetchWorkLogs();
  };

  const updateWlStatus = async (id: string, status: WorkLogStatus) => {
    await fetch(`${baseUrl}/work-logs?logId=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchWorkLogs();
  };

  // ======= SALARY ACTIONS =======
  const generateSalary = async (markPaid = false, paidAmount?: number) => {
    setSalaryLoading(true);
    try {
      const r = await fetch(`${baseUrl}/salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selYear,
          month: selMonth,
          note: salaryNote,
          markPaid,
          paidAmount,
        }),
      });
      if (!r.ok) return showMsg((await r.json()).error || 'Xəta', true);
      await fetchSalary();
      showMsg(markPaid ? 'Ödəniş qeydə alındı' : 'Maaş hesablandı');
    } finally { setSalaryLoading(false); }
  };

  const currentSalary = salaryRecords.find(s => s.periodYear === selYear && s.periodMonth === selMonth);

  const totalBonusAllTime = bonuses.reduce((s, b) => s + b.amount, 0);
  const totalPenaltyAllTime = penalties.reduce((s, p) => s + p.amount, 0);
  const pendingWorkLogTotal = workLogs.filter(w => w.status === 'PENDING').reduce((s, w) => s + w.amount, 0);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'rating', label: 'Reytinq', icon: Star },
    { id: 'bonuses', label: 'Mükafatlar', icon: Gift },
    { id: 'penalties', label: 'Cərimələr', icon: AlertTriangle },
    { id: 'worklogs', label: 'İş Qeydləri', icon: Briefcase },
    { id: 'salary', label: 'Maaş', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#1e1e1e] border border-[#383334] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#383334]">
          <div className="flex items-center gap-3">
            {employee.avatarUrl ? (
              <img src={employee.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-[#383334]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#00D37D]/20 flex items-center justify-center text-[#00D37D] font-bold text-sm">
                {employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-white font-semibold">{employee.fullName}</h2>
              <p className="text-[#aaa] text-xs">{employee.position || 'Vəzifə göstərilməyib'}</p>
            </div>
            {latestRating && (
              <div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold">{latestRating.stars}/5</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#383334] rounded-lg transition-colors text-[#aaa] hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className={`mx-5 mt-3 px-4 py-2 rounded-lg text-sm font-medium ${error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
            >
              {error || success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-[#383334] px-5 pt-3 gap-1 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-[#00D37D] border-b-2 border-[#00D37D] -mb-px'
                  : 'text-[#aaa] hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ===== RATING TAB ===== */}
          {activeTab === 'rating' && (
            <div className="space-y-5">
              <div className="bg-[#171717] rounded-xl p-4 border border-[#383334]">
                <h3 className="text-white font-medium mb-3 text-sm">Yeni Reytinq Əlavə Et</h3>
                <div className="space-y-3">
                  <StarRater value={newStars} onChange={setNewStars} />
                  <textarea
                    value={newRatingNote}
                    onChange={e => setNewRatingNote(e.target.value)}
                    placeholder="Qeyd (ixtiyari)..."
                    rows={2}
                    className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-[#00D37D]/50 placeholder-[#555]"
                  />
                  <button
                    onClick={submitRating}
                    disabled={ratingLoading || !newStars}
                    className="px-4 py-2 bg-[#00D37D] text-black rounded-lg text-sm font-semibold hover:bg-[#00D37D]/90 disabled:opacity-50 transition-colors"
                  >
                    {ratingLoading ? 'Əlavə edilir...' : 'Reytinq Ver'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[#aaa] text-xs font-medium uppercase tracking-wider">Reytinq Tarixçəsi</h3>
                {ratings.length === 0 ? (
                  <p className="text-[#555] text-sm text-center py-6">Hələ reytinq verilməyib</p>
                ) : (
                  ratings.map(r => (
                    <div key={r.id} className="flex items-start justify-between bg-[#171717] rounded-xl p-3 border border-[#383334]">
                      <div className="flex items-start gap-3">
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={s <= r.stars ? 'fill-yellow-400 text-yellow-400' : 'text-[#333]'} />
                          ))}
                        </div>
                        <div>
                          {r.note && <p className="text-white text-sm">{r.note}</p>}
                          <p className="text-[#555] text-xs">{fmtDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteRating(r.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[#555] hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== BONUSES TAB ===== */}
          {activeTab === 'bonuses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                    <span className="text-green-400 text-sm font-semibold">Cəmi: {fmt(totalBonusAllTime)} ₼</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowBonusForm(!showBonusForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D37D] text-black rounded-lg text-sm font-semibold hover:bg-[#00D37D]/90 transition-colors"
                >
                  <Plus size={14} /> Əlavə Et
                </button>
              </div>

              <AnimatePresence>
                {showBonusForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-[#171717] rounded-xl p-4 border border-[#383334] space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Mükafat adı *</label>
                        <input value={bonusForm.name} onChange={e => setBonusForm(p => ({...p, name: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50" placeholder="Mükafat adı" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Məbləğ (₼)</label>
                        <input type="number" value={bonusForm.amount} onChange={e => setBonusForm(p => ({...p, amount: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Növ</label>
                        <select value={bonusForm.bonusType} onChange={e => setBonusForm(p => ({...p, bonusType: e.target.value as BonusType}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50">
                          {Object.entries(BONUS_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Tarix</label>
                        <input type="date" value={bonusForm.givenAt} onChange={e => setBonusForm(p => ({...p, givenAt: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-[#aaa] mb-1">Səbəb</label>
                        <input value={bonusForm.reason} onChange={e => setBonusForm(p => ({...p, reason: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50" placeholder="Mükafatın səbəbi..." />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowBonusForm(false)} className="px-3 py-1.5 text-[#aaa] hover:text-white text-sm">Ləğv et</button>
                      <button onClick={submitBonus} disabled={loading} className="px-4 py-1.5 bg-[#00D37D] text-black rounded-lg text-sm font-semibold hover:bg-[#00D37D]/90 disabled:opacity-50">
                        {loading ? 'Saxlanır...' : 'Saxla'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {bonuses.length === 0 ? (
                  <p className="text-[#555] text-sm text-center py-6">Hələ mükafat qeydə alınmayıb</p>
                ) : (
                  bonuses.map(b => (
                    <div key={b.id} className="flex items-start justify-between bg-[#171717] rounded-xl p-3 border border-[#383334]">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Gift size={14} className="text-green-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">{b.name}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-[#2a2a2a] rounded text-[#aaa]">{BONUS_TYPE_LABELS[b.bonusType]}</span>
                          </div>
                          {b.reason && <p className="text-[#aaa] text-xs mt-0.5">{b.reason}</p>}
                          <p className="text-[#555] text-xs">{fmtDate(b.givenAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-semibold text-sm">+{fmt(b.amount)} ₼</span>
                        <button onClick={() => deleteBonus(b.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[#555] hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== PENALTIES TAB ===== */}
          {activeTab === 'penalties' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
                  <span className="text-red-400 text-sm font-semibold">Cəmi: -{fmt(totalPenaltyAllTime)} ₼</span>
                </div>
                <button
                  onClick={() => setShowPenaltyForm(!showPenaltyForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-colors"
                >
                  <Plus size={14} /> Əlavə Et
                </button>
              </div>

              <AnimatePresence>
                {showPenaltyForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-[#171717] rounded-xl p-4 border border-[#383334] space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-[#aaa] mb-1">Səbəb *</label>
                        <input value={penaltyForm.reason} onChange={e => setPenaltyForm(p => ({...p, reason: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" placeholder="Cəzanın səbəbi..." />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Məbləğ (₼)</label>
                        <input type="number" value={penaltyForm.amount} onChange={e => setPenaltyForm(p => ({...p, amount: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Növ</label>
                        <select value={penaltyForm.penaltyType} onChange={e => setPenaltyForm(p => ({...p, penaltyType: e.target.value as PenaltyType}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50">
                          {Object.entries(PENALTY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Hadisə tarixi</label>
                        <input type="date" value={penaltyForm.incidentAt} onChange={e => setPenaltyForm(p => ({...p, incidentAt: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">İzah</label>
                        <input value={penaltyForm.description} onChange={e => setPenaltyForm(p => ({...p, description: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" placeholder="Ətraflı izah..." />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowPenaltyForm(false)} className="px-3 py-1.5 text-[#aaa] hover:text-white text-sm">Ləğv et</button>
                      <button onClick={submitPenalty} disabled={loading} className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                        {loading ? 'Saxlanır...' : 'Saxla'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {penalties.length === 0 ? (
                  <p className="text-[#555] text-sm text-center py-6">Hələ cərimə qeydə alınmayıb</p>
                ) : (
                  penalties.map(p => (
                    <div key={p.id} className="flex items-start justify-between bg-[#171717] rounded-xl p-3 border border-[#383334]">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <AlertTriangle size={14} className="text-red-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">{p.reason}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-[#2a2a2a] rounded text-[#aaa]">{PENALTY_TYPE_LABELS[p.penaltyType]}</span>
                          </div>
                          {p.description && <p className="text-[#aaa] text-xs mt-0.5">{p.description}</p>}
                          <p className="text-[#555] text-xs">{fmtDate(p.incidentAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.amount > 0 && <span className="text-red-400 font-semibold text-sm">-{fmt(p.amount)} ₼</span>}
                        <button onClick={() => deletePenalty(p.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[#555] hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== WORK LOGS TAB ===== */}
          {activeTab === 'worklogs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5">
                  <span className="text-blue-400 text-sm font-semibold">Gözləyən: {fmt(pendingWorkLogTotal)} ₼</span>
                </div>
                <button
                  onClick={() => { setShowWorkLogForm(!showWorkLogForm); setEditingWlId(null); setWlForm({ title: '', description: '', amount: '', completedAt: '', status: 'PENDING' }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D37D] text-black rounded-lg text-sm font-semibold hover:bg-[#00D37D]/90 transition-colors"
                >
                  <Plus size={14} /> Əlavə Et
                </button>
              </div>

              <AnimatePresence>
                {showWorkLogForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-[#171717] rounded-xl p-4 border border-[#383334] space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-[#aaa] mb-1">İş adı *</label>
                        <input value={wlForm.title} onChange={e => setWlForm(p => ({...p, title: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50" placeholder="Görülən işin adı..." />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Məbləğ (₼)</label>
                        <input type="number" value={wlForm.amount} onChange={e => setWlForm(p => ({...p, amount: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Tamamlanma tarixi</label>
                        <input type="date" value={wlForm.completedAt} onChange={e => setWlForm(p => ({...p, completedAt: e.target.value}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#aaa] mb-1">Status</label>
                        <select value={wlForm.status} onChange={e => setWlForm(p => ({...p, status: e.target.value as WorkLogStatus}))}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50">
                          <option value="PENDING">Gözləyir</option>
                          <option value="APPROVED">Təsdiqlənib</option>
                          <option value="PAID">Ödənilib</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-[#aaa] mb-1">Təsvir</label>
                        <textarea value={wlForm.description} onChange={e => setWlForm(p => ({...p, description: e.target.value}))} rows={2}
                          className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50 resize-none" placeholder="Ətraflı açıqlama..." />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowWorkLogForm(false)} className="px-3 py-1.5 text-[#aaa] hover:text-white text-sm">Ləğv et</button>
                      <button onClick={submitWorkLog} disabled={loading} className="px-4 py-1.5 bg-[#00D37D] text-black rounded-lg text-sm font-semibold hover:bg-[#00D37D]/90 disabled:opacity-50">
                        {loading ? 'Saxlanır...' : editingWlId ? 'Yenilə' : 'Saxla'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {workLogs.length === 0 ? (
                  <p className="text-[#555] text-sm text-center py-6">Hələ iş qeydi yoxdur</p>
                ) : (
                  workLogs.map(w => (
                    <div key={w.id} className="flex items-start justify-between bg-[#171717] rounded-xl p-3 border border-[#383334]">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                          <Briefcase size={14} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white text-sm font-medium truncate">{w.title}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[w.status]}`}>
                              {STATUS_LABELS[w.status]}
                            </span>
                          </div>
                          {w.description && <p className="text-[#aaa] text-xs mt-0.5 truncate">{w.description}</p>}
                          <p className="text-[#555] text-xs">{fmtDate(w.completedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        {w.amount > 0 && <span className="text-[#00D37D] font-semibold text-sm">{fmt(w.amount)} ₼</span>}
                        {w.status === 'PENDING' && (
                          <button onClick={() => updateWlStatus(w.id, 'APPROVED')} title="Təsdiqlə"
                            className="p-1.5 hover:bg-blue-500/10 rounded-lg text-[#555] hover:text-blue-400 transition-colors">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {w.status === 'APPROVED' && (
                          <button onClick={() => updateWlStatus(w.id, 'PAID')} title="Ödənilib işarələ"
                            className="p-1.5 hover:bg-green-500/10 rounded-lg text-[#555] hover:text-green-400 transition-colors">
                            <DollarSign size={14} />
                          </button>
                        )}
                        <button onClick={() => { setEditingWlId(w.id); setWlForm({ title: w.title, description: w.description || '', amount: String(w.amount), completedAt: w.completedAt.split('T')[0], status: w.status }); setShowWorkLogForm(true); }}
                          className="p-1.5 hover:bg-[#383334] rounded-lg text-[#555] hover:text-white transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteWorkLog(w.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[#555] hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== SALARY TAB ===== */}
          {activeTab === 'salary' && (
            <div className="space-y-4">
              {/* Period selector */}
              <div className="flex items-center gap-3 bg-[#171717] rounded-xl p-3 border border-[#383334]">
                <button onClick={() => { const d = new Date(selYear, selMonth - 2); setSelYear(d.getFullYear()); setSelMonth(d.getMonth() + 1); }}
                  className="p-1.5 hover:bg-[#383334] rounded-lg text-[#aaa] hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-white font-semibold">{MONTHS[selMonth - 1]} {selYear}</span>
                </div>
                <button onClick={() => { const d = new Date(selYear, selMonth); setSelYear(d.getFullYear()); setSelMonth(d.getMonth() + 1); }}
                  className="p-1.5 hover:bg-[#383334] rounded-lg text-[#aaa] hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Base salary config */}
              <div className="bg-[#171717] rounded-xl p-4 border border-[#383334] space-y-3">
                <h3 className="text-white text-sm font-medium">Əsas Maaş Parametrləri</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-[#aaa] mb-1">Əsas aylıq maaş (₼)</label>
                    <input
                      type="number"
                      value={baseSalaryEdit}
                      onChange={e => setBaseSalaryEdit(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D37D]/50"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="mt-5">
                    <span className="text-[#555] text-xs">Cari: {fmt(employee.baseSalary || 0)} ₼</span>
                  </div>
                </div>
              </div>

              {/* Salary breakdown for period */}
              <div className="bg-[#171717] rounded-xl p-4 border border-[#383334] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-sm font-medium">
                    {MONTHS[selMonth - 1]} {selYear} — Hesabat
                  </h3>
                  {currentSalary && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentSalary.status]}`}>
                      {STATUS_LABELS[currentSalary.status]}
                    </span>
                  )}
                </div>

                {currentSalary ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#aaa]">Əsas maaş</span>
                      <span className="text-white">{fmt(currentSalary.baseSalary)} ₼</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#aaa]">Görülmüş işlər</span>
                      <span className="text-[#00D37D]">+{fmt(currentSalary.workLogTotal)} ₼</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#aaa]">Mükafatlar</span>
                      <span className="text-green-400">+{fmt(currentSalary.bonusTotal)} ₼</span>
                    </div>
                    <div className="border-t border-[#383334] pt-2 flex justify-between text-sm">
                      <span className="text-[#aaa]">Ümumi (Brüt)</span>
                      <span className="text-white font-medium">{fmt(currentSalary.totalGross)} ₼</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#aaa]">Tutulmalar (cərimə)</span>
                      <span className="text-red-400">-{fmt(currentSalary.totalDeduction)} ₼</span>
                    </div>
                    <div className="border-t border-[#383334] pt-2 flex justify-between text-sm font-semibold">
                      <span className="text-white">Net ödəniləcək</span>
                      <span className="text-[#00D37D] text-base">{fmt(currentSalary.totalNet)} ₼</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#aaa]">Ödənilib</span>
                      <span className="text-blue-400">{fmt(currentSalary.paidAmount)} ₼</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#aaa]">Qalıq</span>
                      <span className={currentSalary.balance > 0 ? 'text-orange-400' : 'text-green-400'}>
                        {fmt(currentSalary.balance)} ₼
                      </span>
                    </div>
                    {currentSalary.note && <p className="text-[#555] text-xs mt-1">{currentSalary.note}</p>}
                  </div>
                ) : (
                  <p className="text-[#555] text-sm text-center py-3">Bu dövr üçün hələ hesabat yoxdur</p>
                )}

                <div className="space-y-2">
                  <textarea
                    value={salaryNote}
                    onChange={e => setSalaryNote(e.target.value)}
                    placeholder="Qeyd (ixtiyari)..."
                    rows={2}
                    className="w-full bg-[#2a2a2a] border border-[#383334] rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-[#00D37D]/50 placeholder-[#555]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateSalary(false)}
                      disabled={salaryLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2a2a2a] border border-[#383334] text-white rounded-lg text-sm hover:bg-[#383334] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={salaryLoading ? 'animate-spin' : ''} />
                      Hesabla
                    </button>
                    <button
                      onClick={() => generateSalary(true)}
                      disabled={salaryLoading || !currentSalary}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                      Ödənildi
                    </button>
                  </div>
                </div>
              </div>

              {/* Salary history */}
              {salaryRecords.length > 0 && (
                <div>
                  <h3 className="text-[#aaa] text-xs font-medium uppercase tracking-wider mb-2">Ödəniş Tarixçəsi</h3>
                  <div className="space-y-2">
                    {salaryRecords.slice(0, 6).map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-[#171717] rounded-xl p-3 border border-[#383334]">
                        <div>
                          <span className="text-white text-sm font-medium">{MONTHS[s.periodMonth - 1]} {s.periodYear}</span>
                          <p className="text-[#555] text-xs">Net: {fmt(s.totalNet)} ₼</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#aaa] text-sm">{fmt(s.paidAmount)} ₼</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
                            {STATUS_LABELS[s.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

