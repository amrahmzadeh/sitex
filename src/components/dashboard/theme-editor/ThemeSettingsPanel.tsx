'use client';

import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Tag,
  Shield,
  AlertTriangle,
  Check,
  Sparkles,
} from 'lucide-react';
import { ThemeConfig, defaultThemes } from '@/lib/themes';

interface ThemeSettingsPanelProps {
  theme: ThemeConfig;
  onChange: (updated: ThemeConfig) => void;
  onResetDefault: () => void;
}

export default function ThemeSettingsPanel({
  theme,
  onChange,
  onResetDefault,
}: ThemeSettingsPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: 20,
        background: '#161822',
        borderRadius: 12,
        border: '1px solid #282A3A',
        minHeight: '100%',
      }}
    >
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={20} color="#00D37D" />
          Tema Qlobal Parametrləri
        </h2>
        <p style={{ fontSize: 13, color: '#8888A0', margin: '4px 0 0' }}>
          Temanın metadata məlumatlarını, versiya nömrəsini və ilkin sazlamalarını idarə edin.
        </p>
      </div>

      {/* Metadata Section */}
      <div
        style={{
          background: '#1C1F2E',
          borderRadius: 10,
          border: '1px solid #2B2F44',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F2F8' }}>
          Meta Məlumatlar (STL Header)
        </span>

        <div>
          <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
            Tema Adı (Name)
          </label>
          <input
            type="text"
            value={theme.name || ''}
            onChange={(e) => onChange({ ...theme, name: e.target.value })}
            style={{
              width: '100%',
              background: '#131520',
              border: '1px solid #33374D',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#FFFFFF',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
            Təsvir (Description)
          </label>
          <textarea
            value={theme.description || ''}
            onChange={(e) => onChange({ ...theme, description: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              background: '#131520',
              border: '1px solid #33374D',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#FFFFFF',
              fontSize: 12,
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
              Tema İdentifikatoru (ID)
            </label>
            <input
              type="text"
              value={theme.id || ''}
              readOnly
              style={{
                width: '100%',
                background: '#10121C',
                border: '1px solid #282A3A',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#8888A0',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
              Baza Şablon ID (TemplateId)
            </label>
            <input
              type="text"
              value={theme.templateId || 'modern'}
              readOnly
              style={{
                width: '100%',
                background: '#10121C',
                border: '1px solid #282A3A',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#8888A0',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset to Default */}
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.05)',
          borderRadius: 10,
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} color="#EF4444" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>
            Təhlükəli Zona
          </span>
        </div>

        <p style={{ fontSize: 12, color: '#B0B0C0', margin: 0 }}>
          Bütün fərdi dəyişiklikləri sıfırlayıb standart sistem temasına qayıtmaq istəyirsinizsə, bu düymədən istifadə edin.
        </p>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #EF4444',
              background: 'transparent',
              color: '#EF4444',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            İlkin Standart Temaya Sıfırla
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => {
                onResetDefault();
                setConfirmReset(false);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Bəli, Əminəm, Sıfırla
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #33374D',
                background: 'transparent',
                color: '#8888A0',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              İmtina et
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
