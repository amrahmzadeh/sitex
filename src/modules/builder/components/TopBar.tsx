'use client';

import React from 'react';
import { DeviceMode, BuilderActiveMode } from '../types';
import {
  Monitor,
  Tablet,
  Smartphone,
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
  Image,
  Globe,
  Loader2,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface TopBarProps {
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
  saving,
  saved,
  hasUnsavedChanges,
}: TopBarProps) {
  return (
    <header
      style={{
        height: 56,
        background: '#13151A',
        borderBottom: '1px solid #22262E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 50,
      }}
    >
      {/* Title & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#00D37D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 13,
              color: '#000',
            }}
          >
            SX
          </div>
          <input
            type="text"
            value={templateName}
            onChange={(e) => onUpdateName(e.target.value)}
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              color: '#F5F5F7',
              fontSize: 15,
              fontWeight: 700,
              padding: '3px 6px',
              borderRadius: 6,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#2E333E')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          />
        </div>

        {hasUnsavedChanges ? (
          <span style={{ fontSize: 11, background: 'rgba(251,191,36,0.12)', color: '#FBBF24', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
            ● Dəyişikliklər var
          </span>
        ) : (
          <span style={{ fontSize: 11, background: 'rgba(0,211,125,0.12)', color: '#00D37D', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
            ✓ Yadda saxlanılıb
          </span>
        )}
      </div>

      {/* Mode Switcher Buttons */}
      <div
        style={{
          display: 'flex',
          background: '#0B0C0E',
          padding: 3,
          borderRadius: 10,
          border: '1px solid #22262E',
          gap: 2,
        }}
      >
        {[
          { id: 'visual', label: 'Vizual Redaktor', icon: Palette },
          { id: 'code', label: 'Kod Redaktoru (STL)', icon: Code2 },
          { id: 'preview', label: 'Canlı Önizləmə', icon: Eye },
          { id: 'themes', label: 'Tema İdarəetməsi', icon: Layers },
          { id: 'assets', label: 'Aktivlər', icon: Image },
          { id: 'history', label: 'Tarixçə', icon: History },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSetActiveMode(item.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#1F232B' : 'transparent',
                color: isActive ? '#00D37D' : '#8888A0',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} color={isActive ? '#00D37D' : '#8888A0'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Undo / Redo & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Undo / Redo */}
        <div style={{ display: 'flex', gap: 2, background: '#0B0C0E', padding: 2, borderRadius: 8, border: '1px solid #22262E' }}>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: '6px 10px',
              background: 'transparent',
              color: canUndo ? '#C0C0D0' : '#444',
              border: 'none',
              borderRadius: 6,
              cursor: canUndo ? 'pointer' : 'default',
            }}
            title="Geri al (Undo)"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: '6px 10px',
              background: 'transparent',
              color: canRedo ? '#C0C0D0' : '#444',
              border: 'none',
              borderRadius: 6,
              cursor: canRedo ? 'pointer' : 'default',
            }}
            title="İrəli al (Redo)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Import & Export */}
        <button
          type="button"
          onClick={onImport}
          style={{
            padding: '7px 12px',
            background: 'rgba(255,255,255,0.03)',
            color: '#C0C0D0',
            border: '1px solid #282C35',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Upload size={13} />
          İdxal
        </button>

        <button
          type="button"
          onClick={onExport}
          style={{
            padding: '7px 12px',
            background: 'rgba(255,255,255,0.03)',
            color: '#C0C0D0',
            border: '1px solid #282C35',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Download size={13} />
          İxrac
        </button>

        {/* Save button */}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{
            padding: '7px 16px',
            background: saved ? '#00D37D' : '#00D37D',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {saving ? (
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
          ) : saved ? (
            <Check size={13} />
          ) : (
            <Save size={13} />
          )}
          <span>{saved ? 'Saxlandı' : 'Yadda Saxla'}</span>
        </button>
      </div>
    </header>
  );
}
