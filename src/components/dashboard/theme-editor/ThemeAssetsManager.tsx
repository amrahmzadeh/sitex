'use client';

import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface ThemeAssetsManagerProps {
  theme: ThemeConfig;
  orgId: string | null;
  onChange: (updated: ThemeConfig) => void;
}

interface AssetSlot {
  key: keyof ThemeConfig;
  title: string;
  description: string;
  url?: string;
  recommendedSize: string;
}

export default function ThemeAssetsManager({
  theme,
  orgId,
  onChange,
}: ThemeAssetsManagerProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotKey, setActiveSlotKey] = useState<keyof ThemeConfig | null>(null);

  const assetSlots: AssetSlot[] = [
    {
      key: 'headerImageUrl',
      title: 'Başlıq Şəkli (Header Cover)',
      description: 'Saytın əsas banner və qəhrəman (Hero) hissəsində göstərilən fon şəkli.',
      url: theme.headerImageUrl,
      recommendedSize: '1920 × 1080 px (16:9)',
    },
    {
      key: 'backgroundImageUrl',
      title: 'Ümumi Səhifə Arxa Fonu',
      description: 'Saytın bütün səhifələrində zərif şəkildə görünən qlobal fon şəkli.',
      url: theme.backgroundImageUrl,
      recommendedSize: '1920 × 1080 px (Dövri və ya tək)',
    },
    {
      key: 'heroDishImage',
      title: 'Xüsusi Təklif / İmzalı Yemək Şəkli',
      description: 'Hero hissəsində fərqləndirilən yemək və ya xidmət vizualı.',
      url: theme.heroDishImage,
      recommendedSize: '800 × 800 px (Şəffaf PNG tövsiyə olunur)',
    },
    {
      key: 'aboutImageUrl',
      title: 'Haqqımızda Bölməsinin Şəkli',
      description: 'Restoranın, komandanın və ya məkanın interyerini əks etdirən foto.',
      url: theme.aboutImageUrl,
      recommendedSize: '1200 × 800 px (4:3)',
    },
  ];

  const handleTriggerUpload = (slotKey: keyof ThemeConfig) => {
    setActiveSlotKey(slotKey);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlotKey || !orgId) return;

    setUploadingKey(activeSlotKey as string);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/organizations/${orgId}/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        onChange({
          ...theme,
          [activeSlotKey]: data.url,
        });
      }
    } catch (err) {
      console.error('Şəkil yüklənərkən xəta:', err);
    } finally {
      setUploadingKey(null);
      setActiveSlotKey(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRemove = (slotKey: keyof ThemeConfig) => {
    onChange({
      ...theme,
      [slotKey]: '',
    });
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ImageIcon size={20} color="#00D37D" />
          Tema Aktivləri & Şəkillər
        </h2>
        <p style={{ fontSize: 13, color: '#8888A0', margin: '4px 0 0' }}>
          Temanızın tərtibatında istifadə olunan qrafik aktivləri yükləyin, əvəzləyin və idarə edin.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {assetSlots.map((slot) => {
          const isUploading = uploadingKey === slot.key;
          const isCopied = copiedKey === slot.key;

          return (
            <div
              key={slot.key}
              style={{
                background: '#1C1F2E',
                borderRadius: 10,
                border: '1px solid #2B2F44',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Asset Header */}
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F2F8', display: 'block' }}>
                  {slot.title}
                </span>
                <span style={{ fontSize: 12, color: '#8888A0', marginTop: 2, display: 'block' }}>
                  {slot.description}
                </span>
                <span style={{ fontSize: 11, color: '#00D37D', marginTop: 4, display: 'block', fontFamily: 'monospace' }}>
                  Ölçü: {slot.recommendedSize}
                </span>
              </div>

              {/* Thumbnail / Dropzone */}
              <div
                style={{
                  height: 150,
                  borderRadius: 8,
                  background: slot.url ? `url("${slot.url}") center/cover no-repeat` : '#131520',
                  border: '1.5px dashed #33374D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {!slot.url && (
                  <div style={{ textAlign: 'center', color: '#686B80' }}>
                    <ImageIcon size={32} style={{ margin: '0 auto 6px' }} />
                    <span style={{ fontSize: 12 }}>Şəkil təyin edilməyib</span>
                  </div>
                )}

                {isUploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      color: '#00D37D',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Yüklənir...
                  </div>
                )}
              </div>

              {/* Input for direct URL */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Şəkil URL linki daxil edin..."
                  value={slot.url || ''}
                  onChange={(e) => onChange({ ...theme, [slot.key]: e.target.value })}
                  style={{
                    flex: 1,
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 6,
                    padding: '6px 10px',
                    color: '#F0F2F8',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                {slot.url && (
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(slot.url!, slot.key as string)}
                    title="URL-i kopyala"
                    style={{
                      padding: '6px 8px',
                      background: '#232738',
                      border: '1px solid #33374D',
                      borderRadius: 6,
                      color: '#8888A0',
                      cursor: 'pointer',
                    }}
                  >
                    {isCopied ? <Check size={13} color="#00D37D" /> : <Copy size={13} />}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleTriggerUpload(slot.key)}
                  disabled={isUploading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#00D37D',
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={13} />
                  Kompüterdən Yüklə
                </button>

                {slot.url && (
                  <button
                    type="button"
                    onClick={() => handleRemove(slot.key)}
                    title="Şəkli sil"
                    style={{
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: '1px solid #EF4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

