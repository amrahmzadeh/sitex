'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, RefreshCw, UserPlus, LogIn, Settings as SettingsIcon } from 'lucide-react';
import { PageHeader, LoadingState } from '@/components/common';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

interface PlatformSettings {
  registration_enabled: string;
  login_enabled: string;
}

export default function AdminSettingsPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>({
    registration_enabled: 'true',
    login_enabled: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<{ settings?: PlatformSettings }>('/api/admin/settings');
      if (data.settings) setSettings(data.settings);
    } catch (err: any) {
      toastError(err.message || 'Parametrlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/admin/settings', settings);
      toastSuccess('Platforma parametrləri yadda saxlandı');
    } catch (err: any) {
      toastError(err.message || 'Yadda saxlanarkən xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({
    value,
    onChange,
    label,
    description,
    icon: Icon,
    onColor = '#00D37D',
  }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    description: string;
    icon: React.FC<{ size: number; color?: string }>;
    onColor?: string;
  }) => {
    const isOn = value === 'true';
    return (
      <div
        className="dash-card"
        style={{
          padding: 24,
          marginBottom: 16,
          borderRadius: 16,
          background: '#1A1A1E',
          border: '1px solid #383334',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: isOn ? `${onColor}20` : 'rgba(136,136,160,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} color={isOn ? onColor : '#8888A0'} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', margin: '0 0 4px' }}>
              {label}
            </p>
            <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>{description}</p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => onChange(isOn ? 'false' : 'true')}
              style={{
                width: 52,
                height: 28,
                borderRadius: 14,
                border: 'none',
                background: isOn ? onColor : '#2A2A3A',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
              aria-label={label}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: isOn ? 27 : 3,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <PageHeader
        title="Platforma Parametrləri"
        description="Qlobal sistem parametrləri və qeydiyyat/giriş nəzarəti"
        icon={SettingsIcon}
        iconColor="#F87171"
        actions={
          <button
            onClick={fetchSettings}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <RefreshCw size={14} /> Yenilə
          </button>
        }
      />

      {loading ? (
        <LoadingState rows={2} />
      ) : (
        <div>
          <Toggle
            value={settings.registration_enabled}
            onChange={(v) => setSettings((s) => ({ ...s, registration_enabled: v }))}
            label="Qeydiyyat Açığı"
            description="Yeni istifadəçilərin platformada qeydiyyatdan keçməsinə icazə verilsin"
            icon={UserPlus}
            onColor="#00D37D"
          />

          <Toggle
            value={settings.login_enabled}
            onChange={(v) => setSettings((s) => ({ ...s, login_enabled: v }))}
            label="Sistemə Giriş"
            description="Mövcud istifadəçilərin sistemə daxil olmasına icazə verilsin (Super Admin həmişə daxil ola bilər)"
            icon={LogIn}
            onColor="#60A5FA"
          />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="dash-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', fontSize: 14 }}
            >
              <Save size={16} /> {saving ? 'Saxlanılır...' : 'Parametrləri Saxla'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
