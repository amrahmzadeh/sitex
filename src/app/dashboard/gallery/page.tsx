'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink,
  Upload, Link2, Check, AlertCircle, Eye, EyeOff, Loader2, RefreshCw
} from 'lucide-react';

interface GalleryItem {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
  sortOrder: number;
  isVisible: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function GalleryPage() {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New item form state
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load organization
  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.length) {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null;
          const found = d.organizations.find((o: Organization) => o.id === saved);
          setCurrentOrg(found || d.organizations[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch gallery items
  const loadGallery = async (orgId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/organizations/${orgId}/gallery`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch {
      setMessage({ type: 'error', text: 'Qalareya yüklənərkən xəta baş verdi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrg?.id) {
      loadGallery(currentOrg.id);
    }
  }, [currentOrg?.id]);

  // Handle Add Item (from URL)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !newUrl.trim()) return;

    try {
      setAdding(true);
      setMessage(null);
      const res = await fetch(`/api/organizations/${currentOrg.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl.trim(),
          title: newTitle.trim() || undefined,
          description: newDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Əlavə etmək mümkün olmadı');

      setItems((prev) => [...prev, data.item]);
      setNewUrl('');
      setNewTitle('');
      setNewDesc('');
      setMessage({ type: 'success', text: 'Şəkil uğurla əlavə edildi!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xəta baş verdi' });
    } finally {
      setAdding(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentOrg?.id) return;

    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`/api/organizations/${currentOrg.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Şəkil yüklənə bilmədi');

      // Now add to gallery automatically
      const galleryRes = await fetch(`/api/organizations/${currentOrg.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadData.url,
          title: file.name.replace(/\.[^/.]+$/, ''),
        }),
      });

      const galleryData = await galleryRes.json();
      if (!galleryRes.ok) throw new Error(galleryData.error || 'Qalareyaya əlavə edilmədi');

      setItems((prev) => [...prev, galleryData.item]);
      setMessage({ type: 'success', text: 'Şəkil yükləndi və qalareyaya əlavə edildi!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Yükləmə xətası' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!currentOrg?.id) return;
    if (!confirm('Bu şəkli silmək istədiyinizdən əminsiniz?')) return;

    try {
      const res = await fetch(`/api/organizations/${currentOrg.id}/gallery?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Silmək mümkün olmadı');

      setItems((prev) => prev.filter((it) => it.id !== id));
      setMessage({ type: 'success', text: 'Şəkil silindi' });
    } catch {
      setMessage({ type: 'error', text: 'Şəkil silinərkən xəta baş verdi' });
    }
  };

  // Handle Toggle Visibility
  const handleToggleVisibility = async (item: GalleryItem) => {
    if (!currentOrg?.id) return;

    try {
      const updated = !item.isVisible;
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, isVisible: updated } : it)));

      await fetch(`/api/organizations/${currentOrg.id}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          isVisible: updated,
        }),
      });
    } catch {
      setMessage({ type: 'error', text: 'Statusu dəyişmək olmadı' });
    }
  };

  // Handle Move Item (Order)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!currentOrg?.id) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate sortOrder
    const reordered = newItems.map((item, idx) => ({ ...item, sortOrder: idx }));
    setItems(reordered);

    try {
      setSaving(true);
      await fetch(`/api/organizations/${currentOrg.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reordered }),
      });
    } catch {
      setMessage({ type: 'error', text: 'Sıralama yadda saxlanılmadı' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,211,125,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Images size={20} color="#00D37D" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>Qalareya</h1>
          </div>
          <p style={{ fontSize: 14, color: '#B0B0B8', margin: 0 }}>
            Saytınızın Qalareya bölməsində nümayiş olunacaq şəkil linklərini və fotolarını idarə edin.
          </p>
        </div>

        {currentOrg?.slug && (
          <a
            href={`/site/${currentOrg.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              color: '#F5F5F7',
              border: '1px solid #383334',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00D37D')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#383334')}
          >
            <ExternalLink size={15} color="#00D37D" />
            Saytda bax
          </a>
        )}
      </div>

      {/* Alert Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 20,
              background: message.type === 'success' ? 'rgba(0,211,125,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${message.type === 'success' ? 'rgba(0,211,125,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: message.type === 'success' ? '#00D37D' : '#EF4444',
              fontSize: 14,
            }}
          >
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Image Card */}
      <div
        style={{
          background: '#1A1B1E',
          borderRadius: 16,
          border: '1px solid #383334',
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} color="#00D37D" /> Yeni Şəkil Əlavə Et
        </h2>

        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Image URL Input */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#B0B0B8', marginBottom: 6 }}>
                Şəkil Linki (URL) *
              </label>
              <div style={{ position: 'relative' }}>
                <Link2 size={16} color="#B0B0B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: 10,
                    background: '#121315',
                    border: '1px solid #383334',
                    color: '#F5F5F7',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#B0B0B8', marginBottom: 6 }}>
                Başlıq / Təsvir (İxtiyari)
              </label>
              <input
                type="text"
                placeholder="Məsələn: Əsas Zal, Tədbirimiz, Xüsusi menyu"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#121315',
                  border: '1px solid #383334',
                  color: '#F5F5F7',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 8 }}>
            {/* Upload directly */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #383334',
                  color: '#B0B0B8',
                  fontSize: 13,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? 'Yüklənir...' : 'Cihazdan şəkil yüklə'}
              </button>
              <span style={{ fontSize: 12, color: '#888' }}>və ya birbaşa şəkil URL-i yapışdırın</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={adding || !newUrl.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 10,
                background: adding || !newUrl.trim() ? 'rgba(0,211,125,0.4)' : '#00D37D',
                color: '#0A0A0C',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: adding || !newUrl.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Qalareyaya Əlavə Et
            </button>
          </div>
        </form>
      </div>

      {/* Gallery List */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
          Şəkillər ({items.length})
        </h2>
        {saving && (
          <span style={{ fontSize: 12, color: '#00D37D', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Loader2 size={13} className="animate-spin" /> Sıralama saxlanılır...
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#B0B0B8' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#00D37D' }} />
          <p style={{ margin: 0, fontSize: 14 }}>Şəkillər yüklənir...</p>
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#1A1B1E',
            borderRadius: 16,
            border: '1px dashed #383334',
            color: '#B0B0B8',
          }}
        >
          <Images size={44} color="#383334" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 6 }}>Hələ heç bir şəkil əlavə edilməyib</h3>
          <p style={{ fontSize: 13, maxWidth: 420, margin: '0 auto 16px' }}>
            Yuxarıdakı formadan şəkil linki yapışdıraraq və ya birbaşa şəkil yükləyərək saytınızın Qalareya bölməsinə fotolar əlavə edin.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              style={{
                background: '#1A1B1E',
                borderRadius: 14,
                border: '1px solid #383334',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s',
                opacity: item.isVisible ? 1 : 0.6,
              }}
            >
              {/* Thumbnail Container */}
              <div style={{ position: 'relative', width: '100%', height: 180, background: '#121315' }}>
                <img
                  src={item.url}
                  alt={item.title || 'Gallery'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80';
                  }}
                />
                {/* Badge for Order */}
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  #{index + 1}
                </span>

                {/* Eye button toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item)}
                  title={item.isVisible ? 'Gizlət' : 'Göstər'}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    color: item.isVisible ? '#00D37D' : '#888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {item.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* Info & Actions */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#F5F5F7', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title || 'Başlıqsız şəkil'}
                  </h4>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      color: '#00D37D',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <ExternalLink size={11} /> Linkə bax
                  </a>
                </div>

                {/* Control buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #2A2B2E', marginTop: 'auto' }}>
                  {/* Order controls */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      title="Əvvələ çək"
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #383334',
                        color: index === 0 ? '#444' : '#F5F5F7',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      title="Sonraya çək"
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #383334',
                        color: index === items.length - 1 ? '#444' : '#F5F5F7',
                        cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    title="Sil"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={13} /> Sil
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

