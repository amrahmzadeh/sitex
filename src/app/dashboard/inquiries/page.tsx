'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Search,
  RefreshCw,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Save,
  User,
} from 'lucide-react';
import { formatWhatsAppUrl } from '@/lib/utils';
import { useCurrentOrg } from '@/contexts/CurrentOrgContext';

type InquiryStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';

interface ContactSubmission {
  id: string;
  organizationId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  subject: string | null;
  message: string;
  status: InquiryStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StatusCounts {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  archived: number;
}

export default function InquiriesDashboardPage() {
  const { orgId } = useCurrentOrg();
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | InquiryStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const fetchInquiries = useCallback(
    async (showRefreshIndicator = false) => {
      if (!orgId) return;
      if (showRefreshIndicator) setRefreshing(true);
      try {
        const query = new URLSearchParams();
        if (activeTab !== 'ALL') query.set('status', activeTab);
        if (searchTerm.trim()) query.set('search', searchTerm.trim());

        const res = await fetch(`/api/organizations/${orgId}/inquiries?${query.toString()}`);
        if (!res.ok) throw new Error('Yüklənmə xətası');
        const data = await res.json();
        setInquiries(data.inquiries || []);
        if (data.counts) setCounts(data.counts);

        // Pre-fill existing notes
        const notesMap: Record<string, string> = {};
        (data.inquiries || []).forEach((inq: ContactSubmission) => {
          notesMap[inq.id] = inq.notes || '';
        });
        setEditingNotes((prev) => ({ ...notesMap, ...prev }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orgId, activeTab, searchTerm]
  );

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (inquiryId: string, nextStatus: InquiryStatus) => {
    if (!orgId) return;
    try {
      // Optimistic update
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiryId ? { ...item, status: nextStatus } : item))
      );

      const res = await fetch(`/api/organizations/${orgId}/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        fetchInquiries();
      } else {
        // Refresh counts
        const query = new URLSearchParams();
        if (searchTerm.trim()) query.set('search', searchTerm.trim());
        const countRes = await fetch(`/api/organizations/${orgId}/inquiries?${query.toString()}`);
        const countData = await countRes.json();
        if (countData.counts) setCounts(countData.counts);
      }
    } catch (err) {
      console.error(err);
      fetchInquiries();
    }
  };

  const saveNotes = async (inquiryId: string) => {
    if (!orgId) return;
    setSavingNotesId(inquiryId);
    try {
      const notes = editingNotes[inquiryId] ?? '';
      await fetch(`/api/organizations/${orgId}/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiryId ? { ...item, notes } : item))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotesId(null);
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    if (!orgId) return;
    if (!window.confirm('Bu müraciəti birdəfəlik silmək istədiyinizə əminsiniz?')) return;
    try {
      setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
      await fetch(`/api/organizations/${orgId}/inquiries/${inquiryId}`, {
        method: 'DELETE',
      });
      fetchInquiries();
    } catch (err) {
      console.error(err);
      fetchInquiries();
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'Yeni',
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#60A5FA',
          border: 'rgba(59, 130, 246, 0.3)',
          icon: Sparkles,
        };
      case 'IN_PROGRESS':
        return {
          label: 'Baxılır',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#FBBF24',
          border: 'rgba(245, 158, 11, 0.3)',
          icon: Clock,
        };
      case 'RESOLVED':
        return {
          label: 'Həll edildi',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34D399',
          border: 'rgba(16, 185, 129, 0.3)',
          icon: CheckCircle2,
        };
      case 'ARCHIVED':
        return {
          label: 'Arxiv',
          bg: 'rgba(156, 163, 175, 0.15)',
          color: '#9CA3AF',
          border: 'rgba(156, 163, 175, 0.3)',
          icon: Archive,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('az-AZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: 'rgba(0, 211, 125, 0.15)',
                color: '#00D37D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inbox size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                Müraciətlər
              </h1>
              <p style={{ fontSize: 13, color: '#8888A0', margin: '4px 0 0 0' }}>
                Saytınızdakı əlaqə formalarından daxil olan müraciətləri qəbul edin və idarə edin.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchInquiries(true)}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            backgroundColor: '#26282E',
            border: '1px solid #383B44',
            color: '#F5F5F7',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          <span>Yenilə</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          onClick={() => setActiveTab('ALL')}
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            backgroundColor: '#1C1E24',
            border: activeTab === 'ALL' ? '1px solid #00D37D' : '1px solid #2B2E37',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 13, color: '#8888A0', fontWeight: 500, marginBottom: 6 }}>
            Ümumi Müraciətlər
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#F5F5F7' }}>{counts.total}</div>
        </div>

        <div
          onClick={() => setActiveTab('NEW')}
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            backgroundColor: '#1C1E24',
            border: activeTab === 'NEW' ? '1px solid #60A5FA' : '1px solid #2B2E37',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 13, color: '#60A5FA', fontWeight: 600, marginBottom: 6 }}>
            Yeni Gələnlər
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#60A5FA' }}>{counts.new}</div>
        </div>

        <div
          onClick={() => setActiveTab('IN_PROGRESS')}
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            backgroundColor: '#1C1E24',
            border: activeTab === 'IN_PROGRESS' ? '1px solid #FBBF24' : '1px solid #2B2E37',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 13, color: '#FBBF24', fontWeight: 600, marginBottom: 6 }}>
            Baxılmaqda olan
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#FBBF24' }}>
            {counts.inProgress}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('RESOLVED')}
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            backgroundColor: '#1C1E24',
            border: activeTab === 'RESOLVED' ? '1px solid #34D399' : '1px solid #2B2E37',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 13, color: '#34D399', fontWeight: 600, marginBottom: 6 }}>
            Həll edilmiş
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#34D399' }}>{counts.resolved}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          backgroundColor: '#1C1E24',
          padding: '12px 16px',
          borderRadius: 14,
          border: '1px solid #2B2E37',
          marginBottom: 20,
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Hamısı', count: counts.total },
            { id: 'NEW', label: 'Yeni', count: counts.new },
            { id: 'IN_PROGRESS', label: 'Baxılır', count: counts.inProgress },
            { id: 'RESOLVED', label: 'Həll edildi', count: counts.resolved },
            { id: 'ARCHIVED', label: 'Arxiv', count: counts.archived },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(0, 211, 125, 0.15)' : 'transparent',
                  color: isActive ? '#00D37D' : '#8888A0',
                  transition: 'all 0.15s',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 10,
                    backgroundColor: isActive ? 'rgba(0, 211, 125, 0.3)' : '#2B2E37',
                    color: isActive ? '#00D37D' : '#F5F5F7',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: 260, flex: 1, maxWidth: 360 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8888A0',
            }}
          />
          <input
            type="text"
            placeholder="Ada, nömrəyə, mesaja görə axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              backgroundColor: '#121418',
              border: '1px solid #2B2E37',
              borderRadius: 8,
              color: '#F5F5F7',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Inquiry List */}
      {loading ? (
        <div style={{ display: 'grid', gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 110, borderRadius: 14, backgroundColor: '#1C1E24' }}
            />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: '#1C1E24',
            borderRadius: 16,
            border: '1px dashed #383B44',
          }}
        >
          <Inbox size={48} style={{ color: '#555566', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F5F5F7', margin: '0 0 6px 0' }}>
            Müraciət tapılmadı
          </h3>
          <p style={{ fontSize: 14, color: '#8888A0', margin: 0 }}>
            {searchTerm || activeTab !== 'ALL'
              ? 'Seçilmiş filtr və ya axtarışa uyğun müraciət yoxdur.'
              : 'Saytınızdan hələ heç bir əlaqə forması müraciəti daxil olmayıb.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {inquiries.map((inq) => {
            const badge = getStatusBadge(inq.status);
            const isExpanded = selectedInquiryId === inq.id;
            const phoneDigits = inq.phone ? inq.phone.replace(/[^0-9]/g, '') : '';
            const waUrl = inq.phone
              ? formatWhatsAppUrl(
                  '994',
                  phoneDigits.startsWith('994') ? phoneDigits.slice(3) : phoneDigits,
                  `Salam ${inq.fullName}! Saytımızdan göndərdiyiniz müraciətinizlə bağlı əlaqə saxlayırıq.`
                )
              : null;

            return (
              <motion.div
                key={inq.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: '#1C1E24',
                  borderRadius: 14,
                  border: isExpanded
                    ? '1px solid #00D37D'
                    : inq.status === 'NEW'
                    ? '1px solid rgba(96, 165, 250, 0.4)'
                    : '1px solid #2B2E37',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Main Card Header / Summary */}
                <div
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: '#26282E',
                        color: '#F5F5F7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {inq.fullName ? inq.fullName.charAt(0).toUpperCase() : <User size={20} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                          {inq.fullName}
                        </h4>

                        {/* Status badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 100,
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          <badge.icon size={12} />
                          <span>{badge.label}</span>
                        </div>

                        {inq.service && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#E6C184',
                              backgroundColor: 'rgba(230, 193, 132, 0.1)',
                              border: '1px solid rgba(230, 193, 132, 0.25)',
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {inq.service}
                          </span>
                        )}
                      </div>

                      {/* Contacts & Date */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          fontSize: 12,
                          color: '#8888A0',
                          marginTop: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        {inq.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={13} style={{ color: '#00D37D' }} />
                            {inq.phone}
                          </span>
                        )}
                        {inq.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={13} style={{ color: '#60A5FA' }} />
                            {inq.email}
                          </span>
                        )}
                        <span>{formatDate(inq.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Status Select */}
                    <select
                      value={inq.status}
                      onChange={(e) => updateStatus(inq.id, e.target.value as InquiryStatus)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#26282E',
                        border: '1px solid #383B44',
                        color: '#F5F5F7',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="NEW">Yeni</option>
                      <option value="IN_PROGRESS">Baxılır</option>
                      <option value="RESOLVED">Həll edildi</option>
                      <option value="ARCHIVED">Arxivlə</option>
                    </select>

                    {/* Expand Details Button */}
                    <button
                      onClick={() =>
                        setSelectedInquiryId((prev) => (prev === inq.id ? null : inq.id))
                      }
                      style={{
                        padding: '6px 14px',
                        backgroundColor: isExpanded ? '#00D37D' : '#26282E',
                        color: isExpanded ? '#0B0D12' : '#F5F5F7',
                        border: '1px solid #383B44',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{isExpanded ? 'Bağla' : 'Bax'}</span>
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Message preview if not expanded */}
                {!isExpanded && (
                  <div
                    onClick={() => setSelectedInquiryId(inq.id)}
                    style={{
                      padding: '0 20px 14px 20px',
                      fontSize: 13,
                      color: '#B0B0B8',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    💬 {inq.message}
                  </div>
                )}

                {/* Expanded Details Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        padding: '18px 20px 22px 20px',
                        borderTop: '1px solid #2B2E37',
                        backgroundColor: '#16181E',
                      }}
                    >
                      {/* Full Message Box */}
                      <div style={{ marginBottom: 18 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#8888A0',
                            textTransform: 'uppercase',
                            marginBottom: 8,
                          }}
                        >
                          Müraciət Mətni
                        </div>
                        <div
                          style={{
                            padding: '14px 16px',
                            borderRadius: 10,
                            backgroundColor: '#1F222A',
                            border: '1px solid #2B2E37',
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: '#F5F5F7',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {inq.message}
                        </div>
                      </div>

                      {/* Quick Communication Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                          marginBottom: 20,
                        }}
                      >
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              borderRadius: 8,
                              backgroundColor: '#25D366',
                              color: '#ffffff',
                              fontSize: 13,
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            <MessageCircle size={15} />
                            <span>WhatsApp ilə yaz</span>
                          </a>
                        )}

                        {inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              borderRadius: 8,
                              backgroundColor: '#26282E',
                              border: '1px solid #383B44',
                              color: '#F5F5F7',
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            <Phone size={15} style={{ color: '#00D37D' }} />
                            <span>Zəng et ({inq.phone})</span>
                          </a>
                        )}

                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}?subject=Müraciətinizlə bağlı`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              borderRadius: 8,
                              backgroundColor: '#26282E',
                              border: '1px solid #383B44',
                              color: '#F5F5F7',
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            <Mail size={15} style={{ color: '#60A5FA' }} />
                            <span>E-poçt göndər ({inq.email})</span>
                          </a>
                        )}

                        <button
                          onClick={() => deleteInquiry(inq.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            borderRadius: 8,
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#F87171',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginLeft: 'auto',
                          }}
                        >
                          <Trash2 size={15} />
                          <span>Müraciəti sil</span>
                        </button>
                      </div>

                      {/* Internal Admin Notes */}
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#8888A0',
                            textTransform: 'uppercase',
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <FileText size={14} />
                          <span>Daxili Qeydlər (Yalnız Admin Görür)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <input
                            type="text"
                            placeholder="Məsələn: Müştəri ilə danışıldı, təlim üçün 15 noyabra vaxt təyin edildi..."
                            value={editingNotes[inq.id] ?? ''}
                            onChange={(e) =>
                              setEditingNotes((prev) => ({ ...prev, [inq.id]: e.target.value }))
                            }
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: 8,
                              backgroundColor: '#121418',
                              border: '1px solid #2B2E37',
                              color: '#F5F5F7',
                              fontSize: 13,
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => saveNotes(inq.id)}
                            disabled={savingNotesId === inq.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '10px 16px',
                              borderRadius: 8,
                              backgroundColor: '#00D37D',
                              color: '#0B0D12',
                              fontWeight: 700,
                              fontSize: 13,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Save size={14} />
                            <span>{savingNotesId === inq.id ? 'Saxlanılır...' : 'Yadda saxla'}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
