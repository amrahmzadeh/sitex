'use client';

import React from 'react';
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
  Image,
  Loader2,
  Check,
  Sparkles,
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
  const modes = [
    { id: 'visual' as const, label: 'Vizual', icon: Palette },
    { id: 'code' as const, label: 'Kod (STL)', icon: Code2 },
    { id: 'preview' as const, label: 'Canlı Önizləmə', icon: Eye },
    { id: 'themes' as const, label: 'Temalar', icon: Layers },
    { id: 'assets' as const, label: 'Aktivlər', icon: Image },
    { id: 'history' as const, label: 'Tarixçə', icon: History },
  ];

  return (
    <header
      style={{
        height: 54,
        background: '#0B0C0E',
        borderBottom: '1px solid #1C1F26',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Brand & Theme Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #00E58F 0%, #00A862 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 13,
              color: '#000',
              boxShadow: '0 2px 8px rgba(0,229,143,0.25)',
              letterSpacing: -0.5,
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
              color: '#F4F4F6',
              fontSize: 14,
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 6,
              outline: 'none',
              maxWidth: 200,
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#2B303C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          />
        </div>

        {hasUnsavedChanges ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              background: 'rgba(245,158,11,0.1)',
              color: '#FBBF24',
              padding: '3px 8px',
              borderRadius: 20,
              fontWeight: 600,
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#FBBF24',
              }}
            />
            Yadda saxlanılmayıb
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              background: 'rgba(0,229,143,0.08)',
              color: '#00D37D',
              padding: '3px 8px',
              borderRadius: 20,
              fontWeight: 600,
              border: '1px solid rgba(0,229,143,0.2)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00D37D',
              }}
            />
            Yadda saxlanılıb
          </span>
        )}
      </div>

      {/* Center Mode Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#13151A',
          padding: 3,
          borderRadius: 8,
          border: '1px solid #20242D',
          gap: 2,
        }}
      >
        {modes.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSetActiveMode(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: isActive ? '#1F232D' : 'transparent',
                color: isActive ? '#00E58F' : '#9094A0',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} color={isActive ? '#00E58F' : '#787C8A'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Actions: Undo/Redo, Export, Import, Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Undo / Redo */}
        <div
          style={{
            display: 'flex',
            background: '#13151A',
            borderRadius: 8,
            border: '1px solid #20242D',
            padding: 2,
          }}
        >
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: '5px 8px',
              background: 'transparent',
              color: canUndo ? '#C0C0D0' : '#454854',
              border: 'none',
              borderRadius: 6,
              cursor: canUndo ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Geri al (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: '5px 8px',
              background: 'transparent',
              color: canRedo ? '#C0C0D0' : '#454854',
              border: 'none',
              borderRadius: 6,
              cursor: canRedo ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
            }}
            title="İrəli al (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Import & Export */}
        <button
          type="button"
          onClick={onImport}
          style={{
            padding: '6px 10px',
            background: '#13151A',
            color: '#B0B4C0',
            border: '1px solid #20242D',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'background 0.15s ease',
          }}
        >
          <Upload size={13} />
          <span>İdxal</span>
        </button>

        <button
          type="button"
          onClick={onExport}
          style={{
            padding: '6px 10px',
            background: '#13151A',
            color: '#B0B4C0',
            border: '1px solid #20242D',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'background 0.15s ease',
          }}
        >
          <Download size={13} />
          <span>İxrac</span>
        </button>

        {/* Primary Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{
            padding: '6px 14px',
            background: saved
              ? '#00D37D'
              : 'linear-gradient(135deg, #00E58F 0%, #00B368 100%)',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 10px rgba(0,229,143,0.2)',
            transition: 'transform 0.1s ease',
          }}
        >
          {saving ? (
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
          ) : saved ? (
            <Check size={13} strokeWidth={3} />
          ) : (
            <Save size={13} strokeWidth={2.5} />
          )}
          <span>{saved ? 'Saxlandı' : 'Yadda Saxla'}</span>
        </button>
      </div>
    </header>
  );
}
