'use client';

import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Plus,
  Download,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { ThemeVersionRecord } from './types';

interface ThemeVersionHistoryProps {
  versions: ThemeVersionRecord[];
  currentTheme: ThemeConfig;
  onRestore: (version: ThemeVersionRecord) => void;
  onCreateSnapshot: (title: string, note?: string) => void;
}

export default function ThemeVersionHistory({
  versions,
  onRestore,
  onCreateSnapshot,
}: ThemeVersionHistoryProps) {
  const [snapshotTitle, setSnapshotTitle] = useState('');
  const [snapshotNote, setSnapshotNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotTitle.trim()) return;
    onCreateSnapshot(snapshotTitle.trim(), snapshotNote.trim() || undefined);
    setSnapshotTitle('');
    setSnapshotNote('');
    setCreating(false);
  };

  const handleRestore = (v: ThemeVersionRecord) => {
    onRestore(v);
    setRestoredId(v.id);
    setTimeout(() => setRestoredId(null), 2500);
  };

  const getTriggerBadge = (trigger: ThemeVersionRecord['trigger']) => {
    switch (trigger) {
      case 'manual':
        return { label: 'Əl ilə Saxlama', color: '#00D37D', bg: 'rgba(0,211,125,0.12)' };
      case 'code':
        return { label: 'STL Kodu', color: '#7C5CFC', bg: 'rgba(124,92,252,0.12)' };
      case 'visual':
        return { label: 'Vizual Redaktor', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' };
      case 'publish':
        return { label: 'Yayınlama', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
      case 'import':
        return { label: 'İdxal', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
      default:
        return { label: 'Avtomatik Saxlama', color: '#8888A0', bg: 'rgba(255,255,255,0.06)' };
    }
  };

  const downloadVersionSTL = (v: ThemeVersionRecord) => {
    const blob = new Blob([v.stlCode || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${v.theme.id || 'theme'}_v${v.version}.stl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 20,
        background: '#161822',
        borderRadius: 12,
        border: '1px solid #282A3A',
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={20} color="#00D37D" />
            Tema Versiya Tarixçəsi
          </h2>
          <p style={{ fontSize: 13, color: '#8888A0', margin: '4px 0 0' }}>
            Temanızın dəyişiklik nöqtələrini izləyin, istənilən əvvəlki versiyaya dərhal qayıdın.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreating(!creating)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#00D37D',
            color: '#000000',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          Yeni Versiya Yarat
        </button>
      </div>

      {/* Create Snapshot Form */}
      {creating && (
        <form
          onSubmit={handleCreate}
          style={{
            background: '#1C1F2E',
            padding: 16,
            borderRadius: 10,
            border: '1px solid #00D37D',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#F0F2F8' }}>
            Cari Vəziyyətin Şəklini (Snapshot) Saxla
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              type="text"
              placeholder="Versiya başlığı (məs: Yeni rənglər tətbiq edildi)..."
              value={snapshotTitle}
              onChange={(e) => setSnapshotTitle(e.target.value)}
              required
              style={{
                background: '#131520',
                border: '1px solid #33374D',
                borderRadius: 6,
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Qeyd (İxtiyari izahat)..."
              value={snapshotNote}
              onChange={(e) => setSnapshotNote(e.target.value)}
              style={{
                background: '#131520',
                border: '1px solid #33374D',
                borderRadius: 6,
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => setCreating(false)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #33374D',
                background: 'transparent',
                color: '#8888A0',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Ləğv et
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: '#00D37D',
                color: '#000000',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Yadda Saxla
            </button>
          </div>
        </form>
      )}

      {/* Version List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {versions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#686B80', background: '#12141C', borderRadius: 8 }}>
            <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 13 }}>Hələ heç bir versiya qeydə alınmayıb.</p>
          </div>
        ) : (
          versions.map((v) => {
            const badge = getTriggerBadge(v.trigger);
            const isRestored = restoredId === v.id;
            const dateStr = new Date(v.timestamp).toLocaleString('az-AZ', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={v.id}
                style={{
                  background: '#1C1F2E',
                  borderRadius: 10,
                  border: isRestored ? '1px solid #00D37D' : '1px solid #2B2F44',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: v.theme.primaryColor || '#00D37D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    v{v.version}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F2F8' }}>{v.title}</span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: badge.bg,
                          color: badge.color,
                          fontWeight: 600,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#8888A0' }}>⏱ {dateStr}</span>
                      <span style={{ fontSize: 11, color: '#8888A0' }}>👤 {v.author}</span>
                      {v.note && <span style={{ fontSize: 11, color: '#D4A574' }}>• {v.note}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => downloadVersionSTL(v)}
                    title="Bu versiyanın STL kodunu yüklə"
                    style={{
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: '1px solid #33374D',
                      background: '#131520',
                      color: '#8888A0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                    }}
                  >
                    <Download size={12} />
                    STL
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRestore(v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: isRestored ? '#00D37D' : '#2A2E44',
                      color: isRestored ? '#000000' : '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isRestored ? <CheckCircle2 size={13} /> : <RotateCcw size={13} />}
                    {isRestored ? 'Bərpa Edildi' : 'Bərpa Et'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

