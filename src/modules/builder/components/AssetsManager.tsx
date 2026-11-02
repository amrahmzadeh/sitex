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
} from 'lucide-react';

interface AssetsManagerProps {
  orgId?: string | null;
  onSelectAsset?: (url: string) => void;
}

const DEFAULT_ASSETS = [
  {
    id: 'asset-1',
    name: 'Hero Restoran İnteryeri',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    size: '1.2 MB',
  },
  {
    id: 'asset-2',
    name: 'Zərif Masalar və İşıqlar',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    size: '850 KB',
  },
  {
    id: 'asset-3',
    name: 'Şef Yemək Təqdimatı',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    size: '920 KB',
  },
  {
    id: 'asset-4',
    name: 'Qril və Ət Yeməkləri',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    size: '1.1 MB',
  },
];

export function AssetsManager({ orgId, onSelectAsset }: AssetsManagerProps) {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) return;
    const added = {
      id: 'asset-' + Date.now(),
      name: newName.trim() || 'Yeni Şəkil',
      url: newUrl.trim(),
      type: 'image',
      size: 'Xarici Link',
    };
    setAssets([added, ...assets]);
    setNewUrl('');
    setNewName('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!orgId) {
      // Local preview if no orgId
      const url = URL.createObjectURL(file);
      setAssets([
        {
          id: 'asset-' + Date.now(),
          name: file.name,
          url,
          type: 'image',
          size: `${(file.size / 1024).toFixed(0)} KB`,
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
          },
          ...assets,
        ]);
      }
    } catch (err) {
      console.error('Şəkil yüklənərkən xəta:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ flex: 1, height: 'calc(100vh - 56px)', background: '#0D0E11', overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F5F5F7', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Image size={24} color="#00D37D" />
              Tema Aktivləri & Media İdarəedicisi
            </h1>
            <p style={{ fontSize: 14, color: '#8888A0', marginTop: 6 }}>
              Temanızda istifadə olunan bannerlər, loqolar, ikonlar və şəkilləri mərkəzi qaydada idarə edin.
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
            {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
            <span>Kompüterdən Yüklə</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

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
              width: 220,
            }}
          />
          <input
            type="text"
            placeholder="Şəkil URL keçidi daxil edin..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{
              flex: 1,
              minWidth: 260,
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
              padding: '9px 18px',
              borderRadius: 8,
              background: newUrl.trim() ? '#1E222A' : '#14161C',
              color: newUrl.trim() ? '#00D37D' : '#555',
              border: '1px solid #282C35',
              fontSize: 13,
              fontWeight: 600,
              cursor: newUrl.trim() ? 'pointer' : 'default',
            }}
          >
            Linklə Əlavə Et
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
              }}
            >
              <div
                style={{
                  height: 160,
                  background: `url(${asset.url}) center/cover no-repeat`,
                  position: 'relative',
                }}
              />
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#F0F0F3', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {asset.name}
                </h4>
                <span style={{ fontSize: 11, color: '#8888A0', marginBottom: 12 }}>{asset.size}</span>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.id, asset.url)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '7px 10px',
                      borderRadius: 6,
                      background: '#1E222A',
                      border: '1px solid #282C35',
                      color: copiedId === asset.id ? '#00D37D' : '#C0C0D0',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedId === asset.id ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedId === asset.id ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                  </button>

                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '7px 10px',
                      borderRadius: 6,
                      background: '#1E222A',
                      border: '1px solid #282C35',
                      color: '#8888A0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Şəkilə Tam Ölçüdə Bax"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
