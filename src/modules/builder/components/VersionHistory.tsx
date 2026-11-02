'use client';

import React, { useState, useMemo } from 'react';
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
  GitCompare,
  Trash2,
  Tag,
  Check,
} from 'lucide-react';
import { ThemeVersionSnapshot } from '../types';

interface VersionHistoryProps {
  versions: ThemeVersionSnapshot[];
  onRestoreVersion: (snapshot: ThemeVersionSnapshot) => void;
  onCreateSnapshot: (note: string) => void;
  onPruneSnapshots?: () => void;
}

export function VersionHistory({
  versions,
  onRestoreVersion,
  onCreateSnapshot,
  onPruneSnapshots,
}: VersionHistoryProps) {
  const [note, setNote] = useState('');
  const [selectedTag, setSelectedTag] = useState<'Qaralama' | 'Stabil' | 'Buraxılış'>('Stabil');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(
    versions[0]?.id || null
  );
  const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(
    versions[1]?.id || null
  );
  const [viewMode, setViewMode] = useState<'code' | 'diff'>('diff');

  const handleCreate = () => {
    if (!note.trim()) return;
    onCreateSnapshot(`[${selectedTag}] ${note.trim()}`);
    setNote('');
  };

  const selectedSnapshot = versions.find((v) => v.id === selectedSnapshotId);
  const compareSnapshot = versions.find((v) => v.id === compareSnapshotId) || versions[1] || versions[0];

  // Simple line-by-line diff calculation
  const diffLines = useMemo(() => {
    if (!selectedSnapshot || !compareSnapshot) return [];

    const oldLines = (compareSnapshot.stlCode || '').split('\n');
    const newLines = (selectedSnapshot.stlCode || '').split('\n');

    const result: Array<{ type: 'same' | 'added' | 'removed'; text: string }> = [];
    const maxLen = Math.max(oldLines.length, newLines.length);

    // Simple diff matcher
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);

    newLines.forEach((line) => {
      if (!oldSet.has(line)) {
        result.push({ type: 'added', text: `+ ${line}` });
      } else {
        result.push({ type: 'same', text: `  ${line}` });
      }
    });

    oldLines.forEach((line) => {
      if (!newSet.has(line)) {
        result.push({ type: 'removed', text: `- ${line}` });
      }
    });

    return result;
  }, [selectedSnapshot, compareSnapshot]);

  return (
    <div
      style={{
        flex: 1,
        height: 'calc(100vh - 56px)',
        background: '#0D0E11',
        overflowY: 'auto',
        padding: '32px 40px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#F5F5F7',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <History size={24} color="#00D37D" />
              Tema Versiya Tarixçəsi & Vizual Diff
            </h1>
            <p style={{ fontSize: 14, color: '#8888A0', marginTop: 6 }}>
              Yaradılmış versiyaları izləyin, istənilən iki versiyanı müqayisə edin və geri bərpa edin.
            </p>
          </div>

          {versions.length > 10 && onPruneSnapshots && (
            <button
              type="button"
              onClick={onPruneSnapshots}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #333842',
                background: '#14161C',
                color: '#8888A0',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              Köhnə Versiyaları Təmizlə (Son 10-u Saxla)
            </button>
          )}
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
          {/* Tag Selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Stabil', 'Buraxılış', 'Qaralama'] as const).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: selectedTag === tag ? '1px solid #00D37D' : '1px solid #282C35',
                  background: selectedTag === tag ? 'rgba(0,211,125,0.12)' : '#0B0C0E',
                  color: selectedTag === tag ? '#00D37D' : '#8888A0',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Yeni versiya qeydi yazın (məs: Əsas rənglər yeniləndi)..."
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
              <div
                style={{
                  padding: 24,
                  background: '#14161C',
                  borderRadius: 12,
                  border: '1px solid #252932',
                  color: '#8888A0',
                  textAlign: 'center',
                }}
              >
                Hələ heç bir versiya saxlanılmayıb.
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
                      background: isSelected ? 'rgba(0,211,125,0.08)' : '#14161C',
                      border: isSelected ? '1px solid #00D37D' : '1px solid #252932',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isSelected ? '#00D37D' : '#FFF',
                        }}
                      >
                        v{ver.version} {idx === 0 && '(Ən Son)'}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#8888A0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
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
                          if (
                            confirm(
                              `"${ver.note}" versiyasına geri dönmək istədiyinizə əminsiniz?`
                            )
                          ) {
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

          {/* Snapshot Inspector / Diff Area */}
          <div
            style={{
              background: '#14161C',
              borderRadius: 12,
              border: '1px solid #252932',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selectedSnapshot ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                      Versiya: v{selectedSnapshot.version}
                    </h3>
                    <span style={{ fontSize: 12, color: '#8888A0' }}>
                      {new Date(selectedSnapshot.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* View Mode Toggle: Code vs Diff */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('diff')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: viewMode === 'diff' ? '1px solid #00D37D' : '1px solid #282C35',
                        background: viewMode === 'diff' ? 'rgba(0,211,125,0.12)' : 'transparent',
                        color: viewMode === 'diff' ? '#00D37D' : '#8888A0',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <GitCompare size={13} />
                      Müqayisəli Diff
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('code')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: viewMode === 'code' ? '1px solid #00D37D' : '1px solid #282C35',
                        background: viewMode === 'code' ? 'rgba(0,211,125,0.12)' : 'transparent',
                        color: viewMode === 'code' ? '#00D37D' : '#8888A0',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Code size={13} />
                      Tam STL Kodu
                    </button>
                  </div>
                </div>

                {viewMode === 'diff' ? (
                  <div
                    style={{
                      flex: 1,
                      background: '#0B0C0E',
                      borderRadius: 8,
                      border: '1px solid #222',
                      padding: 16,
                      fontFamily: '"Fira Code", monospace',
                      fontSize: 12,
                      lineHeight: '20px',
                      overflowY: 'auto',
                      maxHeight: 460,
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#8888A0', marginBottom: 10 }}>
                      Müqayisə edilir: v{selectedSnapshot.version} ilə v{compareSnapshot.version}
                    </div>
                    {diffLines.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          background:
                            line.type === 'added'
                              ? 'rgba(16,185,129,0.15)'
                              : line.type === 'removed'
                              ? 'rgba(239,68,68,0.15)'
                              : 'transparent',
                          color:
                            line.type === 'added'
                              ? '#34D399'
                              : line.type === 'removed'
                              ? '#F87171'
                              : '#8888A0',
                          padding: '1px 6px',
                          borderRadius: 2,
                          whiteSpace: 'pre',
                        }}
                      >
                        {line.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      background: '#0B0C0E',
                      borderRadius: 8,
                      border: '1px solid #222',
                      padding: 16,
                      fontFamily: '"Fira Code", monospace',
                      fontSize: 12,
                      lineHeight: '18px',
                      color: '#00D37D',
                      overflowY: 'auto',
                      maxHeight: 460,
                      whiteSpace: 'pre',
                    }}
                  >
                    {selectedSnapshot.stlCode}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#8888A0', margin: 'auto' }}>
                Soldan bir versiya seçin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
