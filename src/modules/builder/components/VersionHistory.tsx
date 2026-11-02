'use client';

import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Code,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ThemeVersionSnapshot } from '../types';

interface VersionHistoryProps {
  versions: ThemeVersionSnapshot[];
  onRestoreVersion: (snapshot: ThemeVersionSnapshot) => void;
  onCreateSnapshot: (note: string) => void;
}

export function VersionHistory({
  versions,
  onRestoreVersion,
  onCreateSnapshot,
}: VersionHistoryProps) {
  const [note, setNote] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(
    versions[0]?.id || null
  );

  const handleCreate = () => {
    if (!note.trim()) return;
    onCreateSnapshot(note.trim());
    setNote('');
  };

  const selectedSnapshot = versions.find((v) => v.id === selectedSnapshotId);

  return (
    <div style={{ flex: 1, height: 'calc(100vh - 56px)', background: '#0D0E11', overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F5F5F7', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={24} color="#00D37D" />
            Tema Versiya Tarixçəsi & Bərpa
          </h1>
          <p style={{ fontSize: 14, color: '#8888A0', marginTop: 6 }}>
            Yaradılmış bütün versiyaları izləyin, istənilən əvvəlki vəziyyətə bir kliklə geri dönün.
          </p>
        </div>

        {/* Create Snapshot Bar */}
        <div
          style={{
            padding: 18,
            background: '#14161C',
            borderRadius: 12,
            border: '1px solid #252932',
            marginBottom: 28,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Yeni versiya qeydi yazın (məs: Başlıq rəngləri dəyişdirildi)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#0D0E11',
              border: '1px solid #282C35',
              color: '#FFF',
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!note.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 8,
              background: note.trim() ? '#00D37D' : '#222',
              color: note.trim() ? '#000' : '#666',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: note.trim() ? 'pointer' : 'default',
            }}
          >
            <Plus size={16} />
            Versiya Yarat
          </button>
        </div>

        {/* Main Content Layout: List + Diff Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
          {/* Version List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {versions.length === 0 ? (
              <div style={{ padding: 24, background: '#14161C', borderRadius: 12, border: '1px solid #252932', color: '#8888A0', textAlign: 'center' }}>
                Hələ heç bir versiya saxlanılmayıb. Yuxarıdan ilk versiyanızı qeyd edə bilərsiniz.
              </div>
            ) : (
              versions.map((ver, idx) => {
                const isSelected = ver.id === selectedSnapshotId;
                const date = new Date(ver.createdAt);

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedSnapshotId(ver.id)}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      background: isSelected ? 'rgba(0,211,125,0.1)' : '#14161C',
                      border: isSelected ? '1px solid #00D37D' : '1px solid #252932',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#00D37D' : '#FFF' }}>
                        v{ver.version} {idx === 0 && '(Ən Son)'}
                      </span>
                      <span style={{ fontSize: 11, color: '#8888A0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {date.toLocaleTimeString()}
                      </span>
                    </div>

                    <p style={{ fontSize: 12, color: '#C0C0D0', margin: '0 0 10px', lineHeight: 1.4 }}>
                      {ver.note}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#6A6A80' }}>
                        {date.toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${ver.note}" versiyasına geri dönmək istədiyinizə əminsiniz?`)) {
                            onRestoreVersion(ver);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: '#1F232B',
                          color: '#00D37D',
                          border: '1px solid #282C35',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={12} />
                        Geri Yüklə
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Snapshot Details & Code Inspector */}
          <div style={{ background: '#14161C', borderRadius: 12, border: '1px solid #252932', padding: 24, display: 'flex', flexDirection: 'column' }}>
            {selectedSnapshot ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                      Versiya: v{selectedSnapshot.version}
                    </h3>
                    <span style={{ fontSize: 12, color: '#8888A0' }}>
                      Yaradılma tarixi: {new Date(selectedSnapshot.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestoreVersion(selectedSnapshot)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#00D37D',
                      color: '#000',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={14} />
                    Bu Versiyanı Aktivləşdir
                  </button>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#8888A0', display: 'block', marginBottom: 4 }}>
                    Dəyişiklik Qeydi:
                  </span>
                  <div style={{ padding: '10px 14px', background: '#0D0E11', borderRadius: 8, border: '1px solid #222', fontSize: 13, color: '#E0E0E6' }}>
                    {selectedSnapshot.note}
                  </div>
                </div>

                <span style={{ fontSize: 12, fontWeight: 600, color: '#8888A0', display: 'block', marginBottom: 6 }}>
                  Həmin versiyanın STL Kodu:
                </span>
                <div
                  style={{
                    flex: 1,
                    background: '#0B0C0E',
                    borderRadius: 8,
                    border: '1px solid #222',
                    padding: 16,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    lineHeight: '18px',
                    color: '#00D37D',
                    overflowY: 'auto',
                    maxHeight: 420,
                    whiteSpace: 'pre',
                  }}
                >
                  {selectedSnapshot.stlCode}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#8888A0', margin: 'auto' }}>
                Detallara baxmaq üçün soldan bir versiya seçin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
