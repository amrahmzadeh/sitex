'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  X, Star, Gift, AlertTriangle, DollarSign, Briefcase,
  Plus, Trash2, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, Edit2,
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
  'Yanvar','Fevral','Mart','Aprel','May','İyun',
  'İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr'
];

const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  CASH: 'Pul mükafatı', GIFT: 'Hədiyyə', EXTRA_LEAVE: 'Əlavə məzuniyyət', OTHER: 'Digər',
};
const PENALTY_TYPE_LABELS: Record<PenaltyType, string> = {
  FINE: 'Cərimə', WARNING: 'Xəbərdarlıq', SUSPENSION: 'Dayandırma', OTHER: 'Digər',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Gözləyir', APPROVED: 'Təsdiqlənib', PAID: 'Ödənilib',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B', APPROVED: '#3B82F6', PAID: '#10B981',
};

function fmt(n: number) {
  return n.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('az-AZ', { day:'2-digit', month:'2-digit', year:'numeric' }); }
  catch { return d; }
}

// ===== Input style =====
const inp: React.CSSProperties = {
  width: '100%', background: '#2a2a2a', border: '1px solid #383334',
  borderRadius: 8, padding: '8px 12px', color: '#F5F5F7', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
};
const sel: React.CSSProperties = { ...inp, cursor: 'pointer' };
const btn = (bg = '#00D37D', color = '#000'): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 16px', borderRadius: 8, background: bg, color,
  border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
});
const ghostBtn: React.CSSProperties = {
  ...btn('transparent', '#B0B0B8'),
  border: '1px solid #383334',
};
const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 7, background: '#2a2a2a',
  border: '1px solid #383334', color: '#B0B0B8', display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};
const card: React.CSSProperties = {
  background: '#171717', border: '1px solid #383334', borderRadius: 12, padding: 16,
};
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 12,
  background: '#171717', border: '1px solid #383334', borderRadius: 12, padding: '12px 14px',
};

function StarRater({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          style={{ cursor: 'pointer', fontSize: 26, color: (hover || value) >= s ? '#FBBF24' : '#444' }}
        >★</span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      background: `${STATUS_COLORS[status] || '#888'}22`,
      color: STATUS_COLORS[status] || '#888',
      border: `1px solid ${STATUS_COLORS[status] || '#888'}44`,
    }}>{STATUS_LABELS[status] || status}</span>
  );
}

export default function EmployeeFinanceModal({ employee, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('rating');

  const [ratings, setRatings] = useState<EmployeeRating[]>([]);
  const [newStars, setNewStars] = useState(0);
  const [newRatingNote, setNewRatingNote] = useState('');

  const [bonuses, setBonuses] = useState<EmployeeBonus[]>([]);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusForm, setBonusForm] = useState({ name:'', reason:'', amount:'', bonusType:'CASH' as BonusType, givenAt:'', description:'' });

  const [penalties, setPenalties] = useState<EmployeePenalty[]>([]);
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyForm, setPenaltyForm] = useState({ reason:'', amount:'', penaltyType:'WARNING' as PenaltyType, incidentAt:'', description:'' });

  const [workLogs, setWorkLogs] = useState<EmployeeWorkLog[]>([]);
  const [showWlForm, setShowWlForm] = useState(false);
  const [wlForm, setWlForm] = useState({ title:'', description:'', amount:'', completedAt:'', status:'PENDING' as WorkLogStatus });
  const [editingWlId, setEditingWlId] = useState<string | null>(null);

  const [salaryRecords, setSalaryRecords] = useState<EmployeeSalary[]>([]);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [salaryNote, setSalaryNote] = useState('');
  const [baseSalaryEdit, setBaseSalaryEdit] = useState(String(employee.baseSalary || ''));

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null);

  const base = `/api/employees/${employee.id}`;

  const fetchAll = useCallback(async () => {
    const [r1, r2, r3, r4, r5] = await Promise.all([
      fetch(`${base}/ratings`), fetch(`${base}/bonuses`), fetch(`${base}/penalties`),
      fetch(`${base}/work-logs`), fetch(`${base}/salary`),
    ]);
    if (r1.ok) setRatings((await r1.json()).ratings || []);
    if (r2.ok) setBonuses((await r2.json()).bonuses || []);
    if (r3.ok) setPenalties((await r3.json()).penalties || []);
    if (r4.ok) setWorkLogs((await r4.json()).workLogs || []);
    if (r5.ok) setSalaryRecords((await r5.json()).salaryRecords || []);
  }, [base]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const flash = (text: string, err = false) => {
    setMsg({ text, err });
    setTimeout(() => setMsg(null), 3000);
  };

  const post = async (url: string, body: object) => {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r;
  };

  // === RATINGS ===
  const addRating = async () => {
    if (!newStars) return flash('Ulduz sayını seçin', true);
    setLoading(true);
    const r = await post(`${base}/ratings`, { stars: newStars, note: newRatingNote });
    if (!r.ok) { flash((await r.json()).error || 'Xəta', true); }
    else { setNewStars(0); setNewRatingNote(''); flash('Reytinq əlavə edildi'); await fetchAll(); }
    setLoading(false);
  };
  const delRating = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${base}/ratings?ratingId=${id}`, { method: 'DELETE' });
    fetchAll();
  };
  const latestRating = ratings[0];

  // === BONUSES ===
  const addBonus = async () => {
    if (!bonusForm.name) return flash('Ad daxil edin', true);
    setLoading(true);
    const r = await post(`${base}/bonuses`, bonusForm);
    if (!r.ok) flash((await r.json()).error || 'Xəta', true);
    else { setBonusForm({ name:'', reason:'', amount:'', bonusType:'CASH', givenAt:'', description:'' }); setShowBonusForm(false); flash('Mükafat əlavə edildi'); await fetchAll(); }
    setLoading(false);
  };
  const delBonus = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${base}/bonuses?bonusId=${id}`, { method: 'DELETE' });
    fetchAll();
  };

  // === PENALTIES ===
  const addPenalty = async () => {
    if (!penaltyForm.reason) return flash('Səbəb daxil edin', true);
    setLoading(true);
    const r = await post(`${base}/penalties`, penaltyForm);
    if (!r.ok) flash((await r.json()).error || 'Xəta', true);
    else { setPenaltyForm({ reason:'', amount:'', penaltyType:'WARNING', incidentAt:'', description:'' }); setShowPenaltyForm(false); flash('Cərimə əlavə edildi'); await fetchAll(); }
    setLoading(false);
  };
  const delPenalty = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${base}/penalties?penaltyId=${id}`, { method: 'DELETE' });
    fetchAll();
  };

  // === WORK LOGS ===
  const saveWl = async () => {
    if (!wlForm.title) return flash('İş adı daxil edin', true);
    setLoading(true);
    if (editingWlId) {
      const r = await fetch(`${base}/work-logs?logId=${editingWlId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(wlForm) });
      if (!r.ok) flash((await r.json()).error || 'Xəta', true);
      else { setEditingWlId(null); flash('Yeniləndi'); setShowWlForm(false); await fetchAll(); }
    } else {
      const r = await post(`${base}/work-logs`, wlForm);
      if (!r.ok) flash((await r.json()).error || 'Xəta', true);
      else { flash('İş qeydi əlavə edildi'); setShowWlForm(false); await fetchAll(); }
    }
    setWlForm({ title:'', description:'', amount:'', completedAt:'', status:'PENDING' });
    setLoading(false);
  };
  const delWl = async (id: string) => {
    if (!confirm('Silinsin?')) return;
    await fetch(`${base}/work-logs?logId=${id}`, { method: 'DELETE' });
    fetchAll();
  };
  const patchWlStatus = async (id: string, status: WorkLogStatus) => {
    await fetch(`${base}/work-logs?logId=${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) });
    fetchAll();
  };

  // === SALARY ===
  const calcSalary = async (markPaid = false) => {
    setLoading(true);
    const r = await post(`${base}/salary`, { year: selYear, month: selMonth, note: salaryNote, markPaid, paidAmount: undefined });
    if (!r.ok) flash((await r.json()).error || 'Xəta', true);
    else { flash(markPaid ? 'Ödəniş qeydə alındı' : 'Maaş hesablandı'); await fetchAll(); }
    setLoading(false);
  };
  const curSalary = salaryRecords.find(s => s.periodYear === selYear && s.periodMonth === selMonth);

  const totalBonus = bonuses.reduce((s,b) => s + b.amount, 0);
  const totalPenalty = penalties.reduce((s,p) => s + p.amount, 0);
  const pendingWl = workLogs.filter(w => w.status === 'PENDING').reduce((s,w) => s + w.amount, 0);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id:'rating', label:'Reytinq', icon:'★' },
    { id:'bonuses', label:'Mükafatlar', icon:'🎁' },
    { id:'penalties', label:'Cərimələr', icon:'⚠' },
    { id:'worklogs', label:'İş Qeydləri', icon:'💼' },
    { id:'salary', label:'Maaş', icon:'$' },
  ];

  const initials = employee.fullName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative', background: '#1a1a1a', border: '1px solid #383334',
          borderRadius: 18, width: '100%', maxWidth: 720, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #383334', flexShrink: 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            {employee.avatarUrl ? (
              <img src={employee.avatarUrl} alt="" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'1px solid #383334' }} />
            ) : (
              <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(0,211,125,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#00D37D', fontWeight:700, fontSize:14 }}>
                {initials}
              </div>
            )}
            <div>
              <div style={{ color:'#F5F5F7', fontWeight:600, fontSize:15 }}>{employee.fullName}</div>
              <div style={{ color:'#888', fontSize:12 }}>{employee.position || 'Vəzifə göstərilməyib'}</div>
            </div>
            {latestRating && (
              <div style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 8px', background:'rgba(251,191,36,0.1)', borderRadius:20, border:'1px solid rgba(251,191,36,0.3)' }}>
                <span style={{ color:'#FBBF24', fontSize:12 }}>★ {latestRating.stars}/5</span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ ...iconBtn, width:34, height:34 }}><X size={16} /></button>
        </div>

        {/* ALERT */}
        {msg && (
          <div style={{ margin:'10px 20px 0', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:500, background: msg.err ? 'rgba(239,68,68,0.1)' : 'rgba(0,211,125,0.1)', color: msg.err ? '#EF4444' : '#00D37D', border: `1px solid ${msg.err ? 'rgba(239,68,68,0.3)' : 'rgba(0,211,125,0.3)'}` }}>
            {msg.text}
          </div>
        )}

        {/* TABS */}
        <div style={{ display:'flex', gap:2, padding:'12px 20px 0', borderBottom:'1px solid #383334', flexShrink: 0, overflowX:'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:'8px 8px 0 0', border:'none', cursor:'pointer', fontSize:13, fontWeight:500, whiteSpace:'nowrap', background: activeTab === t.id ? '#2a2a2a' : 'transparent', color: activeTab === t.id ? '#00D37D' : '#888', borderBottom: activeTab === t.id ? '2px solid #00D37D' : '2px solid transparent' }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>

          {/* ===== RATING ===== */}
          {activeTab === 'rating' && (
            <>
              <div style={card}>
                <div style={{ color:'#F5F5F7', fontWeight:600, fontSize:13, marginBottom:12 }}>Yeni Reytinq Əlavə Et</div>
                <StarRater value={newStars} onChange={setNewStars} />
                <textarea value={newRatingNote} onChange={e => setNewRatingNote(e.target.value)}
                  placeholder="Qeyd (ixtiyari)..." rows={2}
                  style={{ ...inp, marginTop:10, resize:'none' }} />
                <button onClick={addRating} disabled={loading || !newStars} style={{ ...btn(), marginTop:10, opacity: !newStars ? 0.5 : 1 }}>
                  {loading ? 'Əlavə edilir...' : 'Reytinq Ver'}
                </button>
              </div>
              <div style={{ color:'#888', fontSize:11, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>Reytinq Tarixçəsi</div>
              {ratings.length === 0 ? <p style={{ color:'#555', fontSize:13, textAlign:'center', padding:'20px 0' }}>Hələ reytinq verilməyib</p>
              : ratings.map(r => (
                <div key={r.id} style={{ ...row, justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:10 }}>
                    <span style={{ color:'#FBBF24', fontSize:18, letterSpacing:1 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
                    <div>
                      {r.note && <div style={{ color:'#F5F5F7', fontSize:13 }}>{r.note}</div>}
                      <div style={{ color:'#555', fontSize:11 }}>{fmtDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <button onClick={() => delRating(r.id)} style={{ ...iconBtn, color:'#EF4444' }}><Trash2 size={13} /></button>
                </div>
              ))}
            </>
          )}

          {/* ===== BONUSES ===== */}
          {activeTab === 'bonuses' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ padding:'4px 12px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:8, color:'#10B981', fontSize:13, fontWeight:600 }}>
                  Cəmi: +{fmt(totalBonus)} ₼
                </div>
                <button onClick={() => setShowBonusForm(!showBonusForm)} style={btn()}>
                  <Plus size={14} /> Əlavə Et
                </button>
              </div>
              {showBonusForm && (
                <div style={{ ...card, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Ad *</label>
                      <input value={bonusForm.name} onChange={e => setBonusForm(p => ({...p, name:e.target.value}))} style={inp} placeholder="Mükafat adı" />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Məbləğ (₼)</label>
                      <input type="number" value={bonusForm.amount} onChange={e => setBonusForm(p => ({...p, amount:e.target.value}))} style={inp} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Növ</label>
                      <select value={bonusForm.bonusType} onChange={e => setBonusForm(p => ({...p, bonusType:e.target.value as BonusType}))} style={sel}>
                        {Object.entries(BONUS_TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Tarix</label>
                      <input type="date" value={bonusForm.givenAt} onChange={e => setBonusForm(p => ({...p, givenAt:e.target.value}))} style={inp} />
                    </div>
                    <div style={{ gridColumn:'span 2' }}>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Səbəb</label>
                      <input value={bonusForm.reason} onChange={e => setBonusForm(p => ({...p, reason:e.target.value}))} style={inp} placeholder="Mükafatın səbəbi..." />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                    <button onClick={() => setShowBonusForm(false)} style={ghostBtn}>Ləğv et</button>
                    <button onClick={addBonus} disabled={loading} style={btn()}>{loading ? 'Saxlanır...' : 'Saxla'}</button>
                  </div>
                </div>
              )}
              {bonuses.length === 0 ? <p style={{ color:'#555', fontSize:13, textAlign:'center', padding:'20px 0' }}>Hələ mükafat qeydə alınmayıb</p>
              : bonuses.map(b => (
                <div key={b.id} style={{ ...row, justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ fontSize:20 }}>🎁</span>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ color:'#F5F5F7', fontSize:13, fontWeight:600 }}>{b.name}</span>
                        <span style={{ fontSize:11, padding:'1px 7px', background:'#2a2a2a', borderRadius:5, color:'#888' }}>{BONUS_TYPE_LABELS[b.bonusType]}</span>
                      </div>
                      {b.reason && <div style={{ color:'#888', fontSize:12, marginTop:2 }}>{b.reason}</div>}
                      <div style={{ color:'#555', fontSize:11 }}>{fmtDate(b.givenAt)}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ color:'#10B981', fontWeight:700, fontSize:14 }}>+{fmt(b.amount)} ₼</span>
                    <button onClick={() => delBonus(b.id)} style={{ ...iconBtn, color:'#EF4444' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ===== PENALTIES ===== */}
          {activeTab === 'penalties' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ padding:'4px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#EF4444', fontSize:13, fontWeight:600 }}>
                  Cəmi: -{fmt(totalPenalty)} ₼
                </div>
                <button onClick={() => setShowPenaltyForm(!showPenaltyForm)} style={btn('rgba(239,68,68,0.15)', '#EF4444')}>
                  <Plus size={14} /> Əlavə Et
                </button>
              </div>
              {showPenaltyForm && (
                <div style={{ ...card, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div style={{ gridColumn:'span 2' }}>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Səbəb *</label>
                      <input value={penaltyForm.reason} onChange={e => setPenaltyForm(p => ({...p, reason:e.target.value}))} style={inp} placeholder="Cəzanın səbəbi..." />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Məbləğ (₼)</label>
                      <input type="number" value={penaltyForm.amount} onChange={e => setPenaltyForm(p => ({...p, amount:e.target.value}))} style={inp} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Növ</label>
                      <select value={penaltyForm.penaltyType} onChange={e => setPenaltyForm(p => ({...p, penaltyType:e.target.value as PenaltyType}))} style={sel}>
                        {Object.entries(PENALTY_TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Hadisə tarixi</label>
                      <input type="date" value={penaltyForm.incidentAt} onChange={e => setPenaltyForm(p => ({...p, incidentAt:e.target.value}))} style={inp} />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>İzah</label>
                      <input value={penaltyForm.description} onChange={e => setPenaltyForm(p => ({...p, description:e.target.value}))} style={inp} placeholder="Ətraflı izah..." />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                    <button onClick={() => setShowPenaltyForm(false)} style={ghostBtn}>Ləğv et</button>
                    <button onClick={addPenalty} disabled={loading} style={btn('#EF4444','#fff')}>{loading ? 'Saxlanır...' : 'Saxla'}</button>
                  </div>
                </div>
              )}
              {penalties.length === 0 ? <p style={{ color:'#555', fontSize:13, textAlign:'center', padding:'20px 0' }}>Hələ cərimə qeydə alınmayıb</p>
              : penalties.map(p => (
                <div key={p.id} style={{ ...row, justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ fontSize:20 }}>⚠</span>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ color:'#F5F5F7', fontSize:13, fontWeight:600 }}>{p.reason}</span>
                        <span style={{ fontSize:11, padding:'1px 7px', background:'#2a2a2a', borderRadius:5, color:'#888' }}>{PENALTY_TYPE_LABELS[p.penaltyType]}</span>
                      </div>
                      {p.description && <div style={{ color:'#888', fontSize:12, marginTop:2 }}>{p.description}</div>}
                      <div style={{ color:'#555', fontSize:11 }}>{fmtDate(p.incidentAt)}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {p.amount > 0 && <span style={{ color:'#EF4444', fontWeight:700, fontSize:14 }}>-{fmt(p.amount)} ₼</span>}
                    <button onClick={() => delPenalty(p.id)} style={{ ...iconBtn, color:'#EF4444' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ===== WORK LOGS ===== */}
          {activeTab === 'worklogs' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ padding:'4px 12px', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:8, color:'#3B82F6', fontSize:13, fontWeight:600 }}>
                  Gözləyən: {fmt(pendingWl)} ₼
                </div>
                <button onClick={() => { setEditingWlId(null); setWlForm({ title:'', description:'', amount:'', completedAt:'', status:'PENDING' }); setShowWlForm(!showWlForm); }} style={btn()}>
                  <Plus size={14} /> Əlavə Et
                </button>
              </div>
              {showWlForm && (
                <div style={{ ...card, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div style={{ gridColumn:'span 2' }}>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>İş adı *</label>
                      <input value={wlForm.title} onChange={e => setWlForm(p => ({...p, title:e.target.value}))} style={inp} placeholder="Görülən işin adı..." />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Məbləğ (₼)</label>
                      <input type="number" value={wlForm.amount} onChange={e => setWlForm(p => ({...p, amount:e.target.value}))} style={inp} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Tarix</label>
                      <input type="date" value={wlForm.completedAt} onChange={e => setWlForm(p => ({...p, completedAt:e.target.value}))} style={inp} />
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Status</label>
                      <select value={wlForm.status} onChange={e => setWlForm(p => ({...p, status:e.target.value as WorkLogStatus}))} style={sel}>
                        <option value="PENDING">Gözləyir</option>
                        <option value="APPROVED">Təsdiqlənib</option>
                        <option value="PAID">Ödənilib</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Təsvir</label>
                      <input value={wlForm.description} onChange={e => setWlForm(p => ({...p, description:e.target.value}))} style={inp} placeholder="Ətraflı açıqlama..." />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                    <button onClick={() => setShowWlForm(false)} style={ghostBtn}>Ləğv et</button>
                    <button onClick={saveWl} disabled={loading} style={btn()}>{loading ? 'Saxlanır...' : editingWlId ? 'Yenilə' : 'Saxla'}</button>
                  </div>
                </div>
              )}
              {workLogs.length === 0 ? <p style={{ color:'#555', fontSize:13, textAlign:'center', padding:'20px 0' }}>Hələ iş qeydi yoxdur</p>
              : workLogs.map(w => (
                <div key={w.id} style={{ ...row, justifyContent:'space-between', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start', flex:1, minWidth:0 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>💼</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span style={{ color:'#F5F5F7', fontSize:13, fontWeight:600 }}>{w.title}</span>
                        <StatusBadge status={w.status} />
                      </div>
                      {w.description && <div style={{ color:'#888', fontSize:12, marginTop:2 }}>{w.description}</div>}
                      <div style={{ color:'#555', fontSize:11 }}>{fmtDate(w.completedAt)}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:8 }}>
                    {w.amount > 0 && <span style={{ color:'#00D37D', fontWeight:700, fontSize:14 }}>{fmt(w.amount)} ₼</span>}
                    {w.status === 'PENDING' && (
                      <button onClick={() => patchWlStatus(w.id,'APPROVED')} title="Təsdiqlə" style={{ ...iconBtn, color:'#3B82F6' }}><CheckCircle size={13} /></button>
                    )}
                    {w.status === 'APPROVED' && (
                      <button onClick={() => patchWlStatus(w.id,'PAID')} title="Ödənilib" style={{ ...iconBtn, color:'#10B981' }}><DollarSign size={13} /></button>
                    )}
                    <button onClick={() => { setEditingWlId(w.id); setWlForm({ title:w.title, description:w.description||'', amount:String(w.amount), completedAt:w.completedAt.split('T')[0], status:w.status }); setShowWlForm(true); }} style={iconBtn}><Edit2 size={13} /></button>
                    <button onClick={() => delWl(w.id)} style={{ ...iconBtn, color:'#EF4444' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ===== SALARY ===== */}
          {activeTab === 'salary' && (
            <>
              {/* Period nav */}
              <div style={{ ...card, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <button onClick={() => { const d = new Date(selYear, selMonth-2); setSelYear(d.getFullYear()); setSelMonth(d.getMonth()+1); }} style={iconBtn}><ChevronLeft size={16} /></button>
                <span style={{ color:'#F5F5F7', fontWeight:600, fontSize:15 }}>{MONTHS[selMonth-1]} {selYear}</span>
                <button onClick={() => { const d = new Date(selYear, selMonth); setSelYear(d.getFullYear()); setSelMonth(d.getMonth()+1); }} style={iconBtn}><ChevronRight size={16} /></button>
              </div>

              {/* Base salary config */}
              <div style={card}>
                <div style={{ color:'#F5F5F7', fontWeight:600, fontSize:13, marginBottom:10 }}>Əsas Maaş Parametrləri</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ color:'#888', fontSize:11, display:'block', marginBottom:4 }}>Əsas aylıq maaş (₼)</label>
                    <input type="number" value={baseSalaryEdit} onChange={e => setBaseSalaryEdit(e.target.value)} style={inp} placeholder="0.00" />
                  </div>
                  <div style={{ marginTop:16, color:'#555', fontSize:12 }}>Cari: {fmt(employee.baseSalary || 0)} ₼</div>
                </div>
              </div>

              {/* Period breakdown */}
              <div style={card}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ color:'#F5F5F7', fontWeight:600, fontSize:13 }}>{MONTHS[selMonth-1]} {selYear} — Hesabat</span>
                  {curSalary && <StatusBadge status={curSalary.status} />}
                </div>
                {curSalary ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {[
                      ['Əsas maaş', fmt(curSalary.baseSalary)+' ₼', '#F5F5F7'],
                      ['Görülmüş işlər', '+'+fmt(curSalary.workLogTotal)+' ₼', '#00D37D'],
                      ['Mükafatlar', '+'+fmt(curSalary.bonusTotal)+' ₼', '#10B981'],
                    ].map(([l,v,c]) => (
                      <div key={l as string} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                        <span style={{ color:'#888' }}>{l}</span>
                        <span style={{ color: c as string }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop:'1px solid #383334', paddingTop:8, display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'#888' }}>Ümumi (Brüt)</span>
                      <span style={{ color:'#F5F5F7', fontWeight:600 }}>{fmt(curSalary.totalGross)} ₼</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'#888' }}>Tutulmalar</span>
                      <span style={{ color:'#EF4444' }}>-{fmt(curSalary.totalDeduction)} ₼</span>
                    </div>
                    <div style={{ borderTop:'1px solid #383334', paddingTop:8, display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:700 }}>
                      <span style={{ color:'#F5F5F7' }}>Net ödəniləcək</span>
                      <span style={{ color:'#00D37D' }}>{fmt(curSalary.totalNet)} ₼</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'#888' }}>Ödənilib</span>
                      <span style={{ color:'#3B82F6' }}>{fmt(curSalary.paidAmount)} ₼</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600 }}>
                      <span style={{ color:'#888' }}>Qalıq</span>
                      <span style={{ color: curSalary.balance > 0 ? '#F59E0B' : '#10B981' }}>{fmt(curSalary.balance)} ₼</span>
                    </div>
                    {curSalary.note && <p style={{ color:'#555', fontSize:12, marginTop:4 }}>{curSalary.note}</p>}
                  </div>
                ) : (
                  <p style={{ color:'#555', fontSize:13, textAlign:'center', padding:'12px 0' }}>Bu dövr üçün hələ hesabat yoxdur</p>
                )}

                <textarea value={salaryNote} onChange={e => setSalaryNote(e.target.value)}
                  placeholder="Qeyd (ixtiyari)..." rows={2}
                  style={{ ...inp, marginTop:12, resize:'none' }} />
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <button onClick={() => calcSalary(false)} disabled={loading} style={{ ...ghostBtn, flex:1, justifyContent:'center' }}>
                    <RefreshCw size={14} style={{ marginRight:4 }} />
                    Hesabla
                  </button>
                  <button onClick={() => calcSalary(true)} disabled={loading || !curSalary} style={{ ...btn('rgba(16,185,129,0.15)','#10B981'), flex:1, justifyContent:'center', border:'1px solid rgba(16,185,129,0.3)', opacity: !curSalary ? 0.5 : 1 }}>
                    <CheckCircle size={14} style={{ marginRight:4 }} />
                    Ödənildi
                  </button>
                </div>
              </div>

              {/* History */}
              {salaryRecords.length > 0 && (
                <>
                  <div style={{ color:'#888', fontSize:11, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>Ödəniş Tarixçəsi</div>
                  {salaryRecords.slice(0,6).map(s => (
                    <div key={s.id} style={{ ...row, justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ color:'#F5F5F7', fontSize:13, fontWeight:600 }}>{MONTHS[s.periodMonth-1]} {s.periodYear}</div>
                        <div style={{ color:'#555', fontSize:11 }}>Net: {fmt(s.totalNet)} ₼</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ color:'#888', fontSize:13 }}>{fmt(s.paidAmount)} ₼</span>
                        <StatusBadge status={s.status} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
