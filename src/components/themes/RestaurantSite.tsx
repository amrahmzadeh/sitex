'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle,
  ChevronDown, X, Star, Flame, Sparkles, Menu, ExternalLink,
  ShoppingCart, Plus, Minus, Trash2, Check,
} from 'lucide-react';
import { ThemeConfig, defaultThemes, getGoogleFontsUrl } from '@/lib/themes';
import { formatPrice, formatWhatsAppUrl } from '@/lib/utils';
import SplashScreen, { SplashConfig } from './SplashScreen';

interface MenuItem {
  id: string; name: string; slug: string; description?: string; price: number; discountPrice?: number;
  image?: string; isFeatured: boolean; isNew: boolean; isPopular: boolean;
  ingredients?: string; allergens?: string; portionSize?: string;
}

interface MenuCategory {
  id: string; name: string; slug: string; isVisible: boolean;
  menuItems: MenuItem[];
}

interface SiteData {
  organization: {
    name: string; slug: string; logo?: string; description?: string;
    phone?: string; email?: string; address?: string; city?: string; mapUrl?: string; currency: string;
  };
  website: {
    theme: Record<string, unknown>;
    seoTitle?: string;
    seoDescription?: string;
    splashEnabled?: boolean;
    splashConfig?: SplashConfig;
  };
  whatsapp?: { countryCode: string; phoneNumber: string; orderMessage: string; buttonText: string; isEnabled: boolean; };
  socialLinks: Array<{ platform: string; url: string }>;
  workingHours: Array<{ dayOfWeek: number; openTime?: string; closeTime?: string; isClosed: boolean }>;
  menuCategories: MenuCategory[];
}

const DAY_NAMES = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];

function WhatsAppButton({ theme, whatsapp, item }: { theme: ThemeConfig; whatsapp: SiteData['whatsapp']; item?: MenuItem }) {
  if (!whatsapp?.isEnabled || !whatsapp.phoneNumber) return null;

  const message = item
    ? whatsapp.orderMessage.replace('{name}', item.name).replace('{price}', (item.discountPrice || item.price).toFixed(2))
    : whatsapp.orderMessage.replace('{name}', '').replace('{price}', '');

  const url = formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, message);
  const waBg = theme.whatsappColor || '#25D366';
  const waColor = theme.whatsappIconColor || '#FFFFFF';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: item ? '10px 20px' : '14px 28px',
        background: waBg, color: waColor, borderRadius: theme.borderRadius,
        textDecoration: 'none', fontWeight: 700,
        fontSize: item ? 14 : 16,
        boxShadow: `0 4px 16px ${waBg}59`,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${waBg}73`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${waBg}59`; }}
    >
      <MessageCircle size={item ? 16 : 20} color={waColor} />
      {item ? whatsapp.buttonText : 'WhatsApp ilə sifariş et'}
    </a>
  );
}

function ItemModal({
  item,
  theme,
  whatsapp,
  currency,
  onClose,
  onAddToCart,
}: {
  item: MenuItem;
  theme: ThemeConfig;
  whatsapp: SiteData['whatsapp'];
  currency: string;
  onClose: () => void;
  onAddToCart: (item: MenuItem, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const unitPrice = item.discountPrice || item.price;
  const totalPrice = unitPrice * qty;

  const handleAdd = () => {
    onAddToCart(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const singleOrderMsg = `Salam! Sifariş vermək istəyirəm:\n\n🍽️ ${item.name} — ${qty} ədəd x ${unitPrice.toFixed(2)} ${currency} = ${totalPrice.toFixed(2)} ${currency}`;
  const singleWhatsAppUrl = whatsapp?.isEnabled && whatsapp.phoneNumber
    ? formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, singleOrderMsg)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.backgroundColor, width: '100%', maxWidth: 600,
          borderRadius: `${theme.borderRadius} ${theme.borderRadius} 0 0`,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {item.image && (
          <div style={{ width: '100%', height: 260, overflow: 'hidden' }}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
            <h2 style={{ fontFamily: theme.headingFont, fontSize: 24, fontWeight: 800, color: theme.textColor, lineHeight: 1.2 }}>{item.name}</h2>
            <button onClick={onClose} style={{ border: 'none', background: `${theme.textColor}15`, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={18} color={theme.textColor} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {item.isFeatured && <span style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor, padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>⭐ Seçilmiş</span>}
            {item.isNew && <span style={{ background: '#34D39920', color: '#34D399', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>✨ Yeni</span>}
            {item.isPopular && <span style={{ background: '#F8717120', color: '#F87171', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>🔥 Populyar</span>}
          </div>

          {item.description && (
            <p style={{ fontFamily: theme.bodyFont, color: `${theme.textColor}CC`, lineHeight: 1.7, marginBottom: 20, fontSize: 15 }}>{item.description}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            {item.discountPrice ? (
              <>
                <span style={{ fontSize: 28, fontWeight: 800, color: theme.primaryColor }}>{formatPrice(item.discountPrice, currency)}</span>
                <span style={{ fontSize: 18, color: `${theme.textColor}60`, textDecoration: 'line-through' }}>{formatPrice(item.price, currency)}</span>
                <span style={{ background: '#34D39920', color: '#34D399', padding: '4px 10px', borderRadius: 100, fontSize: 13, fontWeight: 700 }}>
                  -{Math.round((1 - item.discountPrice / item.price) * 100)}%
                </span>
              </>
            ) : (
              <span style={{ fontSize: 28, fontWeight: 800, color: theme.primaryColor }}>{formatPrice(item.price, currency)}</span>
            )}
          </div>

          {(item.ingredients || item.allergens || item.portionSize) && (
            <div style={{ background: `${theme.secondaryColor}10`, borderRadius: theme.borderRadius, padding: 16, marginBottom: 20 }}>
              {item.portionSize && <p style={{ fontSize: 13, color: `${theme.textColor}AA`, marginBottom: 6 }}>📏 <strong>Porsiya:</strong> {item.portionSize}</p>}
              {item.ingredients && <p style={{ fontSize: 13, color: `${theme.textColor}AA`, marginBottom: 6 }}>🥗 <strong>Tərkib:</strong> {item.ingredients}</p>}
              {item.allergens && <p style={{ fontSize: 13, color: '#F87171' }}>⚠️ <strong>Allergenlər:</strong> {item.allergens}</p>}
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: `${theme.secondaryColor}08`, borderRadius: theme.borderRadius, marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.textColor }}>Miqdar</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${theme.primaryColor}30`, background: theme.backgroundColor, color: theme.textColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={16} />
              </button>
              <span style={{ fontSize: 18, fontWeight: 800, color: theme.textColor, minWidth: 28, textAlign: 'center' }}>{qty}</span>
              <button
                type="button"
                onClick={() => setQty(q => q + 1)}
                style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${theme.primaryColor}30`, background: theme.backgroundColor, color: theme.textColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={handleAdd}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: theme.borderRadius,
                background: added ? '#34D399' : theme.primaryColor, color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: `0 4px 16px ${theme.primaryColor}40`, transition: 'all 0.2s',
              }}
            >
              {added ? <Check size={20} /> : <ShoppingCart size={20} />}
              {added ? 'Səbətə əlavə edildi!' : `Səbətə əlavə et (${formatPrice(totalPrice, currency)})`}
            </button>

            {singleWhatsAppUrl && (
              <a
                href={singleWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: theme.borderRadius,
                  background: theme.whatsappColor || '#25D366', color: theme.whatsappIconColor || '#FFFFFF', textDecoration: 'none',
                  fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10, boxShadow: `0 4px 16px ${(theme.whatsappColor || '#25D366')}59`,
                  boxSizing: 'border-box',
                }}
              >
                <MessageCircle size={20} color={theme.whatsappIconColor || '#FFFFFF'} />
                WhatsApp ilə tək sifariş et
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  onClear,
  theme,
  whatsapp,
  currency,
  restaurantName,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, { item: MenuItem; quantity: number }>;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  theme: ThemeConfig;
  whatsapp: SiteData['whatsapp'];
  currency: string;
  restaurantName: string;
}) {
  const [note, setNote] = useState('');
  const entries = Object.values(cart);
  const totalCount = entries.reduce((s, e) => s + e.quantity, 0);
  const totalSum = entries.reduce((s, e) => s + (e.item.discountPrice || e.item.price) * e.quantity, 0);

  const buildWhatsAppUrl = () => {
    if (!whatsapp?.phoneNumber) return '#';
    let text = `Salam! *${restaurantName}* üçün sifariş vermək istəyirəm:\n\n`;
    text += `🍽️ *SİFARİŞİM:* (${totalCount} ədəd)\n`;
    entries.forEach((e, idx) => {
      const p = e.item.discountPrice || e.item.price;
      const sub = p * e.quantity;
      text += `${idx + 1}. *${e.item.name}* — ${e.quantity} ədəd x ${p.toFixed(2)} ${currency} = ${sub.toFixed(2)} ${currency}\n`;
    });
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *ÜMUMİ MƏBLƏĞ:* ${totalSum.toFixed(2)} ${currency}\n`;
    if (note.trim()) {
      text += `📝 *Qeyd:* ${note.trim()}\n`;
    }
    return formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            zIndex: 1100, display: 'flex', justifyContent: 'flex-end',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.backgroundColor,
              width: '100%', maxWidth: 440, height: '100%',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${theme.primaryColor}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingCart size={22} color={theme.primaryColor} />
                <h3 style={{ fontFamily: theme.headingFont, fontSize: 20, fontWeight: 800, color: theme.textColor, margin: 0 }}>
                  Səbətiniz
                </h3>
                <span style={{
                  background: `${theme.primaryColor}20`, color: theme.primaryColor,
                  fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                }}>
                  {totalCount}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {entries.length > 0 && (
                  <button
                    onClick={onClear}
                    style={{
                      border: 'none', background: 'transparent', color: '#F87171',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Təmizlə
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    border: 'none', background: `${theme.textColor}15`, borderRadius: '50%',
                    width: 32, height: 32, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: theme.textColor,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Items list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: `${theme.textColor}80` }}>
                  <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: theme.textColor }}>Səbətiniz boşdur</p>
                  <p style={{ fontSize: 13, lineHeight: 1.5 }}>Menyudan bəyəndiyiniz yeməkləri seçib səbətə əlavə edin.</p>
                </div>
              ) : (
                entries.map(({ item, quantity }) => {
                  const p = item.discountPrice || item.price;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', gap: 12, padding: 12,
                        background: `${theme.secondaryColor}08`,
                        borderRadius: theme.borderRadius,
                        alignItems: 'center',
                      }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: 8, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                          🍽️
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: theme.textColor, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: 13, color: theme.primaryColor, fontWeight: 700 }}>
                          {formatPrice(p, currency)}
                        </p>
                      </div>

                      {/* Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, quantity - 1)}
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.primaryColor}30`,
                            background: theme.backgroundColor, color: theme.textColor, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: 13, minWidth: 20, textAlign: 'center', color: theme.textColor }}>
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, quantity + 1)}
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.primaryColor}30`,
                            background: theme.backgroundColor, color: theme.textColor, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        style={{
                          border: 'none', background: 'transparent', color: '#F87171',
                          cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer / Checkout */}
            {entries.length > 0 && (
              <div style={{
                padding: '20px 24px', borderTop: `1px solid ${theme.primaryColor}20`,
                background: theme.backgroundColor,
              }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: `${theme.textColor}AA`, display: 'block', marginBottom: 6 }}>
                    Masa nömrəsi və ya qeyd (istəyə bağlı)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Məs: Masa 4, və ya Çatdırılma ünvanı..."
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: theme.borderRadius,
                      border: `1px solid ${theme.primaryColor}30`, background: `${theme.secondaryColor}08`,
                      color: theme.textColor, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: `${theme.textColor}CC` }}>Ümumi məbləğ:</span>
                  <span style={{ fontFamily: theme.headingFont, fontSize: 24, fontWeight: 800, color: theme.primaryColor }}>
                    {formatPrice(totalSum, currency)}
                  </span>
                </div>

                {whatsapp?.isEnabled && whatsapp.phoneNumber ? (
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      width: '100%', padding: '14px 20px', borderRadius: theme.borderRadius,
                      background: theme.whatsappColor || '#25D366', color: theme.whatsappIconColor || '#FFFFFF', textDecoration: 'none',
                      fontWeight: 700, fontSize: 16, boxShadow: `0 4px 16px ${(theme.whatsappColor || '#25D366')}59`,
                      boxSizing: 'border-box', transition: 'all 0.2s',
                    }}
                  >
                    <MessageCircle size={20} color={theme.whatsappIconColor || '#FFFFFF'} />
                    WhatsApp ilə sifariş et
                  </a>
                ) : (
                  <div style={{ padding: 12, textAlign: 'center', color: '#F87171', fontSize: 13 }}>
                    WhatsApp nömrəsi aktiv deyil
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeaderMedia({ theme }: { theme: ThemeConfig }) {
  if (theme.headerMediaType === 'video' && theme.headerVideoUrl) {
    const url = theme.headerVideoUrl;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {/* iframe is 300% tall and shifted UP so bottom controls are cropped below the visible area */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&muted=1&loop=1&playlist=${ytMatch[1]}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&playsinline=1&enablejsapi=0&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
            title="Header Background Video"
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              width: '300vw',
              height: '300vh',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              border: 'none',
            }}
            tabIndex={-1}
            allow="autoplay"
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Full-cover shield: blocks all clicks/interactions and hides any UI chrome */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'all', background: 'transparent' }} />
        </div>
      );
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&controls=0`}
          title="Header Video"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', border: 'none', transform: 'scale(1.2)' }}
          allow="autoplay; fullscreen"
        />
      );
    }
    return (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  if (theme.headerImageUrl) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${theme.headerImageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
    );
  }

  return null;
}

export default function RestaurantSite({ data }: { data: SiteData }) {
  const rawTheme = data.website.theme as Partial<ThemeConfig>;
  const theme: ThemeConfig = { ...defaultThemes[rawTheme.templateId || 'elegant'], ...rawTheme };
  const { organization, whatsapp, socialLinks, workingHours, menuCategories } = data;
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id || '');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, { item: MenuItem; quantity: number }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const fontsUrl = getGoogleFontsUrl(theme);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cart_' + organization.slug);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, [organization.slug]);

  const addToCart = (item: MenuItem, qty: number = 1) => {
    setCart(prev => {
      const existing = prev[item.id];
      const newQty = (existing?.quantity || 0) + qty;
      const next = { ...prev, [item.id]: { item, quantity: newQty } };
      try { sessionStorage.setItem('cart_' + organization.slug, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev, [id]: { ...prev[id], quantity: qty } };
      try { sessionStorage.setItem('cart_' + organization.slug, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
      try { sessionStorage.setItem('cart_' + organization.slug, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    try { sessionStorage.removeItem('cart_' + organization.slug); } catch {}
  };

  const cartEntries = Object.values(cart);
  const cartCount = cartEntries.reduce((s, e) => s + e.quantity, 0);
  const cartTotal = cartEntries.reduce((s, e) => s + (e.item.discountPrice || e.item.price) * e.quantity, 0);

  const sections = [
    { id: 'home', label: 'Ana Səhifə' },
    { id: 'menu', label: 'Menyu' },
    { id: 'about', label: 'Haqqımızda' },
    { id: 'contact', label: 'Əlaqə' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const allFeatured = menuCategories.flatMap(c => c.menuItems).filter(i => i.isFeatured).slice(0, 6);
  const activeCategoryItems = menuCategories.find(c => c.id === activeCategory)?.menuItems || [];

  const socialIcons: Record<string, string> = {
    instagram: '📷', facebook: '📘', tiktok: '🎵', youtube: '▶️', twitter: '🐦',
  };

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontsUrl} rel="stylesheet" />

      {/* Splash Screen */}
      {data.website.splashEnabled && data.website.splashConfig && (
        <SplashScreen
          config={data.website.splashConfig}
          siteSlug={organization.slug}
        />
      )}

      <div
        style={{
          background: theme.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,${theme.backgroundOverlay ?? 0.4}), rgba(0,0,0,${theme.backgroundOverlay ?? 0.4})), url(${theme.backgroundImageUrl}) center/cover fixed no-repeat`
            : theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.bodyFont,
          minHeight: '100vh',
        }}
      >
        {/* Fixed Header */}
        <header
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            background: `${theme.backgroundColor}E0`,
            borderBottom: `1px solid ${theme.primaryColor}20`,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  style={{
                    width: theme.navLogoSize || 44,
                    height: theme.navLogoSize || 44,
                    borderRadius: theme.logoHasFrame ? 10 : 0,
                    objectFit: 'contain',
                    background: 'transparent',
                  }}
                />
              )}
              <span style={{ fontFamily: theme.headingFont, fontWeight: 800, fontSize: 20, color: theme.textColor }}>
                {organization.name}
              </span>
            </div>

            {/* Desktop Nav + Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <nav style={{ display: 'flex', gap: 8 }}>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    style={{
                      border: 'none', background: 'transparent', color: `${theme.textColor}CC`,
                      fontFamily: theme.bodyFont, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                      padding: '8px 16px', borderRadius: 8, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${theme.primaryColor}15`; (e.currentTarget as HTMLElement).style.color = theme.primaryColor; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = `${theme.textColor}CC`; }}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                style={{
                  border: `1px solid ${cartCount > 0 ? theme.primaryColor : `${theme.primaryColor}30`}`,
                  background: cartCount > 0 ? theme.primaryColor : 'transparent',
                  color: cartCount > 0 ? '#fff' : theme.textColor,
                  borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: theme.bodyFont, fontWeight: 700, fontSize: 14,
                  boxShadow: cartCount > 0 ? `0 2px 12px ${theme.primaryColor}40` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <ShoppingCart size={18} />
                <span>Səbət</span>
                {cartCount > 0 && (
                  <span style={{
                    background: 'rgba(255,255,255,0.3)',
                    padding: '1px 7px', borderRadius: 100, fontSize: 12,
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(p => !p)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'none', color: theme.textColor }}
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section
          id="home"
          style={{
            minHeight: theme.heroHeight || '85vh',
            height: 'auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            overflow: 'hidden',
            paddingTop: 90,
            paddingBottom: 70,
            boxSizing: 'border-box',
            background: `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${theme.primaryColor}88 100%)`,
          }}
        >
          <HeaderMedia theme={theme} />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${theme.heroOverlay * 0.7})` }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: '0 24px',
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            {organization.logo && (
              <motion.img
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                src={organization.logo}
                alt={organization.name}
                style={{
                  maxHeight: theme.heroLogoSize || 120,
                  maxWidth: theme.heroLogoSize ? theme.heroLogoSize * 2 : 240,
                  width: 'auto',
                  height: 'auto',
                  borderRadius: theme.logoHasFrame ? 20 : 0,
                  objectFit: 'contain',
                  display: 'block',
                  marginTop: `${theme.logoMarginTop ?? 0}px`,
                  marginBottom: `${theme.logoSpacing ?? 16}px`,
                  boxShadow: theme.logoHasFrame ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
                  border: 'none',
                  background: 'transparent',
                }}
              />
            )}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontFamily: theme.headingFont, fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, color: '#fff', marginTop: 0, marginBottom: 16, lineHeight: 1.1 }}
            >
              {organization.name}
            </motion.h1>
            {organization.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 36, lineHeight: 1.7, fontFamily: theme.bodyFont }}
              >
                {organization.description}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}
            >
              <button
                onClick={() => scrollTo('menu')}
                style={{
                  background: theme.primaryColor, color: '#fff', border: 'none', borderRadius: theme.borderRadius,
                  padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: theme.bodyFont,
                  boxShadow: `0 4px 20px ${theme.primaryColor}55`, transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                Menyuya bax
              </button>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)' }}
          >
            <ChevronDown size={28} />
          </motion.div>
        </section>

        {/* Featured Items */}
        {allFeatured.length > 0 && (
          <section style={{ padding: '80px 24px', background: `${theme.secondaryColor}08` }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center', marginBottom: 48 }}
              >
                <p style={{ color: theme.primaryColor, fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  ⭐ Seçimlərimiz
                </p>
                <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: theme.textColor }}>
                  Ən Sevimli Yeməklər
                </h2>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {allFeatured.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: theme.backgroundColor, borderRadius: theme.borderRadius,
                      overflow: 'hidden', cursor: 'pointer',
                      boxShadow: `0 2px 16px ${theme.secondaryColor}18`,
                      border: `1px solid ${theme.primaryColor}15`,
                      transition: 'all 0.3s',
                    }}
                    whileHover={{ y: -6, boxShadow: `0 12px 32px ${theme.primaryColor}22` }}
                  >
                    {item.image ? (
                      <div style={{ height: 200, overflow: 'hidden' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                      </div>
                    ) : (
                      <div style={{ height: 200, background: `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.accentColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                        🍽️
                      </div>
                    )}
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        {item.isNew && <span style={{ background: '#34D39920', color: '#34D399', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>YENİ</span>}
                        {item.isPopular && <span style={{ background: '#F8717120', color: '#F87171', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>🔥 POPULYAR</span>}
                      </div>
                      <h3 style={{ fontFamily: theme.headingFont, fontSize: 18, fontWeight: 700, color: theme.textColor, marginBottom: 6 }}>{item.name}</h3>
                      {item.description && (
                        <p style={{ fontSize: 13, color: `${theme.textColor}88`, lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {item.discountPrice ? (
                          <div>
                            <span style={{ fontSize: 18, fontWeight: 800, color: theme.primaryColor }}>{formatPrice(item.discountPrice, organization.currency)}</span>
                            <span style={{ fontSize: 13, color: `${theme.textColor}55`, textDecoration: 'line-through', marginLeft: 8 }}>{formatPrice(item.price, organization.currency)}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 18, fontWeight: 800, color: theme.primaryColor }}>{formatPrice(item.price, organization.currency)}</span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item, 1);
                          }}
                          style={{
                            border: 'none', background: theme.primaryColor, color: '#fff',
                            borderRadius: '50%', width: 34, height: 34, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: `0 2px 8px ${theme.primaryColor}40`, flexShrink: 0,
                            transition: 'all 0.15s',
                          }}
                          title="Səbətə əlavə et"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Full Menu */}
        <section id="menu" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ color: theme.primaryColor, fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                🍽️ Tam Menyu
              </p>
              <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: theme.textColor }}>
                Yeməklərimiz
              </h2>
            </motion.div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '10px 22px', borderRadius: 100, border: `2px solid ${activeCategory === cat.id ? theme.primaryColor : `${theme.primaryColor}30`}`,
                    background: activeCategory === cat.id ? theme.primaryColor : 'transparent',
                    color: activeCategory === cat.id ? '#fff' : theme.textColor,
                    fontFamily: theme.bodyFont, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {cat.name}
                  <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 12 }}>({cat.menuItems.length})</span>
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
              >
                {activeCategoryItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      display: 'flex', gap: 16, padding: 16, cursor: 'pointer',
                      background: theme.backgroundColor,
                      borderRadius: theme.borderRadius,
                      border: `1px solid ${theme.primaryColor}15`,
                      boxShadow: `0 1px 8px ${theme.secondaryColor}10`,
                      transition: 'all 0.25s',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: `0 6px 24px ${theme.primaryColor}18` }}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: 88, height: 88, borderRadius: parseInt(theme.borderRadius) > 8 ? 12 : 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 88, height: 88, borderRadius: 12, background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.accentColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 32 }}>
                        🍽️
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
                        {item.isNew && <span style={{ background: '#34D39918', color: '#34D399', fontSize: 9, padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>YENİ</span>}
                        {item.isPopular && <span style={{ background: '#F8717118', color: '#F87171', fontSize: 9, padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>POPULYAR</span>}
                        {item.isFeatured && <span style={{ background: `${theme.primaryColor}18`, color: theme.primaryColor, fontSize: 9, padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>SEÇİLMİŞ</span>}
                      </div>
                      <h3 style={{ fontFamily: theme.headingFont, fontSize: 15, fontWeight: 700, color: theme.textColor, marginBottom: 4 }}>{item.name}</h3>
                      {item.description && (
                        <p style={{ fontSize: 12, color: `${theme.textColor}77`, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>
                          {item.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {item.discountPrice ? (
                            <>
                              <span style={{ fontWeight: 800, color: theme.primaryColor, fontSize: 15 }}>{formatPrice(item.discountPrice, organization.currency)}</span>
                              <span style={{ fontSize: 12, color: `${theme.textColor}55`, textDecoration: 'line-through' }}>{formatPrice(item.price, organization.currency)}</span>
                            </>
                          ) : (
                            <span style={{ fontWeight: 800, color: theme.primaryColor, fontSize: 15 }}>{formatPrice(item.price, organization.currency)}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item, 1);
                          }}
                          style={{
                            border: 'none', background: theme.primaryColor, color: '#fff',
                            borderRadius: '50%', width: 30, height: 30, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: `0 2px 8px ${theme.primaryColor}40`, flexShrink: 0,
                            transition: 'all 0.15s',
                          }}
                          title="Səbətə əlavə et"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* About */}
        <section id="about" style={{ padding: '80px 24px', background: `${theme.secondaryColor}08` }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p style={{ color: theme.primaryColor, fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Biz kimik?
              </p>
              <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: theme.textColor, marginBottom: 24 }}>
                Haqqımızda
              </h2>
              <p style={{ fontSize: 17, color: `${theme.textColor}CC`, lineHeight: 1.8 }}>
                {organization.description || `${organization.name} — keyfiyyətli yemək və mükəmməl xidmət ilə fərqlənən yerli restoranımız. Hər gün ən təzə məhsullardan hazırlanmış dadlı yeməklərimiz sizi gözləyir.`}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ color: theme.primaryColor, fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Bizimlə əlaqə
              </p>
              <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: theme.textColor }}>
                Əlaqə
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {organization.phone && (
                <motion.a
                  href={`tel:${organization.phone}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 24,
                    background: theme.backgroundColor, borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.primaryColor}20`, textDecoration: 'none', color: theme.textColor,
                    boxShadow: `0 2px 12px ${theme.secondaryColor}10`, transition: 'all 0.2s',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={22} color={theme.primaryColor} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: `${theme.textColor}77`, marginBottom: 2 }}>Telefon</p>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>{organization.phone}</p>
                  </div>
                </motion.a>
              )}

              {organization.email && (
                <motion.a
                  href={`mailto:${organization.email}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 24,
                    background: theme.backgroundColor, borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.primaryColor}20`, textDecoration: 'none', color: theme.textColor,
                    boxShadow: `0 2px 12px ${theme.secondaryColor}10`,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={22} color={theme.primaryColor} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: `${theme.textColor}77`, marginBottom: 2 }}>E-poçt</p>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{organization.email}</p>
                  </div>
                </motion.a>
              )}

              {organization.address && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 24,
                    background: theme.backgroundColor, borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.primaryColor}20`,
                    boxShadow: `0 2px 12px ${theme.secondaryColor}10`,
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={22} color={theme.primaryColor} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: `${theme.textColor}77`, marginBottom: 2 }}>Ünvan</p>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{organization.address}</p>
                    {organization.city && <p style={{ fontSize: 13, color: `${theme.textColor}66` }}>{organization.city}</p>}
                    {organization.mapUrl && (
                      <a href={organization.mapUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: theme.primaryColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <ExternalLink size={12} /> Xəritədə göstər
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Working Hours */}
            {workingHours.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ marginTop: 32, background: theme.backgroundColor, borderRadius: theme.borderRadius, border: `1px solid ${theme.primaryColor}20`, padding: 28, boxShadow: `0 2px 12px ${theme.secondaryColor}10` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} color={theme.primaryColor} />
                  </div>
                  <h3 style={{ fontFamily: theme.headingFont, fontSize: 18, fontWeight: 700, color: theme.textColor }}>İş saatları</h3>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {workingHours.map((wh) => (
                    <div key={wh.dayOfWeek} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.primaryColor}10` }}>
                      <span style={{ fontSize: 14, color: `${theme.textColor}CC` }}>{DAY_NAMES[wh.dayOfWeek]}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: wh.isClosed ? '#F87171' : theme.primaryColor }}>
                        {wh.isClosed ? 'Bağlı' : `${wh.openTime} — ${wh.closeTime}`}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: theme.secondaryColor, padding: '48px 24px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            {organization.logo && (
              <img
                src={organization.logo}
                alt={organization.name}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: theme.logoHasFrame ? 14 : 0,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto 16px auto',
                  background: 'transparent',
                }}
              />
            )}
            <h3 style={{ fontFamily: theme.headingFont, fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{organization.name}</h3>
            {organization.description && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>{organization.description}</p>
            )}

            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none', fontSize: 20, transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${theme.primaryColor}80`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                  >
                    {socialIcons[link.platform] || '🔗'}
                  </a>
                ))}
              </div>
            )}

            {whatsapp?.isEnabled && whatsapp.phoneNumber && (
              <div style={{ marginBottom: 24 }}>
                <WhatsAppButton theme={theme} whatsapp={whatsapp} />
              </div>
            )}

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              © {new Date().getFullYear()} {organization.name}. Bütün hüquqlar qorunur.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 8 }}>
              Sayt <a href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>MyRestoran</a> platforması ilə yaradılıb
            </p>
          </div>
        </footer>

        {/* Item Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <ItemModal
              item={selectedItem}
              theme={theme}
              whatsapp={whatsapp}
              currency={organization.currency}
              onClose={() => setSelectedItem(null)}
              onAddToCart={addToCart}
            />
          )}
        </AnimatePresence>

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClear={clearCart}
          theme={theme}
          whatsapp={whatsapp}
          currency={organization.currency}
          restaurantName={organization.name}
        />

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'fixed', bottom: 24, left: 24, zIndex: 500,
              background: theme.primaryColor, color: '#fff',
              borderRadius: 100, padding: '14px 22px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: `0 8px 30px ${theme.primaryColor}66`,
              border: '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', fontFamily: theme.bodyFont,
              fontWeight: 700, fontSize: 15,
            }}
          >
            <ShoppingCart size={20} />
            <span>Səbət ({cartCount})</span>
            <span style={{
              background: 'rgba(0,0,0,0.25)', padding: '3px 9px',
              borderRadius: 100, fontSize: 13,
            }}>
              {formatPrice(cartTotal, organization.currency)}
            </span>
          </motion.button>
        )}

        {/* WhatsApp Float Button */}
        {whatsapp?.isEnabled && whatsapp.phoneNumber && (
          <a
            href={formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, 'Salam! Sifariş vermək istəyirəm.')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 500,
              width: 60, height: 60, borderRadius: '50%',
              background: theme.whatsappColor || '#25D366', color: theme.whatsappIconColor || '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: `0 4px 20px ${(theme.whatsappColor || '#25D366')}80`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            <MessageCircle size={28} color={theme.whatsappIconColor || '#FFFFFF'} />
          </a>
        )}
      </div>
    </>
  );
}
