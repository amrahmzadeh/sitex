'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Download, Printer, Settings2, Palette,
  Check, Loader2, Globe, Table2, Layers, Eye, Package,
  FileText, Sparkles,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QRDesign {
  fgColor: string;
  bgColor: string;
  margin: number;
  size: number;
  logoUrl: string;
  logoSize: number;
  showRestaurantName: boolean;
  showTableNumber: boolean;
  customTitle: string;
  template: string;
}

interface OrgInfo {
  name: string;
  slug: string;
  siteCategory: string | null;
  siteSubcategory?: string | null;
}

interface TextLine {
  text: string;
  fontSize: number;
  fontWeight: string;
  opacity: number;
}

const DEFAULT_DESIGN: QRDesign = {
  fgColor: '#1A1A2E',
  bgColor: '#FFFFFF',
  margin: 16,
  size: 256,
  logoUrl: '',
  logoSize: 60,
  showRestaurantName: true,
  showTableNumber: true,
  customTitle: '',
  template: 'minimal',
};

const TEMPLATES: Record<string, Partial<QRDesign> & { label: string; desc: string }> = {
  minimal: { label: 'Minimal', desc: 'Təmiz ağ fon', fgColor: '#1A1A2E', bgColor: '#FFFFFF' },
  premium: { label: 'Premium', desc: 'Qızılı vurğu', fgColor: '#B8860B', bgColor: '#FFFFF8' },
  modern: { label: 'Modern', desc: 'Bənövşəyi', fgColor: '#00D37D', bgColor: '#F5F0FF' },
  dark: { label: 'Dark', desc: 'Qaranlıq fon', fgColor: '#E8E8F0', bgColor: '#0F0F14' },
  classic: { label: 'Classic', desc: 'Ənənəvi qəhvəyi', fgColor: '#2C1810', bgColor: '#FFF8F0' },
  branding: { label: 'Branding', desc: 'Canlı qırmızı', fgColor: '#CC0000', bgColor: '#FFFFFF' },
};


// Kateqoriya yoxlanışı: Yalnız Restoran və Hotel kateqoriyalarında masa funksiyaları göstərilir
function isTableCategory(category?: string | null, subcategory?: string | null): boolean {
  if (!category && !subcategory) return false;
  const cat = (category || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  return (
    cat.includes('restoran') ||
    cat.includes('kafe') ||
    cat.includes('qida') ||
    cat.includes('hotel') ||
    cat.includes('otel') ||
    sub.includes('restoran') ||
    sub.includes('kafe') ||
    sub.includes('qida') ||
    sub.includes('hotel') ||
    sub.includes('otel') ||
    sub.includes('qonaq')
  );
}

// ─── Helper: Compute Text Lines Under QR ─────────────────────────────────────
function getTextLines(design: QRDesign, restaurantName?: string, tableNumber?: string): TextLine[] {
  const lines: TextLine[] = [];
  if (design.customTitle && design.customTitle.trim()) {
    lines.push({
      text: design.customTitle.trim(),
      fontSize: 14,
      fontWeight: 'bold',
      opacity: 1,
    });
  }
  if (design.showRestaurantName && restaurantName && restaurantName.trim()) {
    lines.push({
      text: restaurantName.trim(),
      fontSize: 13,
      fontWeight: '600',
      opacity: 0.92,
    });
  }
  if (design.showTableNumber && tableNumber && tableNumber.trim()) {
    lines.push({
      text: `Masa ${tableNumber.trim()}`,
      fontSize: 12,
      fontWeight: 'bold',
      opacity: 0.85,
    });
  }
  return lines;
}

// ─── Helper: Generate High-Res Canvas ─────────────────────────────────────────
async function generateQRCodeCanvas({
  url,
  design,
  restaurantName,
  tableNumber,
  scale = 1,
}: {
  url: string;
  design: QRDesign;
  restaurantName?: string;
  tableNumber?: string;
  scale?: number;
}): Promise<HTMLCanvasElement> {
  const QRCode = (await import('qrcode')).default;
  const size = (design.size || 256) * scale;
  const margin = (design.margin || 16) * scale;
  const totalW = size + margin * 2;
  const lines = getTextLines(design, restaurantName, tableNumber);
  const textH = lines.length > 0 ? (lines.length * 24 + 16) * scale : 0;
  const totalH = totalW + textH;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = design.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // QR Code
  const tempCanvas = document.createElement('canvas');
  await QRCode.toCanvas(tempCanvas, url, {
    width: size,
    margin: 0,
    color: { dark: design.fgColor, light: design.bgColor },
    errorCorrectionLevel: design.logoUrl ? 'H' : 'M',
  });
  ctx.drawImage(tempCanvas, margin, margin, size, size);

  // Logo with strict aspect ratio preservation (no stretching/distorting)
  if (design.logoUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const naturalW = img.naturalWidth || 1;
        const naturalH = img.naturalHeight || 1;
        const aspect = naturalW / naturalH;
        const maxLs = (design.logoSize || 60) * scale;
        let drawW = maxLs;
        let drawH = maxLs;
        if (aspect > 1) {
          drawH = maxLs / aspect;
        } else {
          drawW = maxLs * aspect;
        }
        const lx = margin + (size - drawW) / 2;
        const ly = margin + (size - drawH) / 2;
        const pad = Math.max(3, Math.round(5 * scale));

        ctx.fillStyle = design.bgColor;
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(lx - pad, ly - pad, drawW + pad * 2, drawH + pad * 2, Math.round(6 * scale));
          ctx.fill();
        } else {
          ctx.fillRect(lx - pad, ly - pad, drawW + pad * 2, drawH + pad * 2);
        }
        ctx.drawImage(img, lx, ly, drawW, drawH);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = design.logoUrl;
    });
  }

  // Texts
  if (lines.length > 0) {
    let curY = margin * 2 + size + 14 * scale;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((l) => {
      ctx.font = `${l.fontWeight} ${Math.round(l.fontSize * scale)}px Inter, -apple-system, sans-serif`;
      ctx.fillStyle = design.fgColor;
      ctx.globalAlpha = l.opacity;
      ctx.fillText(l.text, totalW / 2, curY);
      curY += Math.round(24 * scale);
    });
    ctx.globalAlpha = 1.0;
  }

  return canvas;
}

// ─── Helper: Generate Pure Vector SVG ─────────────────────────────────────────
async function generateQRCodeSvg({
  url,
  design,
  restaurantName,
  tableNumber,
}: {
  url: string;
  design: QRDesign;
  restaurantName?: string;
  tableNumber?: string;
}): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  const rawSvg = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    color: { dark: design.fgColor, light: design.bgColor },
    errorCorrectionLevel: design.logoUrl ? 'H' : 'M',
  });

  const vbMatch = rawSvg.match(/viewBox="([^"]+)"/);
  const vb = vbMatch ? vbMatch[1] : '0 0 33 33';
  const innerMatch = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const inner = innerMatch ? innerMatch[1] : rawSvg;

  const size = design.size || 256;
  const margin = design.margin || 16;
  const totalW = size + margin * 2;
  const lines = getTextLines(design, restaurantName, tableNumber);
  const textH = lines.length > 0 ? lines.length * 24 + 16 : 0;
  const totalH = totalW + textH;

  let logoSvg = '';
  if (design.logoUrl) {
    let aspect = 1;
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            aspect = img.naturalWidth / img.naturalHeight;
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = design.logoUrl;
      });
    } catch { /* ignore */ }

    const maxLs = design.logoSize || 60;
    let drawW = maxLs;
    let drawH = maxLs;
    if (aspect > 1) {
      drawH = maxLs / aspect;
    } else {
      drawW = maxLs * aspect;
    }
    const lx = margin + (size - drawW) / 2;
    const ly = margin + (size - drawH) / 2;
    const pad = 5;

    logoSvg = `
    <rect x="${lx - pad}" y="${ly - pad}" width="${drawW + pad * 2}" height="${drawH + pad * 2}" rx="6" fill="${design.bgColor}"/>
    <image href="${design.logoUrl}" x="${lx}" y="${ly}" width="${drawW}" height="${drawH}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const textSvg = lines.map((l, i) => {
    const y = size + margin * 2 + 14 + i * 24;
    const safeText = l.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `<text x="${totalW / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, -apple-system, sans-serif" font-size="${l.fontSize}" font-weight="${l.fontWeight}" fill="${design.fgColor}" opacity="${l.opacity}">${safeText}</text>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
  <rect width="100%" height="100%" fill="${design.bgColor}"/>
  <g transform="translate(${margin}, ${margin})">
    <svg width="${size}" height="${size}" viewBox="${vb}" shape-rendering="crispEdges">
      ${inner}
    </svg>
  </g>
  ${logoSvg}
  ${textSvg}
</svg>`;
}

// ─── Download Helpers ─────────────────────────────────────────────────────────
async function downloadHighResPNG({
  url,
  design,
  restaurantName,
  tableNumber,
  filename,
}: {
  url: string;
  design: QRDesign;
  restaurantName?: string;
  tableNumber?: string;
  filename: string;
}) {
  // Scale = 5 generates ~1500-2000px high-resolution image (300+ DPI)
  const canvas = await generateQRCodeCanvas({
    url,
    design,
    restaurantName,
    tableNumber,
    scale: 5,
  });
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function downloadSVG({
  url,
  design,
  restaurantName,
  tableNumber,
  filename,
}: {
  url: string;
  design: QRDesign;
  restaurantName?: string;
  tableNumber?: string;
  filename: string;
}) {
  const svg = await generateQRCodeSvg({
    url,
    design,
    restaurantName,
    tableNumber,
  });
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = objectUrl;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

// ─── Hook: Current Org ────────────────────────────────────────────────────────
function useCurrentOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);

  useEffect(() => {
    const load = (id: string) => {
      setOrgId(id);
      fetch(`/api/organizations/${id}`)
        .then(r => r.json())
        .then(d => {
          if (d.organization) {
            setOrgInfo({ name: d.organization.name, slug: d.organization.slug, siteCategory: d.organization.siteCategory ?? null, siteSubcategory: d.organization.siteSubcategory ?? null });
          }
        })
        .catch(() => {});
    };
    const saved = localStorage.getItem('currentOrgId');
    if (saved) { load(saved); return; }
    fetch('/api/organizations')
      .then(r => r.json())
      .then(d => {
        if (d.organizations?.[0]) {
          const id = d.organizations[0].id;
          localStorage.setItem('currentOrgId', id);
          load(id);
        }
      })
      .catch(() => {});
  }, []);

  return { orgId, orgInfo };
}

// ─── QR Canvas Renderer (On-Screen Preview) ───────────────────────────────────
function QRCanvas({
  url,
  design,
  restaurantName,
  tableNumber,
}: {
  url: string;
  design: QRDesign;
  restaurantName?: string;
  tableNumber?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  const render = useCallback(async () => {
    if (!url || !canvasRef.current) return;
    try {
      // Scale 2 for sharp on-screen rendering on Retina displays
      const c = await generateQRCodeCanvas({
        url,
        design,
        restaurantName,
        tableNumber,
        scale: 2,
      });
      const target = canvasRef.current;
      if (!target) return;
      target.width = c.width;
      target.height = c.height;
      const ctx = target.getContext('2d')!;
      ctx.drawImage(c, 0, 0);
      setRendered(true);
    } catch (e) {
      console.error('QR render error:', e);
    }
  }, [url, design, restaurantName, tableNumber]);

  useEffect(() => {
    setRendered(false);
    const t = setTimeout(render, 120);
    return () => clearTimeout(t);
  }, [render]);

  return (
    <div style={{ position: 'relative', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!rendered && <Loader2 size={20} color="#00D37D" style={{ position: 'absolute', animation: 'spin 1s linear infinite' }} />}
      <canvas
        ref={canvasRef}
        style={{
          display: rendered ? 'block' : 'none',
          maxWidth: '100%',
          width: design.size,
          height: 'auto',
          borderRadius: 8,
        }}
      />
    </div>
  );
}

// ─── QR Card Component ────────────────────────────────────────────────────────
function QRCard({
  url,
  design,
  label,
  restaurantName,
  tableNumber,
}: {
  url: string;
  design: QRDesign;
  label: string;
  restaurantName?: string;
  tableNumber?: string;
}) {
  const [downloading, setDownloading] = useState<'png' | 'svg' | null>(null);

  const handlePng = async () => {
    setDownloading('png');
    try {
      await downloadHighResPNG({
        url,
        design,
        restaurantName,
        tableNumber,
        filename: label.replace(/\s+/g, '_'),
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleSvg = async () => {
    setDownloading('svg');
    try {
      await downloadSVG({
        url,
        design,
        restaurantName,
        tableNumber,
        filename: label.replace(/\s+/g, '_'),
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="dash-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ background: design.bgColor, borderRadius: 10, padding: 8, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <QRCanvas
          url={url}
          design={design}
          restaurantName={restaurantName}
          tableNumber={tableNumber}
        />
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', textAlign: 'center' }}>{label}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
        <button
          className="dash-btn-secondary"
          style={{ fontSize: 11, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
          onClick={handlePng}
          disabled={downloading !== null}
          title="Yüksək keyfiyyətli HD PNG (300+ DPI)"
        >
          {downloading === 'png' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={12} />} PNG HD
        </button>
        <button
          className="dash-btn-secondary"
          style={{ fontSize: 11, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', borderColor: 'rgba(0,211,125,0.4)', color: '#00D37D' }}
          onClick={handleSvg}
          disabled={downloading !== null}
          title="Limitsiz miqyaslanan Vektor SVG formatı"
        >
          {downloading === 'svg' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />} SVG Vektor
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QRPage() {
  const { orgId, orgInfo } = useCurrentOrg();
  const [tableCount, setTableCount] = useState(10);
  const [design, setDesign] = useState<QRDesign>(DEFAULT_DESIGN);
  const [activeTab, setActiveTab] = useState<'general' | 'tables' | 'design' | 'manage' | 'site'>('general');
  const [previewMode, setPreviewMode] = useState<'general' | 'table'>('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<{ countryCode: string; phoneNumber: string } | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const generalUrl = orgInfo ? `${baseUrl}/site/${orgInfo.slug}` : '';
  const tableUrl = (num: number) =>
    orgInfo ? `${baseUrl}/site/${orgInfo.slug}?table=${String(num).padStart(2, '0')}` : '';

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      fetch(`/api/organizations/${orgId}/qr`).then(r => r.json()),
      fetch(`/api/organizations/${orgId}/whatsapp`).then(r => r.json()),
    ]).then(([qrData, waData]) => {
      if (qrData.qrSettings) {
        setTableCount(qrData.qrSettings.tableCount ?? 10);
        try {
          const d = JSON.parse(qrData.qrSettings.designConfig || '{}');
          if (Object.keys(d).length > 0) setDesign(prev => ({ ...prev, ...d }));
        } catch { /* ignore */ }
      }
      if (waData.settings) {
        setWhatsapp({ countryCode: waData.settings.countryCode, phoneNumber: waData.settings.phoneNumber });
      }
    }).finally(() => setLoading(false));
  }, [orgId]);

  // Reset tab when category becomes known — non-restaurant shouldn't land on restaurant-only tabs
  useEffect(() => {
    if (!orgInfo) return;
    const isTable = isTableCategory(orgInfo.siteCategory, orgInfo.siteSubcategory);
    if (!isTable && (activeTab === 'general' || activeTab === 'tables' || activeTab === 'manage')) {
      setActiveTab('site');
    }
    if (isTable && activeTab === 'site') {
      setActiveTab('general');
    }
  }, [orgInfo?.siteCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const setD = <K extends keyof QRDesign>(k: K, v: QRDesign[K]) =>
    setDesign(prev => ({ ...prev, [k]: v }));

  const applyTemplate = (key: string) => {
    const tpl = TEMPLATES[key];
    if (!tpl) return;
    setDesign(prev => ({ ...prev, template: key, fgColor: tpl.fgColor ?? prev.fgColor, bgColor: tpl.bgColor ?? prev.bgColor }));
  };

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/qr`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableCount, designConfig: design }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  };

  // Toplu PNG Yüklə (High-Res)
  const downloadAllPng = async () => {
    if (!orgInfo) return;
    setIsExporting('png-all');
    try {
      for (let i = 1; i <= tableCount; i++) {
        const num = String(i).padStart(2, '0');
        await downloadHighResPNG({
          url: tableUrl(i),
          design,
          restaurantName: orgInfo.name,
          tableNumber: num,
          filename: `Masa_${num}`,
        });
        await new Promise(r => setTimeout(r, 200));
      }
    } finally {
      setIsExporting(null);
    }
  };

  // Toplu SVG Yüklə (Pure Vector)
  const downloadAllSvg = async () => {
    if (!orgInfo) return;
    setIsExporting('svg-all');
    try {
      for (let i = 1; i <= tableCount; i++) {
        const num = String(i).padStart(2, '0');
        await downloadSVG({
          url: tableUrl(i),
          design,
          restaurantName: orgInfo.name,
          tableNumber: num,
          filename: `Masa_${num}`,
        });
        await new Promise(r => setTimeout(r, 150));
      }
    } finally {
      setIsExporting(null);
    }
  };

  // PDF İxracı (A4 Formatında Yüksək Keyfiyyətli Çap Sənədi)
  const downloadPdfAll = async () => {
    if (!orgInfo) return;
    setIsExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const items = [
        { url: generalUrl, tableNumber: undefined, label: 'Ümumi Sayt QR' },
        ...Array.from({ length: tableCount }, (_, i) => ({
          url: tableUrl(i + 1),
          tableNumber: String(i + 1).padStart(2, '0'),
          label: `Masa ${String(i + 1).padStart(2, '0')}`,
        })),
      ];

      // 2 columns x 3 rows = 6 items per page
      const cols = 2;
      const rows = 3;
      const perPage = cols * rows;
      const marginX = 18;
      const marginY = 16;
      const cellW = 82;
      const cellH = 82;
      const gapX = 10;
      const gapY = 8;

      for (let i = 0; i < items.length; i++) {
        if (i > 0 && i % perPage === 0) {
          pdf.addPage();
        }
        const pageIndex = i % perPage;
        const col = pageIndex % cols;
        const row = Math.floor(pageIndex / cols);
        const x = marginX + col * (cellW + gapX);
        const y = marginY + row * (cellH + gapY);

        // Ultra high resolution canvas (scale 5 for >700 DPI inside PDF)
        const canvas = await generateQRCodeCanvas({
          url: items[i].url,
          design,
          restaurantName: orgInfo.name,
          tableNumber: items[i].tableNumber,
          scale: 5,
        });
        const imgData = canvas.toDataURL('image/png');

        // Draw cut border
        pdf.setDrawColor(215, 215, 225);
        pdf.setLineDashPattern([2, 2], 0);
        pdf.roundedRect(x, y, cellW, cellH, 3, 3, 'S');

        // Insert high resolution QR
        const pad = 3;
        pdf.addImage(imgData, 'PNG', x + pad, y + pad, cellW - pad * 2, cellH - pad * 2);
      }

      pdf.save(`${orgInfo.name.replace(/\s+/g, '_')}_QR_Kodlar.pdf`);
    } finally {
      setIsExporting(null);
    }
  };

  // Pure Vector Print (A4 Vektor Çap Pəncərəsi)
  const printAll = async () => {
    if (!orgInfo) return;
    setIsExporting('print');
    try {
      const items = [
        { url: generalUrl, tableNumber: undefined, label: `${orgInfo.name} — Ümumi QR` },
        ...Array.from({ length: tableCount }, (_, i) => ({
          url: tableUrl(i + 1),
          tableNumber: String(i + 1).padStart(2, '0'),
          label: `Masa ${String(i + 1).padStart(2, '0')}`,
        })),
      ];

      // Generate pure vector SVGs for lossless vector print
      const svgs = await Promise.all(
        items.map(item => generateQRCodeSvg({
          url: item.url,
          design,
          restaurantName: orgInfo.name,
          tableNumber: item.tableNumber,
        }))
      );

      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><title>QR — ${orgInfo.name}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: Inter, -apple-system, sans-serif; background: #fff; margin: 0; padding: 0; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12mm 8mm; padding: 6mm; }
          .card { display: flex; flex-direction: column; align-items: center; justify-content: center; page-break-inside: avoid; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 4mm; box-sizing: border-box; }
          .card svg { width: 100%; max-width: 54mm; height: auto; }
          @media print {
            body { padding: 0; }
            .grid { padding: 0; }
            .card { border: 1px dashed #94a3b8; }
          }
        </style></head><body>
        <div class="grid">${svgs.map(s => `<div class="card">${s}</div>`).join('')}</div>
        <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 350); };<\/script>
      </body></html>`);
      win.document.close();
    } finally {
      setIsExporting(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'grid', gap: 16 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}
    </div>
  );

  const isTableSupported = isTableCategory(orgInfo?.siteCategory, orgInfo?.siteSubcategory);

  const tabs = isTableSupported
    ? [
        { id: 'general' as const, label: 'Ümumi QR', icon: Globe },
        { id: 'tables' as const, label: 'Masa QR-ları', icon: Table2 },
        { id: 'design' as const, label: 'Dizayn', icon: Palette },
        { id: 'manage' as const, label: 'İdarə et', icon: Layers },
      ]
    : [
        { id: 'site' as const, label: 'Sayt QR', icon: Globe },
        { id: 'design' as const, label: 'Dizayn', icon: Palette },
      ];

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <QrCode size={28} color="#00D37D" /> QR Yaradıcı
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>
          {isTableSupported
            ? 'Sayt və masa QR kodlarını HD və Vektor formatlarda yaradın, fərdiləşdirin və idarə edin'
            : 'Saytınız üçün QR kodu HD və Vektor formatlarda yaradın və fərdiləşdirin'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#1A1A24', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1, minWidth: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeTab === id ? '#00D37D' : 'transparent',
              color: activeTab === id ? '#fff' : '#8888A0', transition: 'all 0.15s',
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── GENERAL ── */}
      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: 20 }}>
          <div className="dash-card" style={{ padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 8 }}>Ümumi Sayt QR Kodu</h2>
                <p style={{ fontSize: 13, color: '#8888A0', marginBottom: 16, lineHeight: 1.6 }}>
                  Bu QR kodu saytın əsas səhifəsinə yönləndirir. Giriş lövhələrinə, stendlərə və ya reklam materiallarına yerləşdirilə bilər.
                </p>
                {generalUrl && (
                  <div style={{ background: '#0F0F14', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: '#8888A0', marginBottom: 3 }}>🔗 QR URL:</p>
                    <p style={{ fontSize: 12, color: '#00D37D', wordBreak: 'break-all' }}>{generalUrl}</p>
                  </div>
                )}
                {whatsapp && (
                  <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                    <p style={{ fontSize: 12, color: '#34D399' }}>
                      📱 WhatsApp: <strong>{whatsapp.countryCode}{whatsapp.phoneNumber}</strong> — sifarişlər birbaşa bu nömrəyə ötürülür
                    </p>
                  </div>
                )}
              </div>
              <div>
                {generalUrl && orgInfo && (
                  <QRCard
                    url={generalUrl}
                    design={design}
                    label={orgInfo.name}
                    restaurantName={orgInfo.name}
                    tableNumber={undefined}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="dash-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 12 }}>💡 WhatsApp Masa Sifariş Sistemi</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { step: '1', text: 'Müştəri masa QR-ı skan edir' },
                { step: '2', text: 'Menyu masa nömrəsi ilə açılır' },
                { step: '3', text: 'Məhsullar səbətə əlavə edilir' },
                { step: '4', text: 'Masa nömrəli sifariş WhatsApp-a gedir' },
              ].map(({ step, text }) => (
                <div key={step} style={{ background: '#0F0F14', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#00D37D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{step}</div>
                  <p style={{ fontSize: 12, color: '#E8E8F0' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TABLES ── */}
      {activeTab === 'tables' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: 20 }}>
          <div className="dash-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E8E8F0' }}>Masa QR Kodları</h2>
                <p style={{ fontSize: 13, color: '#8888A0', marginTop: 2 }}>
                  Hər masa fərdi link alır: <code style={{ color: '#00D37D', fontSize: 11 }}>/site/{orgInfo?.slug}?table=01</code>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="dash-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Masa sayı:</label>
                <input
                  type="number" className="dash-input" value={tableCount} min={1} max={100}
                  onChange={e => setTableCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  style={{ width: 80 }}
                />
              </div>
            </div>

            {/* Export Toolbar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={downloadAllPng}
                disabled={isExporting !== null}
              >
                {isExporting === 'png-all' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Package size={16} />}
                Hamısını Yüklə (PNG HD)
              </button>
              <button
                className="dash-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: 'rgba(0,211,125,0.4)', color: '#00D37D' }}
                onClick={downloadAllSvg}
                disabled={isExporting !== null}
              >
                {isExporting === 'svg-all' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                Hamısını Yüklə (SVG Vektor)
              </button>
              <button
                className="dash-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={downloadPdfAll}
                disabled={isExporting !== null}
              >
                {isExporting === 'pdf' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={16} />}
                PDF Yüklə (A4 Format)
              </button>
              <button
                className="dash-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={printAll}
                disabled={isExporting !== null}
              >
                {isExporting === 'print' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Printer size={16} />}
                Çap et (Vektor Print)
              </button>
              <button
                className="dash-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={save}
              >
                <Settings2 size={16} /> Masa sayını saxla
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {Array.from({ length: tableCount }, (_, i) => {
              const num = String(i + 1).padStart(2, '0');
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                >
                  <QRCard
                    url={tableUrl(i + 1)}
                    design={design}
                    label={`Masa ${num}`}
                    restaurantName={orgInfo?.name}
                    tableNumber={num}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── DESIGN ── */}
      {activeTab === 'design' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            {/* Controls */}
            <div style={{ display: 'grid', gap: 16 }}>
              {/* Templates */}
              <div className="dash-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>🎨 Hazır Dizayn Şablonları</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {Object.entries(TEMPLATES).map(([key, tpl]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      style={{
                        padding: '10px 8px', borderRadius: 10,
                        border: `2px solid ${design.template === key ? '#00D37D' : '#2A2A3A'}`,
                        background: design.template === key ? 'rgba(0,211,125,0.1)' : '#0F0F14',
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 3, background: tpl.fgColor }} />
                        <div style={{ width: 16, height: 16, borderRadius: 3, background: tpl.bgColor, border: '1px solid #2A2A3A' }} />
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: design.template === key ? '#00D37D' : '#E8E8F0' }}>{tpl.label}</p>
                      <p style={{ fontSize: 10, color: '#8888A0' }}>{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="dash-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>Rənglər</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {([['fgColor', 'QR kodu rəngi'], ['bgColor', 'Fon rəngi']] as [keyof QRDesign, string][]).map(([k, lbl]) => (
                    <div key={k}>
                      <label className="dash-label">{lbl}</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={design[k] as string} onChange={e => setD(k, e.target.value)}
                          style={{ width: 40, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0, background: 'none' }} />
                        <input className="dash-input" value={design[k] as string} onChange={e => setD(k, e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size & Margin */}
              <div className="dash-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>Ölçü və Kənarlar</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="dash-label">QR ölçüsü: {design.size}px</label>
                    <input type="range" min={160} max={400} step={10} value={design.size}
                      onChange={e => setD('size', Number(e.target.value))} style={{ width: '100%', accentColor: '#00D37D' }} />
                  </div>
                  <div>
                    <label className="dash-label">Kənar boşluq: {design.margin}px</label>
                    <input type="range" min={4} max={40} step={2} value={design.margin}
                      onChange={e => setD('margin', Number(e.target.value))} style={{ width: '100%', accentColor: '#00D37D' }} />
                  </div>
                </div>
              </div>

              {/* Logo with strict aspect ratio */}
              <div className="dash-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>QR Mərkəzi Loqo</h3>
                <div>
                  <label className="dash-label">Loqo URL</label>
                  <input className="dash-input" value={design.logoUrl} onChange={e => setD('logoUrl', e.target.value)} placeholder="https://..." style={{ marginBottom: design.logoUrl ? 12 : 0 }} />
                </div>
                {design.logoUrl && (
                  <div>
                    <label className="dash-label">Loqo maksimum ölçüsü: {design.logoSize}px</label>
                    <input type="range" min={24} max={110} step={4} value={design.logoSize}
                      onChange={e => setD('logoSize', Number(e.target.value))} style={{ width: '100%', accentColor: '#00D37D' }} />
                    <p style={{ fontSize: 11, color: '#8888A0', marginTop: 4 }}>
                      ✓ Loqo təhrif olunmadan (dartılma və sıxılma olmadan) orijinal proporsiyasını tam saxlayır.
                    </p>
                  </div>
                )}
              </div>

              {/* Labels & Titles (Fix for Problem 4) */}
              <div className="dash-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>Mətn və Başlıqlar</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={design.showRestaurantName}
                      onChange={e => setD('showRestaurantName', e.target.checked)}
                      style={{ accentColor: '#00D37D', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 13, color: '#E8E8F0' }}>Sayt adını göstər ({orgInfo?.name || 'Sayt'})</span>
                  </label>

                  {isTableSupported && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={design.showTableNumber}
                        onChange={e => setD('showTableNumber', e.target.checked)}
                        style={{ accentColor: '#00D37D', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, color: '#E8E8F0' }}>Masa nömrəsini göstər (məsələn: Masa 01)</span>
                    </label>
                  )}

                  <div>
                    <label className="dash-label">Fərdi başlıq (əlavə şüar / başlıq)</label>
                    <input
                      className="dash-input"
                      value={design.customTitle}
                      onChange={e => setD('customTitle', e.target.value)}
                      placeholder="Məsələn: QR Kod Skanlayın"
                    />
                    <p style={{ fontSize: 11, color: '#8888A0', marginTop: 4 }}>
                      Fərdi başlıq daxil edildikdə digər yazılar (sayt adı və masa nömrəsi) itmir, ardıcıl olaraq göstərilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div style={{ position: 'sticky', top: 20 }}>
              <div className="dash-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Eye size={14} color="#00D37D" /> Canlı Önizləmə
                  </h3>
                  {/* Toggle Preview Mode */}
                  {isTableSupported && (
                    <div style={{ display: 'flex', background: '#0F0F14', borderRadius: 6, padding: 2 }}>
                      <button
                        onClick={() => setPreviewMode('general')}
                        style={{
                          border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                          background: previewMode === 'general' ? '#00D37D' : 'transparent',
                          color: previewMode === 'general' ? '#fff' : '#8888A0',
                        }}
                      >
                        Ümumi
                      </button>
                      <button
                        onClick={() => setPreviewMode('table')}
                        style={{
                          border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                          background: previewMode === 'table' ? '#00D37D' : 'transparent',
                          color: previewMode === 'table' ? '#fff' : '#8888A0',
                        }}
                      >
                        Masa 01
                      </button>
                    </div>
                  )}
                </div>

                {orgInfo && (
                  <QRCard
                    url={previewMode === 'general' ? generalUrl : tableUrl(1)}
                    design={design}
                    label={previewMode === 'general' ? orgInfo.name : 'Masa 01'}
                    restaurantName={orgInfo.name}
                    tableNumber={isTableSupported && previewMode === 'table' ? '01' : undefined}
                  />
                )}

                <button
                  onClick={save} disabled={saving} className="dash-btn-primary"
                  style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={16} /> : <Settings2 size={16} />}
                  {saved ? 'Dizayn Saxlanıldı!' : 'Dizaynı saxla'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MANAGE ── */}
      {activeTab === 'manage' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: 16 }}>
          <div className="dash-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E8E8F0', marginBottom: 20 }}>QR Kodların Siyahısı</h2>

            {/* General */}
            <ManageRow
              icon={<Globe size={16} color="#00D37D" />}
              iconBg="rgba(0,211,125,0.15)"
              title="Ümumi Sayt QR"
              url={generalUrl}
              onView={() => setActiveTab('general')}
              onDownloadPNG={() => downloadHighResPNG({
                url: generalUrl,
                design,
                restaurantName: orgInfo?.name,
                filename: `${orgInfo?.name ?? 'sayt'}_QR`,
              })}
              onDownloadSVG={() => downloadSVG({
                url: generalUrl,
                design,
                restaurantName: orgInfo?.name,
                filename: `${orgInfo?.name ?? 'sayt'}_QR`,
              })}
            />

            {Array.from({ length: tableCount }, (_, i) => {
              const num = String(i + 1).padStart(2, '0');
              const url = tableUrl(i + 1);
              return (
                <ManageRow
                  key={i}
                  icon={<Table2 size={16} color="#34D399" />}
                  iconBg="rgba(52,211,153,0.12)"
                  title={`Masa ${num}`}
                  url={url}
                  onView={() => setActiveTab('tables')}
                  onDownloadPNG={() => downloadHighResPNG({
                    url,
                    design,
                    restaurantName: orgInfo?.name,
                    tableNumber: num,
                    filename: `Masa_${num}`,
                  })}
                  onDownloadSVG={() => downloadSVG({
                    url,
                    design,
                    restaurantName: orgInfo?.name,
                    tableNumber: num,
                    filename: `Masa_${num}`,
                  })}
                />
              );
            })}
          </div>

          <div className="dash-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 8 }}>Ayarları Saxla</h3>
            <p style={{ fontSize: 13, color: '#8888A0', marginBottom: 14 }}>
              Masa sayı ({tableCount}) və tənzimlənmiş dizayn parametrlərini yadda saxlayın.
            </p>
            <button onClick={save} disabled={saving} className="dash-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={16} /> : <Settings2 size={16} />}
              {saved ? 'Yadda saxlandı!' : 'Ayarları saxla'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── SITE QR (non-restaurant) ── */}
      {activeTab === 'site' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: 20 }}>
          <div className="dash-card" style={{ padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 8 }}>Sayt üçün QR Kod yarat</h2>
                <p style={{ fontSize: 13, color: '#8888A0', marginBottom: 16, lineHeight: 1.6 }}>
                  Bu QR kodu saytınızın əsas səhifəsinə yönləndirir. Vizit kartlarına, reklam materiallarına və ya bütün nəşr materiallarına əlavə edilə bilər.
                </p>
                {generalUrl && (
                  <div style={{ background: '#0F0F14', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: '#8888A0', marginBottom: 3 }}>🔗 Sayt URL:</p>
                    <p style={{ fontSize: 12, color: '#00D37D', wordBreak: 'break-all' }}>{generalUrl}</p>
                  </div>
                )}
              </div>
              <div>
                {generalUrl && orgInfo && (
                  <QRCard
                    url={generalUrl}
                    design={design}
                    label={orgInfo.name}
                    restaurantName={undefined}
                    tableNumber={undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Manage Row Component ─────────────────────────────────────────────────────
function ManageRow({
  icon,
  iconBg,
  title,
  url,
  onView,
  onDownloadPNG,
  onDownloadSVG,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  url: string;
  onView: () => void;
  onDownloadPNG: () => void;
  onDownloadSVG: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #2A2A3A' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0' }}>{title}</p>
        <p style={{ fontSize: 11, color: '#8888A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</p>
      </div>
      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(52,211,153,0.15)', color: '#34D399', flexShrink: 0 }}>Aktiv</span>
      <button className="dash-btn-secondary" style={{ fontSize: 11, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={onView}>
        <Eye size={12} /> Bax
      </button>
      <button className="dash-btn-secondary" style={{ fontSize: 11, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={onDownloadPNG} title="Yüksək keyfiyyətli HD PNG">
        <Download size={12} /> PNG HD
      </button>
      <button className="dash-btn-secondary" style={{ fontSize: 11, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, borderColor: 'rgba(0,211,125,0.4)', color: '#00D37D' }} onClick={onDownloadSVG} title="Limitsiz Vektor SVG">
        <Sparkles size={12} /> SVG
      </button>
    </div>
  );
}
