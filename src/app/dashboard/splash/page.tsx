'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Video, Code2, Play, Eye, Save,
  Check, Loader2, RefreshCw, X, AlertCircle
} from 'lucide-react';
import SplashScreen, { SplashConfig } from '@/components/themes/SplashScreen';

function useCurrentOrg() {
  const [data, setData] = useState<{ orgId: string | null; slug: string }>({ orgId: null, slug: '' });

  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    const fetchOrg = (id: string) => {
      fetch(`/api/organizations/${id}`)
        .then((r) => r.json())
        .then((d) => {
          setData({ orgId: id, slug: d.organization?.slug || '' });
        });
    };

    if (saved) {
      fetchOrg(saved);
      return;
    }

    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.[0]) {
          localStorage.setItem('currentOrgId', d.organizations[0].id);
          fetchOrg(d.organizations[0].id);
        }
      });
  }, []);

  return data;
}

const CODE_TEMPLATES = [
  {
    name: 'Qızılı Lüks Açılış',
    html: `<div class="splash-box">
  <div class="logo-ring">🍽️</div>
  <h1 class="splash-title">Xoş Gəlmisiniz</h1>
  <p class="splash-sub">Ləziz təamlar və unudulmaz anlar sizi gözləyir</p>
  <div class="splash-loader"></div>
</div>`,
    css: `.splash-box {
  text-align: center;
  animation: fadeIn 1s ease-out;
}
.logo-ring {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 2s infinite ease-in-out;
}
.splash-title {
  font-size: 38px;
  font-weight: 800;
  color: #D4A574;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
}
.splash-sub {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0 0 30px 0;
}
.splash-loader {
  width: 140px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}
.splash-loader::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: #D4A574;
  animation: slide 1.5s infinite ease-in-out;
}
@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}`,
    js: `console.log("Qızılı Lüks Açılış hazır!");`,
  },
  {
    name: 'Minimalist Neon Animasiya',
    html: `<div class="neon-wrap">
  <div class="neon-glow"></div>
  <h1 class="neon-text">RESTORAN</h1>
  <p class="neon-desc">Canlı Menyu & WhatsApp Sifarişi</p>
</div>`,
    css: `.neon-wrap {
  text-align: center;
  position: relative;
}
.neon-glow {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(124, 92, 252, 0.4) 0%, transparent 70%);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(20px);
}
.neon-text {
  font-size: 44px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 6px;
  margin: 0;
  text-shadow: 0 0 20px rgba(124, 92, 252, 0.8);
}
.neon-desc {
  color: #8888A0;
  margin-top: 12px;
  font-size: 15px;
}`,
    js: ``,
  },
];

export default function SplashPage() {
  const { orgId, slug } = useCurrentOrg();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<SplashConfig>({
    type: 'video',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-dish-in-the-kitchen-42777-large.mp4',
    videoMuted: true,
    videoLoop: false,
    html: '',
    css: '',
    js: '',
    duration: 5,
    showSkipButton: true,
    skipButtonText: 'Keç',
    backgroundColor: '#0A0A0F',
    alwaysShow: false,
  });

  useEffect(() => {
    if (!orgId) return;

    fetch(`/api/organizations/${orgId}/splash`)
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.splashEnabled || false);
        if (d.splashConfig && Object.keys(d.splashConfig).length > 0) {
          setConfig((prev) => ({ ...prev, ...d.splashConfig }));
        }
      })
      .finally(() => setLoading(false));
  }, [orgId]);

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/organizations/${orgId}/splash`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splashEnabled: enabled,
          splashConfig: config,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (tpl: typeof CODE_TEMPLATES[0]) => {
    setConfig((prev) => ({
      ...prev,
      type: 'code',
      html: tpl.html,
      css: tpl.css,
      js: tpl.js,
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#7C5CFC' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={26} color="#7C5CFC" /> Splash Screen Ayarları
          </h1>
          <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>
            Sayt açılarkən qonaqları qarşılayan video və ya animasiya ekranı
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowPreview(true)}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
          >
            <Eye size={16} /> Önbaxış
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="dash-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
          >
            {saving ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saved ? 'Yadda saxlanıldı!' : 'Yadda saxla'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {/* Toggle Card */}
        <div className="dash-card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0' }}>Splash Screen Aktivdir</p>
            <p style={{ fontSize: 13, color: '#8888A0', marginTop: 4 }}>
              Aktiv olduqda sayt açılan kimi ilk öncə bu ekran göstəriləcək
            </p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: enabled ? '#7C5CFC' : '#2A2A3A',
                borderRadius: 28,
                transition: '0.3s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: 20,
                  width: 20,
                  left: enabled ? 28 : 4,
                  bottom: 4,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: '0.3s',
                }}
              />
            </span>
          </label>
        </div>

        {/* Mode Selector */}
        <div className="dash-card" style={{ padding: 24 }}>
          <label className="dash-label" style={{ marginBottom: 12 }}>Splash Növü</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <button
              type="button"
              onClick={() => setConfig((p) => ({ ...p, type: 'video' }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${config.type === 'video' ? '#7C5CFC' : '#2A2A3A'}`,
                background: config.type === 'video' ? 'rgba(124,92,252,0.1)' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={20} color="#7C5CFC" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>Video Linki</p>
                <p style={{ fontSize: 12, color: '#8888A0', marginTop: 2 }}>MP4, WebM və ya YouTube / Vimeo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setConfig((p) => ({ ...p, type: 'code' }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${config.type === 'code' ? '#7C5CFC' : '#2A2A3A'}`,
                background: config.type === 'code' ? 'rgba(124,92,252,0.1)' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={20} color="#22D3EE" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>HTML / CSS / JS Kodu</p>
                <p style={{ fontSize: 12, color: '#8888A0', marginTop: 2 }}>Fərdi animasiyalar və kodlar</p>
              </div>
            </button>
          </div>
        </div>

        {/* Mode Specific Inputs */}
        {config.type === 'video' ? (
          <div className="dash-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>
              Video Parametrləri
            </h3>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="dash-label">Video URL (Birbaşa MP4 və ya YouTube linki)</label>
                <input
                  className="dash-input"
                  value={config.videoUrl || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="https://example.com/video.mp4 və ya https://youtu.be/..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#E8E8F0', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={config.videoMuted ?? true}
                    onChange={(e) => setConfig((p) => ({ ...p, videoMuted: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#7C5CFC' }}
                  />
                  Səssiz başlasın (Muted - Avtomatik oxuma üçün məsləhətdir)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#E8E8F0', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={config.videoLoop ?? false}
                    onChange={(e) => setConfig((p) => ({ ...p, videoLoop: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#7C5CFC' }}
                  />
                  Davamlı təkrarla (Loop)
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="dash-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0' }}>
                Fərdi Kod Redaktoru (HTML, CSS, JS)
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {CODE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    style={{
                      background: 'rgba(124,92,252,0.15)',
                      border: '1px solid rgba(124,92,252,0.3)',
                      color: '#9B7FFF',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    + {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="dash-label">HTML Strukturu</label>
                <textarea
                  className="dash-input"
                  rows={5}
                  value={config.html || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, html: e.target.value }))}
                  placeholder="<div class='splash'><h1>Xoş gəlmisiniz</h1></div>"
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>

              <div>
                <label className="dash-label">CSS Stilləri</label>
                <textarea
                  className="dash-input"
                  rows={6}
                  value={config.css || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, css: e.target.value }))}
                  placeholder=".splash { color: #fff; text-align: center; }"
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>

              <div>
                <label className="dash-label">JavaScript (İstəyə bağlı)</label>
                <textarea
                  className="dash-input"
                  rows={4}
                  value={config.js || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, js: e.target.value }))}
                  placeholder="console.log('Splash active');"
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* General Display Settings */}
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>
            Ekran & Keçid Parametrləri
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label className="dash-label">Avtomatik bağlanma müddəti (saniyə)</label>
              <input
                type="number"
                min="0"
                max="60"
                className="dash-input"
                value={config.duration ?? 5}
                onChange={(e) => setConfig((p) => ({ ...p, duration: Number(e.target.value) }))}
              />
              <span style={{ fontSize: 11, color: '#8888A0', marginTop: 4, display: 'block' }}>
                0 = Yalnız istifadəçi &quot;Keç&quot; basdıqda bağlansın
              </span>
            </div>

            <div>
              <label className="dash-label">&quot;Keç&quot; Düyməsinin Mətni</label>
              <input
                className="dash-input"
                value={config.skipButtonText || 'Keç'}
                onChange={(e) => setConfig((p) => ({ ...p, skipButtonText: e.target.value }))}
              />
            </div>

            <div>
              <label className="dash-label">Arxa Fon Rəngi</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.backgroundColor || '#0A0A0F'}
                  onChange={(e) => setConfig((p) => ({ ...p, backgroundColor: e.target.value }))}
                  style={{ width: 44, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                />
                <input
                  className="dash-input"
                  value={config.backgroundColor || '#0A0A0F'}
                  onChange={(e) => setConfig((p) => ({ ...p, backgroundColor: e.target.value }))}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #2A2A3A', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#E8E8F0', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={config.showSkipButton ?? true}
                onChange={(e) => setConfig((p) => ({ ...p, showSkipButton: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#7C5CFC' }}
              />
              &quot;Keç&quot; (Skip) düyməsini göstər
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#E8E8F0', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={config.alwaysShow ?? false}
                onChange={(e) => setConfig((p) => ({ ...p, alwaysShow: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#7C5CFC' }}
              />
              Hər ziyarətdə göstər (Deaktiv olduqda eyni sessiyada yalnız 1 dəfə çıxır)
            </label>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 56,
              background: '#1A1A24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              borderBottom: '1px solid #2A2A3A',
              color: '#fff',
              zIndex: 1000000,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Eye size={18} color="#7C5CFC" />
              <span style={{ fontWeight: 600 }}>Splash Screen Canlı Önbaxış</span>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
              }}
            >
              <X size={16} /> Önbaxışı bağla
            </button>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <SplashScreen
              config={{
                ...config,
                alwaysShow: true,
              }}
              siteSlug={slug || 'preview'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
