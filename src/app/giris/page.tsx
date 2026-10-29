'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Giriş zamanı xəta baş verdi');
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
        background: '#171717',
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
          background: '#171717',
          borderRadius: 20,
          border: '1px solid #383334',
          padding: 40,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, textDecoration: 'none' }}>
          <img src="/logo.png" alt="SiteX" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        </Link>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 8,
            color: '#E8E8F0',
          }}
        >
          Xoş gəldiniz
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#8888A0',
            fontSize: 14,
            marginBottom: 32,
          }}
        >
          Hesabınıza daxil olun
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#F87171',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="dash-label">E-poçt</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#8888A0"
                style={{ position: 'absolute', left: 12, top: 13 }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sizin@email.com"
                required
                className="dash-input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="dash-label">Şifrə</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#8888A0"
                style={{ position: 'absolute', left: 12, top: 13 }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="dash-input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="dash-btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            Daxil ol
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 14,
            color: '#8888A0',
          }}
        >
          Hesabınız yoxdur?{' '}
          <Link
            href="/qeydiyyat"
            style={{ color: '#00D37D', textDecoration: 'none' }}
          >
            Qeydiyyatdan keçin
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
