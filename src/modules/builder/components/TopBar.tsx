'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BuilderActiveMode } from '../types';
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Save,
  Eye,
  Code2,
  Palette,
  Layers,
  History,
  Image as ImageIcon,
  Loader2,
  Check,
  Building2,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';

export interface TopBarProps {
  templateName: string;
  onUpdateName: (name: string) => void;
  activeMode: BuilderActiveMode;
  onSetActiveMode: (mode: BuilderActiveMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onSave: () => void;
  saving?: boolean;
  saved?: boolean;
  hasUnsavedChanges?: boolean;
  orgName?: string;
  isPublished?: boolean;
  userName?: string;
}

export function TopBar({
  templateName,
  onUpdateName,
  activeMode,
  onSetActiveMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onSave,
  saving = false,
  saved = false,
  hasUnsavedChanges = false,
  orgName,
  isPublished = false,
  userName = 'User',
}: TopBarProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  const modes = [
    { id: 'visual' as const, label: 'Vizual', fullName: 'Vizual Redaktor', icon: Palette },
    { id: 'code' as const, label: 'Kod', fullName: 'Kod Redaktoru (STL)', icon: Code2 },
    { id: 'preview' as const, label: 'Önizləmə', fullName: 'Canlı Önizləmə', icon: Eye },
    { id: 'themes' as const, label: 'Temalar', fullName: 'Tema İdarəetməsi', icon: Layers },
    { id: 'assets' as const, label: 'Aktivlər', fullName: 'Aktivlər Meneceri', icon: ImageIcon },
    { id: 'history' as const, label: 'Tarixçə', fullName: 'Versiya Tarixçəsi', icon: History },
  ];

  // Close overflow dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    };
    if (overflowOpen) {
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }
  }, [overflowOpen]);

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % modes.length;
      onSetActiveMode(modes[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + modes.length) % modes.length;
      onSetActiveMode(modes[prevIndex].id);
    }
  };

  return (
    <>
      <style>{`
        .sitex-topbar {
          height: 56px;
          min-height: 56px;
          max-height: 56px;
          background: #090A0D;
          border-bottom: 1px solid #20242E;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          gap: 12px;
          user-select: none;
          box-sizing: border-box;
          z-index: 50;
        }
        .sitex-tab-btn {
          height: 36px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #9094A6;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-sizing: border-box;
        }
        .sitex-tab-btn:hover {
          color: #E2E4EC;
          background: rgba(255, 255, 255, 0.04);
        }
        .sitex-tab-btn:focus-visible {
          border-color: #00D37D;
          box-shadow: 0 0 0 2px rgba(0, 211, 125, 0.25);
        }
        .sitex-tab-btn.active {
          background: #181B22;
          color: #00D37D;
          font-weight: 600;
          border-color: #282D3A;
          box-shadow: inset 0 -2px 0 0 #00D37D;
        }
        .sitex-action-btn {
          height: 34px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #12141A;
          color: #C2C5D1;
          border: 1px solid #242834;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          outline: none;
        }
        .sitex-action-btn:hover:not(:disabled) {
          background: #1A1E27;
          border-color: #323849;
          color: #FFFFFF;
        }
        .sitex-action-btn:focus-visible {
          border-color: #00D37D;
          box-shadow: 0 0 0 2px rgba(0, 211, 125, 0.25);
        }
        .sitex-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .sitex-primary-btn {
          height: 34px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #00D37D;
          color: #08090C;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 211, 125, 0.25);
          transition: all 0.15s ease;
          outline: none;
        }
        .sitex-primary-btn:hover:not(:disabled) {
          background: #00E88B;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 211, 125, 0.35);
        }
        .sitex-primary-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .sitex-primary-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(0, 211, 125, 0.4);
        }
        .sitex-primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 1280px) {
          .sitex-tab-label {
            display: none;
          }
          .sitex-tab-btn {
            padding: 0 10px;
          }
          .sitex-topbar-org-text {
            display: none;
          }
        }
        @media (max-width: 960px) {
          .sitex-topbar {
            height: 52px;
            min-height: 52px;
            padding: 0 10px;
            gap: 8px;
          }
          .sitex-tabs-desktop {
            display: none !important;
          }
          .sitex-tabs-overflow {
            display: block !important;
          }
          .sitex-btn-text {
            display: none !important;
          }
          .sitex-action-btn {
            padding: 0 8px;
          }
        }
        @media (max-width: 640px) {
          .sitex-topbar-title-input {
            max-width: 90px !important;
            font-size: 12px !important;
            padding: 2px 4px !important;
          }
          .sitex-status-badge {
            display: none !important;
          }
          .sitex-save-text {
            display: none !important;
          }
          .sitex-primary-btn {
            padding: 0 10px !important;
          }
        }
      `}</style>

      <header className="sitex-topbar" role="banner">
        {/* SOL: Logo + Tema Adı + Status Rozeti */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Link
            href="/dashboard"
            title="İdarəetmə Panelinə Qayıt"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #00E58F 0%, #009E5A 100%)',
              color: '#000',
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: '-0.5px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0, 229, 143, 0.3)',
              flexShrink: 0,
            }}
          >
            SX
          </Link>

          {/* Tema Adı */}
          <input
            type="text"
            className="sitex-topbar-title-input"
            value={templateName}
            onChange={(e) => onUpdateName(e.target.value)}
            title="Tema adını dəyişdir"
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              color: '#F4F5F8',
              fontSize: 14,
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 6,
              outline: 'none',
              maxWidth: 180,
              minWidth: 80,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'border-color 0.15s ease, background 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2B313E';
              e.currentTarget.style.background = '#12141A';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.background = 'transparent';
            }}
          />

          {/* Status Rozeti */}
          {saving ? (
            <span
              className="sitex-status-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: '#60A5FA',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                padding: '2px 8px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Saxlanılır…</span>
            </span>
          ) : hasUnsavedChanges ? (
            <span
              className="sitex-status-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: '#FBBF24',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                padding: '2px 8px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24' }} />
              <span>Dəyişikliklər var</span>
            </span>
          ) : (
            <span
              className="sitex-status-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: '#00D37D',
                background: 'rgba(0, 211, 125, 0.1)',
                border: '1px solid rgba(0, 211, 125, 0.25)',
                padding: '2px 8px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Check size={11} strokeWidth={3} />
              <span>Yadda saxlanıldı</span>
            </span>
          )}
        </div>

        {/* ORTA: Segmented Control 36px 6 Rejim Sekmesi */}
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          {/* Desktop tabs */}
          <nav
            role="tablist"
            aria-label="Redaktor rejimləri"
            className="sitex-tabs-desktop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#111318',
              padding: 3,
              borderRadius: 10,
              border: '1px solid #1E222B',
              gap: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {modes.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeMode === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  onClick={() => onSetActiveMode(item.id)}
                  title={item.fullName}
                  className={`sitex-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} color={isActive ? '#00D37D' : '#787D8E'} />
                  <span className="sitex-tab-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Narrow screen overflow dropdown */}
          <div
            ref={overflowRef}
            className="sitex-tabs-overflow"
            style={{ display: 'none', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setOverflowOpen((p) => !p)}
              className="sitex-action-btn"
              style={{ height: 36, padding: '0 12px' }}
            >
              <MoreHorizontal size={16} />
              <span>
                {modes.find((m) => m.id === activeMode)?.label || 'Rejim'}
              </span>
              <ChevronDown size={13} />
            </button>
            {overflowOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 6,
                  background: '#14161D',
                  border: '1px solid #262B36',
                  borderRadius: 10,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  padding: 4,
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  minWidth: 160,
                }}
              >
                {modes.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSetActiveMode(item.id);
                        setOverflowOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: isActive ? '#1F2430' : 'transparent',
                        color: isActive ? '#00D37D' : '#C2C5D1',
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Icon size={14} color={isActive ? '#00D37D' : '#888D9E'} />
                      <span>{item.fullName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SAĞ: Geri/İrəli, İdxal/İxrac, Yayınla, Müəssisə, İstifadəçi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Geri / İrəli */}
          <div
            style={{
              display: 'flex',
              background: '#12141A',
              borderRadius: 8,
              border: '1px solid #20242E',
              padding: 2,
            }}
          >
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="sitex-action-btn"
              style={{
                height: 28,
                padding: '0 8px',
                border: 'none',
                background: 'transparent',
                borderRadius: 6,
              }}
              title="Geri al (Ctrl+Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="sitex-action-btn"
              style={{
                height: 28,
                padding: '0 8px',
                border: 'none',
                background: 'transparent',
                borderRadius: 6,
              }}
              title="İrəli al (Ctrl+Y)"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* İdxal / İxrac */}
          <button
            type="button"
            onClick={onImport}
            className="sitex-action-btn"
            title="STL və ya JSON faylından idxa et"
          >
            <Upload size={13} />
            <span className="sitex-btn-text">İdxal</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="sitex-action-btn"
            title="STL və ya JSON faylı kimi ixrac et"
          >
            <Download size={13} />
            <span className="sitex-btn-text">İxrac</span>
          </button>

          {/* Birincil Yayınla / Yadda saxla düyməsi */}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="sitex-primary-btn"
            title="Dəyişiklikləri yadda saxla və yayınla"
          >
            {saving ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : saved ? (
              <Check size={14} strokeWidth={3} />
            ) : (
              <Save size={14} strokeWidth={2.5} />
            )}
            <span>{saved ? 'Yayınlandı' : 'Yayınla'}</span>
          </button>

          {/* Müəssisə Məlumatı (By Salmanov / Yayınlanıb) */}
          {orgName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                background: '#12141A',
                border: '1px solid #20242E',
                borderRadius: 8,
                height: 34,
                boxSizing: 'border-box',
              }}
            >
              <Building2 size={13} color="#00D37D" />
              <span
                className="sitex-topbar-org-text"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#E0E3EB',
                  maxWidth: 120,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {orgName}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 100,
                  background: isPublished
                    ? 'rgba(0, 211, 125, 0.15)'
                    : 'rgba(251, 191, 36, 0.15)',
                  color: isPublished ? '#00D37D' : '#FBBF24',
                  whiteSpace: 'nowrap',
                }}
              >
                {isPublished ? 'Yayınlanıb' : 'Qaralama'}
              </span>
            </div>
          )}

          {/* İstifadəçi Avatarı */}
          <div
            title={`İstifadəçi: ${userName}`}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1F2430 0%, #151820 100%)',
              border: '1px solid #2B313E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#00D37D',
              flexShrink: 0,
            }}
          >
            {userName[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>
    </>
  );
}
