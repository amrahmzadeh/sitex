'use client';

import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export function ComingSoon({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 60, textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(124,92,252,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Construction size={36} color="#7C5CFC" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0', marginBottom: 12 }}>{title}</h1>
        <p style={{ color: '#8888A0', fontSize: 15, lineHeight: 1.6 }}>
          {desc || 'Bu bölmə tezliklə hazır olacaq. Gözlədiyiniz üçün təşəkkür edirik.'}
        </p>
        <div style={{ marginTop: 24, padding: '12px 20px', background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)', borderRadius: 12, display: 'inline-block' }}>
          <p style={{ fontSize: 13, color: '#9B7FFF' }}>🚀 Faza 2-də gəlir</p>
        </div>
      </motion.div>
    </div>
  );
}

// Factory for simple placeholder pages
export function comingSoonPage(title: string, _icon: string, desc?: string) {
  return function Page() {
    return <ComingSoon title={title} desc={desc} />;
  };
}
