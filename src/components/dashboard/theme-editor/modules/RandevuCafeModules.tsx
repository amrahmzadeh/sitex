'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface RandevuCafeModulesProps {
  theme: ThemeConfig;
  onChange: (updated: ThemeConfig) => void;
}

const DARK_CARD = '#1C1F2E';
const DARK_INPUT = '#12141E';
const BORDER = '#2A2A3A';
const LABEL_COLOR = '#9BA3AF';
const TEXT_COLOR = '#E8E8F0';
const ACCENT = '#004527';

function CollapsiblePanel({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: DARK_CARD, borderRadius: 12, border: `1px solid ${BORDER}`, marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', color: TEXT_COLOR, fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}
      >
        {title}
        {open ? <ChevronUp size={16} color={LABEL_COLOR} /> : <ChevronDown size={16} color={LABEL_COLOR} />}
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value?: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: LABEL_COLOR, marginBottom: 5, letterSpacing: '0.05em' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ width: '100%', background: DARK_INPUT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', color: TEXT_COLOR, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', background: DARK_INPUT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', color: TEXT_COLOR, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

export default function RandevuCafeModules({ theme, onChange }: RandevuCafeModulesProps) {
  const set = (key: keyof ThemeConfig, value: string) => onChange({ ...theme, [key]: value });

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: `${ACCENT}`, letterSpacing: '0.08em', marginBottom: 12, padding: '6px 12px', background: `${ACCENT}15`, borderRadius: 8, border: `1px solid ${ACCENT}30` }}>
        🍃 RANDEVU CAFE & LOUNGE — PRO MODUL
      </div>

      {/* Hero Module */}
      <CollapsiblePanel title="🌿 Hero Bölməsi" defaultOpen>
        <Field label="BADGE MƏTNİ" value={theme.heroBadgeText} onChange={v => set('heroBadgeText', v)} placeholder="AİLƏVİ VƏ PREMIUM LOUNGE..." />
        <Field label="ANA BAŞLIQ" value={theme.heroHeadline} onChange={v => set('heroHeadline', v)} placeholder="Ailəniz ilə Unudulmaz Görüşlər" type="textarea" />
        <Field label="ALT BAŞLIQ" value={theme.heroSubheadline} onChange={v => set('heroSubheadline', v)} type="textarea" placeholder="Ləziz təamlar, qəhvə..." />
        <Grid2>
          <Field label="DÜYMƏ 1" value={theme.heroCta1} onChange={v => set('heroCta1', v)} placeholder="Menyu ilə Tanışlıq" />
          <Field label="DÜYMƏ 2" value={theme.heroCta2} onChange={v => set('heroCta2', v)} placeholder="Rezervasiya Et" />
        </Grid2>
        <Grid2>
          <Field label="XÜSUSİYYƏT 1" value={theme.heroFeature1} onChange={v => set('heroFeature1', v)} placeholder="Ailəvi Mühit" />
          <Field label="XÜSUSİYYƏT 2" value={theme.heroFeature2} onChange={v => set('heroFeature2', v)} placeholder="Zəngin Menyu" />
        </Grid2>
        <Field label="XÜSUSİYYƏT 3" value={theme.heroFeature3} onChange={v => set('heroFeature3', v)} placeholder="Canlı Musiqi" />
        <Field label="ANA ŞƏKIL URL" value={theme.heroMainImage} onChange={v => set('heroMainImage', v)} placeholder="https://..." />
        <Grid2>
          <Field label="ŞƏKIL 2 URL" value={theme.heroImage2} onChange={v => set('heroImage2', v)} placeholder="https://..." />
          <Field label="ŞƏKIL 3 URL" value={theme.heroImage3} onChange={v => set('heroImage3', v)} placeholder="https://..." />
        </Grid2>
        <Grid2>
          <Field label="ANA ŞƏKIL ETİKETİ" value={theme.heroMainImageLabel} onChange={v => set('heroMainImageLabel', v)} placeholder="Özel Dad Palitrası" />
          <Field label="ANA ŞƏKIL BADGESİ" value={theme.heroMainImageBadge} onChange={v => set('heroMainImageBadge', v)} placeholder="Gündəlik Təzə" />
        </Grid2>
        <Grid2>
          <Field label="ŞƏKIL 2 ETİKET" value={theme.heroImage2Label} onChange={v => set('heroImage2Label', v)} placeholder="Arabika Qəhvəsi" />
          <Field label="ŞƏKIL 3 ETİKET" value={theme.heroImage3Label} onChange={v => set('heroImage3Label', v)} placeholder="Səmimi Mühit" />
        </Grid2>
        <Grid2>
          <Field label="REYTİNQ" value={theme.heroRatingScore} onChange={v => set('heroRatingScore', v)} placeholder="4.9" />
          <Field label="REYTİNQ ETİKETİ" value={theme.heroRatingLabel} onChange={v => set('heroRatingLabel', v)} placeholder="Xoşbəxt Qonaqlar" />
        </Grid2>
      </CollapsiblePanel>

      {/* About Module */}
      <CollapsiblePanel title="📖 Haqqımızda Bölməsi">
        <Field label="BADGE MƏTNİ" value={theme.aboutBadgeText} onChange={v => set('aboutBadgeText', v)} placeholder="BİZİM HEKAYƏMİZ" />
        <Field label="BAŞLIQ" value={theme.aboutHeadline} onChange={v => set('aboutHeadline', v)} type="textarea" placeholder="Randevu — Sevgi ilə..." />
        <Field label="MƏTN 1" value={theme.aboutBody1} onChange={v => set('aboutBody1', v)} type="textarea" placeholder="Filosofiyamız..." />
        <Field label="MƏTN 2" value={theme.aboutBody2} onChange={v => set('aboutBody2', v)} type="textarea" placeholder="İstər səhər saatlarında..." />
        <Field label="ŞƏKIL URL" value={theme.aboutImageUrl} onChange={v => set('aboutImageUrl', v)} placeholder="https://..." />
        <Grid2>
          <Field label="OVERLAY BAŞLIQ" value={theme.aboutBadgeOverlayTitle} onChange={v => set('aboutBadgeOverlayTitle', v)} placeholder="MƏTBƏX SƏNƏTİ" />
          <Field label="OVERLAY MƏTNİ" value={theme.aboutBadgeOverlayText} onChange={v => set('aboutBadgeOverlayText', v)} placeholder="Yalnız təbii nemətlər" />
        </Grid2>
        <div style={{ fontSize: 11, color: LABEL_COLOR, letterSpacing: '0.05em', fontWeight: 600, marginTop: 4 }}>STATİSTİKALAR</div>
        <Grid2>
          <Field label="STAT 1 RƏQƏM" value={theme.aboutStat1Value} onChange={v => set('aboutStat1Value', v)} placeholder="100+" />
          <Field label="STAT 1 ETİKET" value={theme.aboutStat1Label} onChange={v => set('aboutStat1Label', v)} placeholder="Ləziz Təam" />
        </Grid2>
        <Grid2>
          <Field label="STAT 2 RƏQƏM" value={theme.aboutStat2Value} onChange={v => set('aboutStat2Value', v)} placeholder="50+" />
          <Field label="STAT 2 ETİKET" value={theme.aboutStat2Label} onChange={v => set('aboutStat2Label', v)} placeholder="İsti & Soyuq İçki" />
        </Grid2>
        <Grid2>
          <Field label="STAT 3 RƏQƏM" value={theme.aboutStat3Value} onChange={v => set('aboutStat3Value', v)} placeholder="100%" />
          <Field label="STAT 3 ETİKET" value={theme.aboutStat3Label} onChange={v => set('aboutStat3Label', v)} placeholder="Razı Qonaqlar" />
        </Grid2>
        <Grid2>
          <Field label="STAT 4 RƏQƏM" value={theme.aboutStat4Value} onChange={v => set('aboutStat4Value', v)} placeholder="7/24" />
          <Field label="STAT 4 ETİKET" value={theme.aboutStat4Label} onChange={v => set('aboutStat4Label', v)} placeholder="Qonaqpərvərlik" />
        </Grid2>
      </CollapsiblePanel>

      {/* Offers Module */}
      <CollapsiblePanel title="🎁 Xüsusi Təkliflər">
        <Field label="BADGE" value={theme.offersBadgeText} onChange={v => set('offersBadgeText', v)} placeholder="ÖZƏL FÜRSƏTLƏR" />
        <Field label="BAŞLIQ" value={theme.offersHeadline} onChange={v => set('offersHeadline', v)} placeholder="Xüsusi Təkliflər" />
        <Field label="ALT BAŞLIQ" value={theme.offersSubtitle} onChange={v => set('offersSubtitle', v)} type="textarea" />

        <div style={{ fontSize: 11, color: LABEL_COLOR, letterSpacing: '0.05em', fontWeight: 600, marginTop: 4 }}>1-Cİ KART (Biznes Nahar)</div>
        <Grid2>
          <Field label="ETİKET" value={theme.offer1Tag} onChange={v => set('offer1Tag', v)} placeholder="HƏFTƏ İÇİ" />
          <Field label="SAAT" value={theme.offer1Time} onChange={v => set('offer1Time', v)} placeholder="12:00 - 15:00" />
        </Grid2>
        <Field label="BAŞLIQ" value={theme.offer1Title} onChange={v => set('offer1Title', v)} placeholder="Biznes Nahar" />
        <Field label="TƏSVİR" value={theme.offer1Desc} onChange={v => set('offer1Desc', v)} type="textarea" />
        <Field label="QİYMƏT" value={theme.offer1Price} onChange={v => set('offer1Price', v)} placeholder="12.00 ₼" />

        <div style={{ fontSize: 11, color: LABEL_COLOR, letterSpacing: '0.05em', fontWeight: 600, marginTop: 4 }}>2-Cİ KART (Ailəvi Paket)</div>
        <Grid2>
          <Field label="ETİKET" value={theme.offer2Tag} onChange={v => set('offer2Tag', v)} placeholder="HƏFTƏSONU" />
          <Field label="LABEL" value={theme.offer2Label} onChange={v => set('offer2Label', v)} placeholder="4 Nəfərlik" />
        </Grid2>
        <Field label="BAŞLIQ" value={theme.offer2Title} onChange={v => set('offer2Title', v)} placeholder="Ailəvi Həftəsonu Paketi" />
        <Field label="TƏSVİR" value={theme.offer2Desc} onChange={v => set('offer2Desc', v)} type="textarea" />
        <Grid2>
          <Field label="QİYMƏT" value={theme.offer2Price} onChange={v => set('offer2Price', v)} placeholder="55.00 ₼" />
          <Field label="KÖHNƏ QİYMƏT" value={theme.offer2OldPrice} onChange={v => set('offer2OldPrice', v)} placeholder="72.00 ₼" />
        </Grid2>

        <div style={{ fontSize: 11, color: LABEL_COLOR, letterSpacing: '0.05em', fontWeight: 600, marginTop: 4 }}>3-CÜ KART (Ad Günü)</div>
        <Grid2>
          <Field label="ETİKET" value={theme.offer3Tag} onChange={v => set('offer3Tag', v)} placeholder="TƏNTƏNƏLİ GÜNLƏR" />
          <Field label="LABEL" value={theme.offer3Label} onChange={v => set('offer3Label', v)} placeholder="VIP Xidmət" />
        </Grid2>
        <Field label="BAŞLIQ" value={theme.offer3Title} onChange={v => set('offer3Title', v)} placeholder="Ad Günü & Özəl Günlər" />
        <Field label="TƏSVİR" value={theme.offer3Desc} onChange={v => set('offer3Desc', v)} type="textarea" />
      </CollapsiblePanel>

      {/* Reservation Module */}
      <CollapsiblePanel title="📅 Rezervasiya Bölməsi">
        <Field label="BADGE" value={theme.reservationBadgeText} onChange={v => set('reservationBadgeText', v)} placeholder="MASA REZERVASIYASI" />
        <Field label="BAŞLIQ" value={theme.reservationHeadline} onChange={v => set('reservationHeadline', v)} placeholder="Masanızı İndi Ayırın" />
        <Field label="ALT BAŞLIQ" value={theme.reservationSubtitle} onChange={v => set('reservationSubtitle', v)} type="textarea" placeholder="Rahat və sürətli..." />
      </CollapsiblePanel>

      {/* Contact Module */}
      <CollapsiblePanel title="📍 Əlaqə Bölməsi">
        <Field label="BADGE" value={theme.contactBadgeText} onChange={v => set('contactBadgeText', v)} placeholder="BİZİ ZİYARƏT EDİN" />
        <Field label="BAŞLIQ" value={theme.contactHeadline} onChange={v => set('contactHeadline', v)} placeholder="Ünvan və Əlaqə" />
        <Field label="ALT BAŞLIQ" value={theme.contactSubtitle} onChange={v => set('contactSubtitle', v)} type="textarea" placeholder="Bakının mərkəzində..." />
      </CollapsiblePanel>

      {/* Footer Module */}
      <CollapsiblePanel title="🦶 Footer Bölməsi">
        <Field label="TAGLİNE" value={theme.footerTagline} onChange={v => set('footerTagline', v)} type="textarea" placeholder="Ailəniz üçün ən sevimli məkan." />
        <Field label="COPYRİGHT MƏTNİ" value={theme.footerCopyrightText} onChange={v => set('footerCopyrightText', v)} placeholder="© 2025 Randevu Cafe..." />
        <Field label="PLATFORMA MƏTNİ" value={theme.footerPlatformText} onChange={v => set('footerPlatformText', v)} placeholder="Sayt SiteX platforması ilə..." />
      </CollapsiblePanel>
    </div>
  );
}
