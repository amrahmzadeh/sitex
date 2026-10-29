'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Auto-login after register
      const result = await signIn('credentials', {
        email: form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Qeydiyyat zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#231F20',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#231F20',
          borderRadius: 20,
          border: '1px solid #383334',
          padding: 40,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, textDecoration: 'none' }}>
          <img src="/logo.png" alt="SiteX" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#E8E8F0' }}>
          Hesab yaradın
        </h1>
        <p style={{ textAlign: 'center', color: '#8888A0', fontSize: 14, marginBottom: 32 }}>
          Pulsuz başlayın, nə vaxt istəsəniz yüksəldin
        </p>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'Ad Soyad', type: 'text', placeholder: 'Adınız', Icon: User },
            { key: 'email', label: 'E-poçt', type: 'email', placeholder: 'sizin@email.com', Icon: Mail },
            { key: 'password', label: 'Şifrə', type: 'password', placeholder: '••••••', Icon: Lock },
          ].map(({ key, label, type, placeholder, Icon }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label className="dash-label">{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon size={16} color="#8888A0" style={{ position: 'absolute', left: 12, top: 13 }} />
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  minLength={key === 'password' ? 6 : 2}
                  className="dash-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="dash-btn-primary"
            style={{ width: '100%', padding: 12, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
            Qeydiyyatdan keç
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#B0B0B8' }}>
          Artıq hesabınız var?{' '}
          <Link href="/giris" style={{ color: '#00D37D', textDecoration: 'none' }}>
            Daxil olun
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
