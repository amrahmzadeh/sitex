'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Check, Loader2, ExternalLink, Eye, EyeOff, Sparkles, Image as ImageIcon } from 'lucide-react';
import { PLATFORM_INFO } from '@/components/themes/SocialIcons';

function useCurrentOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    if (saved) { setOrgId(saved); return; }
    fetch('/api/organizations').then(r => r.json()).then(d => {
      if (d.organizations?.[0]) {
        setOrgId(d.organizations[0].id);
        localStorage.setItem('currentOrgId', d.organizations[0].id);
      }
    });
  }, []);
  return orgId;
}

const PLATFORMS_LIST = Object.entries(PLATFORM_INFO).map(([value, info]) => ({
  value,
  label: info.name,
  color: info.brandColor,
  bg: info.defaultBg,
  svg: info.svg,
}));

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialFeedPostItem {
  id: string;
  platform: string;
  postUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  authorName?: string | null;
  authorHandle?: string | null;
  likes: number;
  comments: number;
  isVideo: boolean;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

export default function SocialPage() {
  const orgId = useCurrentOrg();
  const [activeTab, setActiveTab] = useState<'links' | 'feed'>('links');
  
  // Links state
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [savingLinks, setSavingLinks] = useState(false);
  const [savedLinks, setSavedLinks] = useState(false);

  // Feed posts state
  const [feedPosts, setFeedPosts] = useState<SocialFeedPostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [addingPost, setAddingPost] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load links
  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/organizations/${orgId}/social`)
      .then(r => r.json())
      .then(d => setLinks(d.links || []))
      .finally(() => setLoadingLinks(false));
  }, [orgId]);

  // Load feed posts
  const loadPosts = () => {
    if (!orgId) return;
    setLoadingPosts(true);
    fetch(`/api/organizations/${orgId}/social-feed`)
      .then(r => r.json())
      .then(d => setFeedPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => {
    loadPosts();
  }, [orgId]);

  // Save links
  const saveLinks = async () => {
    if (!orgId) return;
    setSavingLinks(true);
    try {
      await fetch(`/api/organizations/${orgId}/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });
      setSavedLinks(true);
      setTimeout(() => setSavedLinks(false), 3000);
    } finally {
      setSavingLinks(false);
    }
  };

  const addLink = (platform: string) => {
    if (links.find(l => l.platform === platform)) return;
    setLinks(prev => [...prev, { platform, url: '' }]);
  };

  const removeLink = (platform: string) => {
    setLinks(prev => prev.filter(l => l.platform !== platform));
  };

  const updateUrl = (platform: string, url: string) => {
    setLinks(prev => prev.map(l => l.platform === platform ? { ...l, url } : l));
  };

  // Add a feed post
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !postUrl.trim()) return;
    setErrorMsg('');
    setAddingPost(true);

    try {
      const res = await fetch(`/api/organizations/${orgId}/social-feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postUrl: postUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          caption: caption.trim() || undefined,
          authorHandle: authorHandle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Xəta baş verdi');
        return;
      }

      setPostUrl('');
      setThumbnailUrl('');
      setCaption('');
      setAuthorHandle('');
      loadPosts();
    } catch {
      setErrorMsg('Əlaqə xətası baş verdi');
    } finally {
      setAddingPost(false);
    }
  };

  // Delete feed post
  const handleDeletePost = async (postId: string) => {
    if (!orgId) return;
    try {
      await fetch(`/api/organizations/${orgId}/social-feed/${postId}`, {
        method: 'DELETE',
      });
      setFeedPosts(prev => prev.filter(p => p.id !== postId));
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle visibility
  const handleToggleVisible = async (postId: string, currentVisible: boolean) => {
    if (!orgId) return;
    try {
      await fetch(`/api/organizations/${orgId}/social-feed/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisible }),
      });
      setFeedPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, isVisible: !currentVisible } : p))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (loadingLinks && loadingPosts) {
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 680 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>
          Sosial Media İdarəetməsi
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14 }}>
          Sosial media hesablarınızı və ana səhifədə canlı göstəriləcək post/reel paylaşımlarınızı idarə edin.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          background: '#12121A',
          padding: 6,
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          style={{
            padding: '9px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'links' ? '#7C5CFC' : 'transparent',
            color: activeTab === 'links' ? '#FFF' : '#A0A0B2',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Sosial Hesab Linkləri ({links.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '9px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'feed' ? '#7C5CFC' : 'transparent',
            color: activeTab === 'feed' ? '#FFF' : '#A0A0B2',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={14} />
          <span>Canlı Feed Postları ({feedPosts.length})</span>
        </button>
      </div>

      {/* Quick Link to Theme settings */}
      <div
        style={{
          marginBottom: 24,
          padding: '14px 18px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.12), rgba(30, 25, 45, 0.5))',
          border: '1px solid rgba(124, 92, 252, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#A78BFA', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span>✨</span>
            <span>Feed Modulunun Dizayn Tənzimləmələri</span>
          </div>
          <div style={{ fontSize: 12, color: '#C4C4D4', lineHeight: 1.4 }}>
            Feed-in görünüşünü (qrid/karusel, sütun sayı, rənglər, kart stilləri) <strong>Dizayn</strong> bölməsindən fərdiləşdirə bilərsiniz.
          </div>
        </div>
        <a
          href="/dashboard/theme"
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            background: '#7C5CFC',
            color: '#FFF',
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Dizaynı Dəyiş →
        </a>
      </div>

      {/* TAB 1: SOCIAL LINKS */}
      {activeTab === 'links' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {links.length > 0 && (
            <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#8888A0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Əlavə edilmiş hesablar ({links.length})
              </h2>
              {links.map((link, i) => {
                const p = PLATFORMS_LIST.find(x => x.value === link.platform.toLowerCase().trim());
                return (
                  <motion.div
                    key={link.platform}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      background: '#1A1A24',
                      border: `1px solid ${p?.color || '#7C5CFC'}35`,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: p?.bg || '#7C5CFC',
                        color: link.platform === 'snapchat' ? '#000' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: 9,
                        boxSizing: 'border-box',
                        boxShadow: `0 2px 8px ${p?.color || '#7C5CFC'}30`,
                      }}
                    >
                      {p?.svg}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', marginBottom: 4 }}>
                        {p?.label || link.platform}
                      </div>
                      <input
                        className="dash-input"
                        placeholder={`https://${link.platform}.com/...`}
                        value={link.url}
                        onChange={(e) => updateUrl(link.platform, e.target.value)}
                        style={{ margin: 0, fontSize: 13, padding: '7px 10px', width: '100%' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(link.platform)}
                      title="Sil"
                      style={{
                        border: 'none', background: 'rgba(248,113,113,0.12)',
                        color: '#F87171', borderRadius: 8, width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                        transition: 'background 0.15s',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Add Platforms */}
          <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>
              Hesab Növü Əlavə Et
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
              {PLATFORMS_LIST.map(p => {
                const isAdded = links.some(l => l.platform.toLowerCase() === p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => addLink(p.value)}
                    disabled={isAdded}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '12px 8px', borderRadius: 12,
                      border: `1px solid ${isAdded ? p.color + '60' : '#2A2A3A'}`,
                      background: isAdded ? p.color + '15' : '#14141E',
                      color: isAdded ? p.color : '#C4C4D4',
                      cursor: isAdded ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: isAdded ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: p.bg,
                        color: p.value === 'snapchat' ? '#000' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 7,
                        boxSizing: 'border-box',
                      }}
                    >
                      {p.svg}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{p.label}</span>
                    {isAdded && <span style={{ fontSize: 10, color: '#34D399', fontWeight: 700 }}>✓ Əlavə edilib</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={saveLinks}
            disabled={savingLinks}
            className="dash-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
          >
            {savingLinks ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : savedLinks ? <Check size={16} /> : <Save size={16} />}
            {savedLinks ? 'Saxlandı!' : savingLinks ? 'Saxlanılır...' : 'Yadda saxla'}
          </button>
        </motion.div>
      )}

      {/* TAB 2: LIVE FEED POSTS */}
      {activeTab === 'feed' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Add Post Form */}
          <div className="dash-card" style={{ padding: 22, marginBottom: 24, background: '#161622', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Plus size={18} color="#7C5CFC" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>
                Yeni Post Əlavə Et
              </h2>
            </div>
            <p style={{ fontSize: 13, color: '#8888A0', marginBottom: 16, lineHeight: 1.5 }}>
              Instagram, TikTok, YouTube və ya Facebook paylaşımlarınızın linkini daxil edin. Real post ana səhifədə nümayiş olunacaq.
            </p>

            <form onSubmit={handleAddPost}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#C4C4D4', marginBottom: 6 }}>
                    Post və ya Reel Linki (URL) *
                  </label>
                  <input
                    className="dash-input"
                    required
                    placeholder="Məs: https://www.instagram.com/p/DFxyz... və ya /reel/..."
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    style={{ margin: 0, width: '100%', fontSize: 13 }}
                  />
                  <div style={{ fontSize: 11, color: '#7E7E94', marginTop: 4 }}>
                    Instagram paylaşımları üçün URL-də shortcode (/p/ və ya /reel/) olduqda klikləndikdə orijinal post birbaşa açılır.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#C4C4D4', marginBottom: 6 }}>
                      Şəkil / Thumbnail Linki (İstəyə bağlı)
                    </label>
                    <input
                      className="dash-input"
                      placeholder="https://... şəkil linki"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      style={{ margin: 0, width: '100%', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#C4C4D4', marginBottom: 6 }}>
                      Müəllif / Hesab Adı (İstəyə bağlı)
                    </label>
                    <input
                      className="dash-input"
                      placeholder="@hesab_adiniz"
                      value={authorHandle}
                      onChange={(e) => setAuthorHandle(e.target.value)}
                      style={{ margin: 0, width: '100%', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#C4C4D4', marginBottom: 6 }}>
                    Açıqlama / Caption (İstəyə bağlı)
                  </label>
                  <textarea
                    className="dash-input"
                    rows={2}
                    placeholder="Post haqqında qısa mətn..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    style={{ margin: 0, width: '100%', fontSize: 13, resize: 'vertical' }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: 12 }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addingPost || !postUrl.trim()}
                  className="dash-btn-primary"
                  style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '10px 20px' }}
                >
                  {addingPost ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
                  <span>{addingPost ? 'Əlavə edilir...' : 'Postu Əlavə Et'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Added Feed Posts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#8888A0', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Əlavə edilmiş postlar ({feedPosts.length})
              </h2>
            </div>

            {feedPosts.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  background: '#14141E',
                  borderRadius: 14,
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  color: '#7E7E94',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#C4C4D4', marginBottom: 4 }}>
                  Hələ heç bir post əlavə edilməyib
                </div>
                <div style={{ fontSize: 12 }}>
                  Yuxarıdakı form vasitəsilə Instagram və ya digər sosial media paylaşımlarınızın linkini əlavə edin.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {feedPosts.map((post) => {
                  const p = PLATFORMS_LIST.find(x => x.value === post.platform.toLowerCase().trim());
                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        background: '#1A1A24',
                        border: `1px solid ${post.isVisible ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
                        opacity: post.isVisible ? 1 : 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {/* Thumbnail or Platform Icon */}
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 10,
                          overflow: 'hidden',
                          backgroundColor: '#0E0E14',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {post.thumbnailUrl ? (
                          <img
                            src={post.thumbnailUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: p?.bg || '#7C5CFC',
                              color: post.platform === 'snapchat' ? '#000' : '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 7,
                            }}
                          >
                            {p?.svg}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: p?.color ? `${p.color}25` : '#7C5CFC25',
                              color: p?.color || '#A78BFA',
                              textTransform: 'uppercase',
                            }}
                          >
                            {p?.label || post.platform}
                          </span>
                          {post.isVideo && (
                            <span style={{ fontSize: 10, color: '#38BDF8', fontWeight: 600 }}>
                              📹 Video/Reel
                            </span>
                          )}
                          {!post.isVisible && (
                            <span style={{ fontSize: 10, color: '#F87171', fontWeight: 600 }}>
                              (Gizli)
                            </span>
                          )}
                        </div>

                        {post.caption && (
                          <div
                            style={{
                              fontSize: 13,
                              color: '#E8E8F0',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginBottom: 3,
                            }}
                          >
                            {post.caption}
                          </div>
                        )}

                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 12,
                            color: '#7C5CFC',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.postUrl}</span>
                          <ExternalLink size={11} style={{ flexShrink: 0 }} />
                        </a>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleVisible(post.id, post.isVisible)}
                          title={post.isVisible ? 'Gizlət' : 'Göstər'}
                          style={{
                            border: 'none',
                            background: post.isVisible ? 'rgba(52, 211, 153, 0.12)' : 'rgba(156, 163, 175, 0.12)',
                            color: post.isVisible ? '#34D399' : '#9CA3AF',
                            borderRadius: 8,
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {post.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          title="Sil"
                          style={{
                            border: 'none',
                            background: 'rgba(248,113,113,0.12)',
                            color: '#F87171',
                            borderRadius: 8,
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
