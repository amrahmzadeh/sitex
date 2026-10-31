'use client';

import { Undo, Redo, Save, Play, Smartphone, Tablet, Layout } from 'lucide-react';

export interface TopBarProps {
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
}

export function TopBar({ device, onDeviceChange, onUndo, onRedo, onSave, onPublish, canUndo, canRedo, dirty }: TopBarProps) {
  const deviceLabels: Record<string, string> = { desktop: 'Masaüstü', tablet: 'Tablet', mobile: 'Mobil' };

  return (
    <header style={{ height: 56, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20', background: '#ffffff', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 6, background: '#ffffff', cursor: canUndo ? 'pointer' : 'not-allowed', opacity: canUndo ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title='Geri al'
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 6, background: '#ffffff', cursor: canRedo ? 'pointer' : 'not-allowed', opacity: canRedo ? 1 : 0.5, marginLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title='İleri al'
        >
          <Redo size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{deviceLabels[device]}</span>
        <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', background: '#ffffff' }}>
          {['desktop', 'tablet', 'mobile'].map((d) => {
            let Icon: React.ComponentType<{ size?: number }> = Layout;
            if (d === 'tablet') Icon = Tablet;
            if (d === 'mobile') Icon = Smartphone;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onDeviceChange(d as 'desktop' | 'tablet' | 'mobile')}
                style={{
                  padding: '4px 10px', border: 'none', background: device === d ? '#00D37D' : 'transparent',
                  color: device === d ? '#ffffff' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon size={10} />
              </div>
                {d[0].toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty}
          style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, background: '#ffffff', cursor: dirty ? 'pointer' : 'not-allowed', opacity: dirty ? 1 : 0.5, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          title='Kaydet'
        >
          <Save size={14} /> Kaydet
        </button>
        <button
          type="button"
          onClick={onPublish}
          style={{ padding: '8px 16px', border: '1px solid #00D37D', borderRadius: 6, background: '#00D37D', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          title='Yayınla'
        >
          <Play size={14} /> Yayınla
        </button>
      </div>
    </header>
  );
}
