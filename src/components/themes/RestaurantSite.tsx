'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle,
  ChevronDown, X, Star, Flame, Sparkles, Menu, ExternalLink,
  ShoppingCart, Plus, Minus, Trash2, Check,
} from 'lucide-react';
import { ThemeConfig, defaultThemes, getGoogleFontsUrl, resolveBg } from '@/lib/themes';
import { formatPrice, formatWhatsAppUrl } from '@/lib/utils';
import SplashScreen, { SplashConfig } from './SplashScreen';
import ProRestaurantSite from './ProRestaurantSite';
import FoodVideoPlayer from './FoodVideoPlayer';
import SocialMediaFeed from './SocialMediaFeed';

export interface MenuItem {
  id: string; name: string; slug: string; description?: string; price: number; discountPrice?: number;
  image?: string; video?: string; isFeatured: boolean; isNew: boolean; isPopular: boolean;
  ingredients?: string; allergens?: string; portionSize?: string;
}

export interface MenuCategory {
  id: string; name: string; slug: string; isVisible: boolean;
  menuItems: MenuItem[];
}

export interface SiteData {
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
  socialFeedPosts?: Array<any>;
  workingHours: Array<{ dayOfWeek: number; openTime?: string; closeTime?: string; isClosed: boolean }>;
  menuCategories: MenuCategory[];
}

const DAY_NAMES = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];

function WhatsAppButton({ theme, whatsapp, item, table }: { theme: ThemeConfig; whatsapp: SiteData['whatsapp']; item?: MenuItem; table?: string | null }) {
  if (!whatsapp?.isEnabled || !whatsapp.phoneNumber) return null;

  const baseMsg = item
    ? whatsapp.orderMessage.replace('{name}', item.name).replace('{price}', (item.discountPrice || item.price).toFixed(2))
    : whatsapp.orderMessage.replace('{name}', '').replace('{price}', '');

  const message = table ? `${baseMsg}\n📍 *MASA:* ${table}` : baseMsg;
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
  table,
}: {
  item: MenuItem;
  theme: ThemeConfig;
  whatsapp: SiteData['whatsapp'];
  currency: string;
  onClose: () => void;
  onAddToCart: (item: MenuItem, qty: number) => void;
  table?: string | null;
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

  const singleOrderMsg = `Salam! Sifariş vermək istəyirəm:${table ? `\n📍 *MASA:* ${table}` : ''}\n\n🍽️ ${item.name} — ${qty} ədəd x ${unitPrice.toFixed(2)} ${currency} = ${totalPrice.toFixed(2)} ${currency}`;
  const singleWhatsAppUrl = whatsapp?.isEnabled && whatsapp.phoneNumber
    ? formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, singleOrderMsg)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: item.video ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: item.video ? 16 : 0,
      }}
      onClick={onClose}
    >
      <div
        className="food-popup-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{
          alignItems: 'stretch',
          maxHeight: '92vh',
        }}
      >
        {item.video && (
          <FoodVideoPlayer
            videoUrl={item.video}
            itemName={item.name}
            borderRadius={theme.borderRadius}
          />
        )}
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          style={{
            background: resolveBg(theme.formBgType, theme.formBgColor, theme.formGradientFrom, theme.formGradientTo, theme.formGradientDir, theme.backgroundColor),
            width: '100%', maxWidth: 600, flex: 1, minWidth: 0,
            borderRadius: item.video ? theme.borderRadius : `${theme.borderRadius} ${theme.borderRadius} 0 0`,
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
      </div>
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
  table,
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
  table?: string | null;
}) {
  const [note, setNote] = useState('');
  const entries = Object.values(cart);
  const totalCount = entries.reduce((s, e) => s + e.quantity, 0);
  const totalSum = entries.reduce((s, e) => s + (e.item.discountPrice || e.item.price) * e.quantity, 0);

  const buildWhatsAppUrl = () => {
    if (!whatsapp?.phoneNumber) return '#';
    let text = `Salam! *${restaurantName}* üçün sifariş vermək istəyirəm:\n`;
    if (table) {
      text += `📍 *MASA:* ${table}\n`;
    }
    text += `\n🍽️ *SİFARİŞİM:* (${totalCount} ədəd)\n`;
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
            className="theme-cart-drawer"
            style={{
              background: resolveBg(theme.formBgType, theme.formBgColor, theme.formGradientFrom, theme.formGradientTo, theme.formGradientDir, theme.backgroundColor),
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

            {/* Active Table indicator in Cart */}
            {table && (
              <div
                style={{
                  margin: '12px 20px 0',
                  padding: '10px 14px',
                  borderRadius: 12,
                  backgroundColor: `${theme.primaryColor}15`,
                  border: `1px solid ${theme.primaryColor}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.textColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📍 {table}
                </span>
                <span style={{ fontSize: 11, color: '#8888A0' }}>Skan edilmiş masa</span>
              </div>
            )}

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
          {/*
            iframe is 500% height, centered, shifted up 100% of its own height
            so the visible window shows only the middle portion of the video.
            The YouTube play button (center of iframe) ends up FAR above the visible area.
            Bottom controls are also below the visible area.
          */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&muted=1&loop=1&playlist=${ytMatch[1]}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&playsinline=1&enablejsapi=0`}
            title="Header Background Video"
            style={{
              position: 'absolute',
              /* Push iframe up: its center aligns with ~25% from top of its own height,
                 meaning the video center lands in the visible area but the UI chrome is off-screen */
              top: '50%',
              left: '50%',
              width: '400vw',
              height: '400vh',
              /* Shift left by 50% of width, up by 62.5% of height so video content is visible
                 but the YouTube overlay buttons (center) are off-screen above */
              transform: 'translate(-50%, -62.5%)',
              pointerEvents: 'none',
              border: 'none',
            }}
            tabIndex={-1}
            allow="autoplay"
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Full-cover interaction shield — captures all pointer events so iframe never receives clicks */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'all' }} />
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

export default function RestaurantSite({ data, initialTable }: { data: SiteData; initialTable?: string }) {
  const rawTheme = (data.website.theme || {}) as Partial<ThemeConfig>;
  const baseTemplateKey = rawTheme.templateId && defaultThemes[rawTheme.templateId] ? rawTheme.templateId : 'elegant';
  const theme: ThemeConfig = {
    ...defaultThemes[baseTemplateKey],
    ...rawTheme,
    isProTemplate: Boolean(rawTheme.isProTemplate),
  };

  const [table, setTable] = useState<string | null>(initialTable || null);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const urlTable = (sp.get('table') || sp.get('masa'))?.trim();
      if (urlTable) {
        const formatted = urlTable.toLowerCase().startsWith('masa') ? urlTable : `Masa ${urlTable}`;
        setTable(formatted);
        sessionStorage.setItem('active_table_' + data.organization.slug, formatted);
        return;
      }
      if (initialTable) {
        setTable(initialTable);
        sessionStorage.setItem('active_table_' + data.organization.slug, initialTable);
        return;
      }
      const saved = sessionStorage.getItem('active_table_' + data.organization.slug);
      if (saved) {
        setTable(saved);
      }
    } catch {}
  }, [data.organization.slug, initialTable]);

  if (theme.isProTemplate) {
    return <ProRestaurantSite data={data} theme={theme} table={table} />;
  }
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

  const navbarBg = resolveBg(theme.navbarBgType, theme.navbarBgColor, theme.navbarGradientFrom, theme.navbarGradientTo, theme.navbarGradientDir, `${theme.backgroundColor}E0`);
  const formBg = resolveBg(theme.formBgType, theme.formBgColor, theme.formGradientFrom, theme.formGradientTo, theme.formGradientDir, theme.backgroundColor);
  const siteBg = resolveBg(theme.siteBgType, theme.siteBgColor, theme.siteGradientFrom, theme.siteGradientTo, theme.siteGradientDir, theme.backgroundColor);
  const footerBg = resolveBg(theme.footerBgType, theme.footerBgColor, theme.footerGradientFrom, theme.footerGradientTo, theme.footerGradientDir, theme.secondaryColor);

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontsUrl} rel="stylesheet" />

      {/* Responsive stylesheet for both screen viewports and dashboard preview container */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .restaurant-site-container {
          container-type: inline-size;
          container-name: siteRoot;
          width: 100%;
        }
        .theme-mobile-nav-btn {
          display: none !important;
        }
        .theme-desktop-nav {
          display: flex !important;
        }
        .theme-category-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
          justify-content: center;
        }
        .theme-header-spacer { display: none; }
        @media (max-width: 768px) {
          .theme-desktop-nav { display: none !important; }
          .theme-mobile-nav-btn { display: flex !important; }
          .theme-navbar-cart { display: none !important; }
          .theme-header-spacer { display: block !important; }
          .theme-header-inner {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            padding: 0 16px !important;
            height: 64px !important;
          }
          .theme-header-brand {
            grid-column: 2 !important;
            justify-self: center !important;
            flex: none !important;
          }
          .theme-header-right {
            grid-column: 3 !important;
            justify-self: end !important;
          }
          .theme-category-tabs {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
            padding: 4px 6px 12px 6px !important;
            margin-bottom: 24px !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .theme-category-tabs::-webkit-scrollbar { display: none; }
          .theme-hero-section {
            padding-top: 80px !important;
            padding-bottom: 50px !important;
            min-height: auto !important;
          }
          .theme-section-padding { padding: 48px 16px !important; }
          .theme-cart-drawer { max-width: 100% !important; }
        }
        @container siteRoot (max-width: 768px) {
          .theme-desktop-nav { display: none !important; }
          .theme-mobile-nav-btn { display: flex !important; }
          .theme-navbar-cart { display: none !important; }
          .theme-header-spacer { display: block !important; }
          .theme-header-inner {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            padding: 0 16px !important;
            height: 64px !important;
          }
          .theme-header-brand {
            grid-column: 2 !important;
            justify-self: center !important;
            flex: none !important;
          }
          .theme-header-right {
            grid-column: 3 !important;
            justify-self: end !important;
          }
          .theme-category-tabs {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
            padding: 4px 6px 12px 6px !important;
            margin-bottom: 24px !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .theme-category-tabs::-webkit-scrollbar { display: none; }
          .theme-hero-section {
            padding-top: 80px !important;
            padding-bottom: 50px !important;
            min-height: auto !important;
          }
          .theme-section-padding { padding: 48px 16px !important; }
          .theme-cart-drawer { max-width: 100% !important; }
        }
        @media (max-width: 640px) {
          .theme-floating-cart {
            bottom: 16px !important;
            left: 14px !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            max-width: calc(100vw - 90px) !important;
          }
          .theme-floating-whatsapp {
            bottom: 16px !important;
            right: 14px !important;
            width: 48px !important;
            height: 48px !important;
          }
        }
        @container siteRoot (max-width: 640px) {
          .theme-floating-cart {
            bottom: 16px !important;
            left: 14px !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            max-width: calc(100% - 90px) !important;
          }
          .theme-floating-whatsapp {
            bottom: 16px !important;
            right: 14px !important;
            width: 48px !important;
            height: 48px !important;
          }
        }
        `,
        }}
      />

      {/* Splash Screen */}
      {data.website.splashEnabled && data.website.splashConfig && (
        <SplashScreen
          config={data.website.splashConfig}
          siteSlug={organization.slug}
        />
      )}

      <div
        className="restaurant-site-container"
        style={{
          background: theme.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,${theme.backgroundOverlay ?? 0.4}), rgba(0,0,0,${theme.backgroundOverlay ?? 0.4})), url(${theme.backgroundImageUrl}) center/cover fixed no-repeat`
            : siteBg,
          color: theme.textColor,
          fontFamily: theme.bodyFont,
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* Fixed Header */}
        <header
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            background: navbarBg,
            borderBottom: `1px solid ${theme.primaryColor}20`,
          }}
        >
          <div
            className="theme-header-inner"
            style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
          >
            {/* Left spacer: hidden on desktop, col-1 on mobile grid for centering */}
            <div className="theme-header-spacer" style={{ display: 'none' }} />

            {/* Center: Brand */}
            <div className="theme-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  style={{
                    width: theme.navLogoSize || 40,
                    height: theme.navLogoSize || 40,
                    borderRadius: theme.logoHasFrame ? 10 : 0,
                    objectFit: 'contain',
                    background: 'transparent',
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: theme.brandFont || theme.headingFont,
                  fontWeight: 800,
                  fontSize: 'clamp(16px, 3.5vw, 20px)',
                  color: theme.textColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '45vw',
                }}
              >
                {organization.name}
              </span>
            </div>

            {/* Right: Desktop Nav + Cart (always) + Burger (mobile only) */}
            <div className="theme-header-right" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
              <nav className="theme-desktop-nav" style={{ display: 'flex', gap: 8 }}>
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

              {/* Cart — hidden on mobile, shown in burger drawer */}
              <button
                type="button"
                className="theme-navbar-cart"
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
                  marginLeft: 14,
                }}
              >
                <ShoppingCart size={18} />
                <span>Səbət</span>
                {cartCount > 0 && (
                  <span style={{ background: 'rgba(255,255,255,0.3)', padding: '1px 7px', borderRadius: 100, fontSize: 12 }}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Burger — mobile only */}
              <button
                type="button"
                className="theme-mobile-nav-btn"
                onClick={() => setMobileMenuOpen(p => !p)}
                aria-label="Menyu"
                style={{
                  border: `1px solid ${theme.primaryColor}30`,
                  background: mobileMenuOpen ? `${theme.primaryColor}20` : 'transparent',
                  borderRadius: 10, width: 40, height: 40,
                  display: 'none', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: theme.textColor, transition: 'all 0.2s',
                }}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 64,
                left: 0,
                right: 0,
                zIndex: 99,
                background: navbarBg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${theme.primaryColor}30`,
                boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.05)',
                    color: theme.textColor,
                    fontFamily: theme.bodyFont,
                    fontSize: 15,
                    fontWeight: 600,
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: theme.borderRadius,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: 16, opacity: 0.6 }}>→</span>
                </button>
              ))}
              {/* Cart button inside mobile drawer */}
              <button
                type="button"
                onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }}
                style={{
                  border: `1px solid ${cartCount > 0 ? theme.primaryColor : `${theme.primaryColor}40`}`,
                  background: cartCount > 0 ? theme.primaryColor : 'rgba(255,255,255,0.05)',
                  color: cartCount > 0 ? '#fff' : theme.textColor,
                  fontFamily: theme.bodyFont,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '12px 16px',
                  borderRadius: theme.borderRadius,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: cartCount > 0 ? `0 2px 12px ${theme.primaryColor}40` : 'none',
                  marginTop: 8,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={18} />
                  Səbət
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {cartCount > 0 && (
                    <span style={{ background: 'rgba(255,255,255,0.3)', padding: '1px 8px', borderRadius: 100, fontSize: 13, fontWeight: 700 }}>
                      {cartCount}
                    </span>
                  )}
                  <span style={{ fontSize: 16, opacity: 0.6 }}>→</span>
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section
          id="home"
          className="theme-hero-section"
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
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${theme.backgroundOverlay ?? theme.heroOverlay ?? 0.4})`, zIndex: 1 }} />
          {/* Bottom fade: smooth transition from hero into page background */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '35%',
            background: `linear-gradient(to bottom, transparent 0%, ${theme.siteBgType === 'gradient' ? (theme.siteGradientFrom || theme.siteBgColor || theme.backgroundColor) : (theme.siteBgColor || theme.backgroundColor)} 100%)`,
            zIndex: 2,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            zIndex: 3,
            padding: '0 20px',
            maxWidth: 800,
            width: '100%',
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
                  maxWidth: 'min(100%, 240px)',
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
              style={{ fontFamily: theme.brandFont || theme.headingFont, fontSize: 'clamp(28px, 6vw, 64px)', fontWeight: 900, color: '#fff', marginTop: 0, marginBottom: 16, lineHeight: 1.15, wordBreak: 'break-word' }}
            >
              {organization.name}
            </motion.h1>
            {organization.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', color: 'rgba(255,255,255,0.88)', marginBottom: 32, lineHeight: 1.7, fontFamily: theme.bodyFont, maxWidth: 640 }}
              >
                {organization.description}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}
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
          <section className="theme-section-padding" style={{ padding: '80px 24px', background: `${theme.secondaryColor}08` }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center', marginBottom: 40 }}
              >
                <p style={{ color: theme.primaryColor, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                  ⭐ Seçimlərimiz
                </p>
                <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: theme.textColor, margin: 0 }}>
                  Ən Sevimli Yeməklər
                </h2>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(16px, 3vw, 24px)' }}>
                {allFeatured.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: formBg, borderRadius: theme.borderRadius,
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
        <section id="menu" className="theme-section-padding" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 36 }}>
              <p style={{ color: theme.primaryColor, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                🍽️ Tam Menyu
              </p>
              <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: theme.textColor, margin: 0 }}>
                Yeməklərimiz
              </h2>
            </motion.div>

            {/* Category Tabs */}
            <div className="theme-category-tabs">
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '10px 20px', borderRadius: 100, border: `2px solid ${activeCategory === cat.id ? theme.primaryColor : `${theme.primaryColor}30`}`,
                    background: activeCategory === cat.id ? theme.primaryColor : 'transparent',
                    color: activeCategory === cat.id ? '#fff' : theme.textColor,
                    fontFamily: theme.bodyFont, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    flexShrink: 0, whiteSpace: 'nowrap',
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
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(14px, 2.5vw, 20px)' }}
              >
                {activeCategoryItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      display: 'flex', gap: 14, padding: 14, cursor: 'pointer',
                      background: formBg,
                      borderRadius: theme.borderRadius,
                      border: `1px solid ${theme.primaryColor}15`,
                      boxShadow: `0 1px 8px ${theme.secondaryColor}10`,
                      transition: 'all 0.25s',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: `0 6px 24px ${theme.primaryColor}18` }}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: 80, height: 80, borderRadius: parseInt(theme.borderRadius) > 8 ? 12 : 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 80, height: 80, borderRadius: 12, background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.accentColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 28 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
        <section id="about" className="theme-section-padding" style={{ padding: '80px 24px', background: `${theme.secondaryColor}08` }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p style={{ color: theme.primaryColor, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Biz kimik?
              </p>
              <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: theme.textColor, marginBottom: 20 }}>
                Haqqımızda
              </h2>
              <p style={{ fontSize: 'clamp(14px, 3.5vw, 17px)', color: `${theme.textColor}CC`, lineHeight: 1.8 }}>
                {organization.description || `${organization.name} — keyfiyyətli yemək və mükəmməl xidmət ilə fərqlənən yerli restoranımız. Hər gün ən təzə məhsullardan hazırlanmış dadlı yeməklərimiz sizi gözləyir.`}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="theme-section-padding" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ color: theme.primaryColor, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Bizimlə əlaqə
              </p>
              <h2 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: theme.textColor, margin: 0 }}>
                Əlaqə
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'clamp(16px, 3vw, 24px)' }}>
              {organization.phone && (
                <motion.a
                  href={`tel:${organization.phone}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 'clamp(16px, 3vw, 24px)',
                    background: formBg, borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.primaryColor}20`, textDecoration: 'none', color: theme.textColor,
                    boxShadow: `0 2px 12px ${theme.secondaryColor}10`, transition: 'all 0.2s',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} color={theme.primaryColor} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: `${theme.textColor}77`, marginBottom: 2 }}>Telefon</p>
                    <p style={{ fontSize: 15, fontWeight: 700, margin: 0, wordBreak: 'break-all' }}>{organization.phone}</p>
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
                    display: 'flex', alignItems: 'center', gap: 16, padding: 'clamp(16px, 3vw, 24px)',
                    background: formBg, borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.primaryColor}20`, textDecoration: 'none', color: theme.textColor,
                    boxShadow: `0 2px 12px ${theme.secondaryColor}10`,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} color={theme.primaryColor} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: `${theme.textColor}77`, marginBottom: 2 }}>E-poçt</p>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0, wordBreak: 'break-all' }}>{organization.email}</p>
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
                    display: 'flex', alignItems: 'center', gap: 16, padding: 'clamp(16px, 3vw, 24px)',
                    background: formBg, borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.primaryColor}20`,
                    boxShadow: `0 2px 12px ${theme.secondaryColor}10`,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} color={theme.primaryColor} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: `${theme.textColor}77`, marginBottom: 2 }}>Ünvan</p>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{organization.address}</p>
                    {organization.city && <p style={{ fontSize: 13, color: `${theme.textColor}66`, margin: '2px 0 0' }}>{organization.city}</p>}
                    {organization.mapUrl && (
                      <a href={organization.mapUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: theme.primaryColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
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
                style={{ marginTop: 32, background: formBg, borderRadius: theme.borderRadius, border: `1px solid ${theme.primaryColor}20`, padding: 'clamp(18px, 3.5vw, 28px)', boxShadow: `0 2px 12px ${theme.secondaryColor}10` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} color={theme.primaryColor} />
                  </div>
                  <h3 style={{ fontFamily: theme.headingFont, fontSize: 17, fontWeight: 700, color: theme.textColor, margin: 0 }}>İş saatları</h3>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {workingHours.map((wh) => (
                    <div key={wh.dayOfWeek} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${theme.primaryColor}10`, fontSize: 13 }}>
                      <span style={{ color: `${theme.textColor}CC` }}>{DAY_NAMES[wh.dayOfWeek]}</span>
                      <span style={{ fontWeight: 600, color: wh.isClosed ? '#F87171' : theme.primaryColor }}>
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
        <footer style={{ background: footerBg, padding: '48px 20px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            {organization.logo && (
              <img
                src={organization.logo}
                alt={organization.name}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: theme.logoHasFrame ? 14 : 0,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto 16px auto',
                  background: 'transparent',
                }}
              />
            )}
            <h3 style={{ fontFamily: theme.brandFont || theme.headingFont, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{organization.name}</h3>
            {organization.description && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>{organization.description}</p>
            )}

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              {theme.footerCopyrightText || `© ${new Date().getFullYear()} ${organization.name}. Bütün hüquqlar qorunur.`}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 6 }}>
              {theme.footerPlatformText || <>Sayt <a href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>MyRestoran</a> platforması ilə yaradılıb</>}
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
              table={table}
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
          table={table}
        />

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <motion.button
            className="theme-floating-cart"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'fixed', bottom: 24, left: 24, zIndex: 500,
              background: theme.primaryColor, color: '#fff',
              borderRadius: 100, padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: `0 8px 30px ${theme.primaryColor}66`,
              border: '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', fontFamily: theme.bodyFont,
              fontWeight: 700, fontSize: 14,
            }}
          >
            <ShoppingCart size={18} />
            <span>Səbət ({cartCount})</span>
            <span style={{
              background: 'rgba(0,0,0,0.25)', padding: '2px 8px',
              borderRadius: 100, fontSize: 12,
            }}>
              {formatPrice(cartTotal, organization.currency)}
            </span>
          </motion.button>
        )}


      </div>
    </>
  );
}
