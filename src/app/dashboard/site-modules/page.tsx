'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, UtensilsCrossed, Package, Images, MessageSquareText,
  Check, AlertCircle, Loader2, ExternalLink, ShieldCheck, Info
} from 'lucide-react';
import { useCurrentOrg } from '@/contexts/CurrentOrgContext';
interface ModuleSettings {
  menu: boolean;
  packages: boolean;
  gallery: boolean;
  contact: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function SiteModulesPage() {
  const { org: currentOrg } = useCurrentOrg();
  const [modules, setModules] = useState<ModuleSettings>({
    menu: true,
    packages: true,
    gallery: true,
    contact: true,
  });
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch module settings
  const loadModules = async (orgId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/organizations/${orgId}/modules`);
      const data = await res.json();
      if (data.modules) {
        setModules(data.modules);
      }
    } catch {
      setMessage({ type: 'error', text: 'Modul ayarları yüklənərkən xəta baş verdi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrg?.id) {
      loadModules(currentOrg.id);
    }
  }, [currentOrg?.id]);

  const handleToggle = async (key: keyof ModuleSettings) => {
    if (!currentOrg?.id || updatingKey) return;

    const newValue = !modules[key];
    const previous = modules[key];

    // Optimistic UI update
    setModules(prev => ({ ...prev, [key]: newValue }));
    setUpdatingKey(key);
    setMessage(null);

    try {
      const res = await fetch(`/api/organizations/${currentOrg.id}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ayarı yeniləmək mümkün olmadı');

      setModules(data.modules);
      setMessage({
        type: 'success',
        text: `Modul uğurla ${newValue ? 'aktivləşdirildi' : 'deaktiv edildi'}.`,
      });
    } catch (err: any) {
      // Revert on error
      setModules(prev => ({ ...prev, [key]: previous }));
      setMessage({ type: 'error', text: err.message || 'Xəta baş verdi' });
    } finally {
      setUpdatingKey(null);
    }
  };

  const moduleDefinitions: Array<{
    key: keyof ModuleSettings;
    title: string;
    description: string;
    icon: any;
    color: string;
    badge: string;
  }> = [
    {
      key: 'menu',
      title: 'Menyu Bölməsi',
      description: 'Saytdakı yemək kateqoriyaları, qiymətlər, tərkiblər və qida kartları bölməsi.',
      icon: UtensilsCrossed,
      color: '#7C5CFC',
      badge: 'Yemək & İaşə',
    },
    {
      key: 'packages',
      title: 'Xüsusi Təkliflər və Paketlər',
      description: 'Dashboard-da yaratdığınız biznes nahar, kombo paketlər və xüsusi təkliflər bölməsi.',
      icon: Package,
      color: '#F59E0B',
      badge: 'Kampaniyalar',
    },
    {
      key: 'gallery',
      title: 'Qalereya Bölməsi',
      description: 'Saytın foto qalereyası, zal və interyer şəkilləri, video və tədbir kadrları.',
      icon: Images,
      color: '#10B981',
      badge: 'Vizual',
    },
    {
      key: 'contact',
      title: 'Müraciət və Rezervasiya Formları',
      description: 'Masa rezervasiyası formu, əlaqə bölməsi və istifadəçi müraciətləri paneli.',
      icon: MessageSquareText,
      color: '#3B82F6',
      badge: 'Formlar & Əlaqə',
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124, 92, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} color="#9B7FFF" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>Sayt Modullarının İdarə Edilməsi</h1>
              <p style={{ color: '#8888A0', fontSize: 13, margin: '2px 0 0' }}>
                Saytınızda nümayiş olunan əsas bölmələrin görünürlüyünü fərdi şəkildə aktiv və ya deaktiv edin.
              </p>
            </div>
          </div>
        </div>

        {currentOrg?.slug && (
          <a
            href={`/site/${currentOrg.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            <ExternalLink size={15} />
            Saytda bax
          </a>
        )}
      </div>

      {/* Alert message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              background: message.type === 'success' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)',
              border: `1px solid ${message.type === 'success' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
              color: message.type === 'success' ? '#34D399' : '#F87171',
            }}
          >
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info card */}
      <div style={{ padding: '14px 18px', background: 'rgba(124, 92, 252, 0.08)', border: '1px solid rgba(124, 92, 252, 0.2)', borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Info size={20} color="#A78BFA" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: '#A78BFA', lineHeight: 1.5 }}>
          <strong>Məlumatların qorunması:</strong> Modulun deaktiv edilməsi onun məlumatlarını silmir. Məsələn, menyu və ya qalereyanı söndürdükdə daxil edilmiş şəkillər və yeməklər saxlanılır və modulu yenidən aktivləşdirdikdə dərhal bərpa olunur.
        </div>
      </div>

      {/* Module toggles grid */}
      {loading ? (
        <div style={{ display: 'grid', gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {moduleDefinitions.map((def) => {
            const Icon = def.icon;
            const isEnabled = modules[def.key];
            const isUpdating = updatingKey === def.key;

            return (
              <div
                key={def.key}
                className="dash-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 22px',
                  gap: 16,
                  border: isEnabled ? '1px solid rgba(255,255,255,0.08)' : '1px dashed rgba(255,255,255,0.05)',
                  background: isEnabled ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: isEnabled ? `${def.color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isEnabled ? `${def.color}40` : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} color={isEnabled ? def.color : '#8888A0'} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: isEnabled ? '#F7F8F9' : '#8888A0', margin: 0 }}>
                        {def.title}
                      </h3>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background: isEnabled ? `${def.color}15` : 'rgba(255,255,255,0.04)',
                          color: isEnabled ? def.color : '#8888A0',
                          border: `1px solid ${isEnabled ? `${def.color}30` : 'rgba(255,255,255,0.08)'}`,
                          padding: '2px 8px',
                          borderRadius: 100,
                        }}
                      >
                        {def.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>
                      {def.description}
                    </p>
                  </div>
                </div>

                {/* Switch button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isEnabled ? '#34D399' : '#8888A0',
                    }}
                  >
                    {isUpdating ? 'Yenilənir...' : isEnabled ? 'Aktiv' : 'Deaktiv'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggle(def.key)}
                    disabled={isUpdating}
                    style={{
                      width: 52,
                      height: 28,
                      borderRadius: 100,
                      background: isEnabled ? '#10B981' : '#2A2D3A',
                      border: 'none',
                      cursor: isUpdating ? 'wait' : 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                      padding: 2,
                      outline: 'none',
                    }}
                  >
                    <motion.div
                      animate={{
                        x: isEnabled ? 24 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      {isUpdating && <Loader2 size={12} color="#000" style={{ animation: 'spin 1s linear infinite' }} />}
                    </motion.div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

