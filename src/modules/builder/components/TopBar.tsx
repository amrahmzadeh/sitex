'use client';

import React from 'react';
import { DeviceMode } from '../types';
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
} from 'lucide-react';

interface TopBarProps {
  templateName: string;
  onUpdateName: (name: string) => void;
  device: DeviceMode;
  onSetDevice: (device: DeviceMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onSave: () => void;
  saving?: boolean;
}

export function TopBar({
  templateName,
  onUpdateName,
  device,
  onSetDevice,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onSave,
  saving,
}: TopBarProps) {
  return (
    <header
      style={{
        height: 56,
        background: '#181B1E',
        borderBottom: '1px solid #383334',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
    >
      {/* Title Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="text"
          value={templateName}
          onChange={(e) => onUpdateName(e.target.value)}
          style={{
            background: 'transparent',
            border: '1px solid transparent',
            color: '#F5F5F7',
            fontSize: 16,
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: 6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#383334')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        />
        <span style={{ fontSize: 11, background: 'rgba(0,211,125,0.15)', color: '#00D37D', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
          Wix-Style Builder
        </span>
      </div>

      {/* Device Viewport Selector */}
      <div style={{ display: 'flex', background: '#121416', padding: 3, borderRadius: 8, border: '1px solid #383334' }}>
        <button
          onClick={() => onSetDevice('desktop')}
          style={{
            padding: '6px 12px',
            background: device === 'desktop' ? '#282C32' : 'transparent',
            color: device === 'desktop' ? '#00D37D' : '#8888A0',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
          title="Desktop Görünüşü"
        >
          <Monitor size={16} />
        </button>
        <button
          onClick={() => onSetDevice('tablet')}
          style={{
            padding: '6px 12px',
            background: device === 'tablet' ? '#282C32' : 'transparent',
            color: device === 'tablet' ? '#00D37D' : '#8888A0',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
          title="Planşet Görünüşü"
        >
          <Tablet size={16} />
        </button>
        <button
          onClick={() => onSetDevice('mobile')}
          style={{
            padding: '6px 12px',
            background: device === 'mobile' ? '#282C32' : 'transparent',
            color: device === 'mobile' ? '#00D37D' : '#8888A0',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
          title="Mobil Görünüş"
        >
          <Smartphone size={16} />
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Undo / Redo */}
        <div style={{ display: 'flex', gap: 2, marginRight: 8 }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: '6px 8px',
              background: 'transparent',
              border: 'none',
              color: canUndo ? '#F5F5F7' : '#555',
              cursor: canUndo ? 'pointer' : 'not-allowed',
            }}
            title="Geri al (Undo)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: '6px 8px',
              background: 'transparent',
              border: 'none',
              color: canRedo ? '#F5F5F7' : '#555',
              cursor: canRedo ? 'pointer' : 'not-allowed',
            }}
            title="İrəli (Redo)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* JSON Import/Export */}
        <button
          onClick={onImport}
          style={{
            padding: '6px 12px',
            background: '#22252A',
            border: '1px solid #383334',
            color: '#E2E2E5',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Upload size={14} /> İdxal
        </button>
        <button
          onClick={onExport}
          style={{
            padding: '6px 12px',
            background: '#22252A',
            border: '1px solid #383334',
            color: '#E2E2E5',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Download size={14} /> İxrac
        </button>

        {/* Save & Publish Theme */}
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            padding: '8px 16px',
            background: '#00D37D',
            color: '#000000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <Save size={15} /> {saving ? 'Yadda saxlanılır...' : 'Yadda Saxla & Yayımla'}
        </button>
      </div>
    </header>
  );
}
