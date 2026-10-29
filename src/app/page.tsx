'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Globe,
  Palette,
  Smartphone,
  MessageCircle,
  Layout,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: Palette,
    title: 'Professional temalar',
    desc: 'Hazır temalardan istədiyinizi seçin, rəngləri və şriftləri saniyələr içində fərdiləşdirin.',
  },
  {
    icon: Layout,
    title: 'Kataloq və xidmətlər',
    desc: 'Kateqoriyalar, məhsullar, qiymətlər və xidmətlər — hər şeyi asanlıqla idarə edin.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp sifariş və əlaqə',
    desc: 'Müştəriləriniz birbaşa WhatsApp ilə sürətli sifariş verə və əlaqə saxlaya bilər.',
  },
  {
    icon: Smartphone,
    title: 'Responsive dizayn',
    desc: 'Bütün mobil telefon, planşet və masaüstü ekranlarda qüsursuz görünüş.',
  },
  {
    icon: Globe,
    title: 'Öz domeniniz',
    desc: 'Müəssisənizin və brendinizin adı ilə fərdi veb ünvan.',
  },
  {
    icon: Shield,
    title: 'Təhlükəsiz platforma',
    desc: 'Verilənləriniz ən yüksək təhlükəsizlik standartları ilə qorunur.',
  },
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F0F14 0%, #1A1030 50%, #0F0F14 100%)',
        color: '#E8E8F0',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#fff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={28} color="#7C5CFC" />
          SiteX
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          {session ? (
            <Link
              href="/dashboard"
              className="dash-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              Panel <ArrowRight size={16} style={{ marginLeft: 4 }} />
            </Link>
          ) : (
            <>
              <Link
                href="/giris"
                className="dash-btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                Daxil ol
              </Link>
              <Link
                href="/qeydiyyat"
                className="dash-btn-primary"
                style={{ textDecoration: 'none' }}
              >
                Başla
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '80px 40px 60px',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(124, 92, 252, 0.15)',
              border: '1px solid rgba(124, 92, 252, 0.3)',
              borderRadius: 100,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: '#9B7FFF',
              marginBottom: 24,
            }}
          >
            <Sparkles size={14} />
            Professional veb saytınızı dəqiqələrdə qurun
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              background: 'linear-gradient(135deg, #fff 0%, #9B7FFF 50%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Müəssisəniz üçün
            <br />
            müasir veb sayt
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: '#8888A0',
              maxWidth: 600,
              margin: '0 auto 40px',
            }}
          >
            Kod yazmadan, hazır müasir temalarla xidmətlərinizi, kataloqunuzu, əlaqə
            məlumatlarınızı və sifarişləri idarə edin. WhatsApp inteqrasiyası ilə
            müştərilərinizə yaxın olun.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/qeydiyyat"
              className="dash-btn-primary"
              style={{
                textDecoration: 'none',
                fontSize: 16,
                padding: '14px 32px',
              }}
            >
              <Zap size={18} style={{ marginRight: 8 }} />
              Pulsuz başla
            </Link>
            <Link
              href="#features"
              className="dash-btn-secondary"
              style={{ textDecoration: 'none', fontSize: 16, padding: '14px 32px' }}
            >
              Xüsusiyyətlər
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '60px 40px 100px',
        }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 60,
          }}
        >
          Niyə SiteX?
        </motion.h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="dash-card"
              style={{ padding: 32 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(124, 92, 252, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <f.icon size={24} color="#7C5CFC" />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: '#8888A0', lineHeight: 1.6, fontSize: 14 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #2A2A3A',
          padding: '32px 40px',
          textAlign: 'center',
          color: '#8888A0',
          fontSize: 14,
        }}
      >
        © {new Date().getFullYear()} SiteX. Bütün hüquqlar qorunur.
      </footer>
    </div>
  );
}
