'use client';

import React, { useState } from 'react';
import {
  Image,
  Upload,
  Link2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

interface AssetsManagerProps {
  orgId?: string | null;
  onSelectAsset?: (url: string) => void;
}

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  altText?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];
const MAX_ASSET_SIZE = 5 * 1024 * 1024; // 5MB

const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    name: 'Hero Restoran İnteryeri',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    size: '1.2 MB',
    altText: 'İşıqlı və rahat restoran zalı interyeri',
  },
  {
    id: 'asset-2',
    name: 'Zərif Masalar və İşıqlar',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    size: '850 KB',
    altText: 'Romantik axşam yeməyi üçün hazırlanmış masalar',
  },
  {
    id: 'asset-3',
    name: 'Şef Yemək Təqdimatı',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    size: '920 KB',
    altText: 'Baş aşpazın xüsusi təqdimat yeməyi',
  },
  {
    id: 'asset-4',
    name: 'Qril və Ət Yeməkləri',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    size: '1.1 MB',
    altText: 'Közdə bişirilmiş təzə ət təamları',
  },
];

export function AssetsManager({ orgId, onSelectAsset }: AssetsManagerProps) {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newAlt, setNewAlt] = useState('');

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) return;
    const added: Asset = {
      id: 'asset-' + Date.now(),
      name: newName.trim() || 'Yeni Şəkil',
      url: newUrl.trim(),
      type: 'image',
      size: 'Xarici Link',
      altText: newAlt.trim() || 'Veb sayt şəkli',
    };
    setAssets([added, ...assets]);
    setNewUrl('');
    setNewName('');
    setNewAlt('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMsg('Yalnız JPEG, PNG, WebP, SVG və GIF formatlarına icazə verilir.');
      return;
    }

    if (file.size > MAX_ASSET_SIZE) {
      setErrorMsg('Şəkil ölçüsü 5MB-dan artıq ola bilməz.');
      return;
    }

    if (!orgId) {
      const url = URL.createObjectURL(file);
      setAssets([
        {
          id: 'asset-' + Date.now(),
          name: file.name,
          url,
          type: 'image',
          size: `${(file.size / 1024).toFixed(0)} KB (WebP Tövsiyə olunur)`,
          altText: file.name,
        },
        ...assets,
      ]);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/organizations/${orgId}/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setAssets([
          {
            id: 'asset-' + Date.now(),
            name: file.name,
            url: data.url,
            type: 'image',
            size: `${(file.size / 1024).toFixed(0)} KB`,
            altText: file.name,
          },
          ...assets,
        ]);
      }
    } catch (err: any) {
      setErrorMsg(`Yükləmə xətası: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
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
              <Image size={24} color="#00D37D" />
              Tema Aktivləri & Media İdarəedicisi
            </h1>
            <p style={{ fontSize: 14, color: '#8888A0', marginTop: 6 }}>
              Temanızda istifadə olunan bannerlər, loqolar və şəkilləri idarə edin (Maks: 5MB, WebP tövsiyə edilir).
            </p>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              background: '#00D37D',
              color: '#000',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {uploading ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Upload size={16} />
            )}
            <span>Kompüterdən Yüklə</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Link Input Section */}
        <div
          style={{
            padding: 16,
            background: '#14161C',
            borderRadius: 12,
            border: '1px solid #252932',
            marginBottom: 28,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Aktivin adı (məs: Əsas Loqo)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              background: '#0D0E11',
              border: '1px solid #282C35',
              color: '#FFF',
              fontSize: 13,
              width: 180,
            }}
          />
          <input
            type="text"
            placeholder="Alt Mətn (A11y üçün)"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              background: '#0D0E11',
              border: '1px solid #282C35',
              color: '#FFF',
              fontSize: 13,
              width: 180,
            }}
          />
          <input
            type="text"
            placeholder="Şəkil URL keçidi daxil edin..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              padding: '9px 14px',
              borderRadius: 8,
              background: '#0D0E11',
              border: '1px solid #282C35',
              color: '#FFF',
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!newUrl.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 8,
              background: newUrl.trim() ? '#252932' : '#1A1C22',
              color: newUrl.trim() ? '#FFF' : '#666',
              border: '1px solid #333844',
              fontSize: 13,
              fontWeight: 600,
              cursor: newUrl.trim() ? 'pointer' : 'default',
            }}
          >
            <Plus size={15} />
            URL Əlavə Et
          </button>
        </div>

        {/* Assets Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {assets.map((asset) => (
            <div
              key={asset.id}
              style={{
                background: '#14161C',
                borderRadius: 12,
                border: '1px solid #252932',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Image Preview Box */}
              <div
                style={{
                  height: 160,
                  background: '#0B0C0E',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={asset.url}
                  alt={asset.altText || asset.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Info & Actions */}
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#FFF',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {asset.name}
                </span>

                {asset.altText && (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#00D37D',
                      marginBottom: 8,
                      display: 'block',
                      fontStyle: 'italic',
                    }}
                  >
                    Alt: {asset.altText}
                  </span>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: 8,
                    borderTop: '1px solid #20232A',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#8888A0' }}>{asset.size}</span>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(asset.id, asset.url)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #282C35',
                        background: '#1A1D24',
                        color: copiedId === asset.id ? '#00D37D' : '#8888A0',
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      title="URL Kopyala"
                    >
                      {copiedId === asset.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId === asset.id ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: '1px solid #331A1A',
                        background: 'rgba(239,68,68,0.08)',
                        color: '#F87171',
                        cursor: 'pointer',
                      }}
                      title="Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
