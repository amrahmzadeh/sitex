'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Loader2, Check, AlertCircle } from 'lucide-react';
import { EmployeeItem } from './types';

interface Props {
  employee: EmployeeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeePasswordModal({ employee, isOpen, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Şifrə ən azı 6 simvol olmalıdır');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Şifrə və şifrənin təkrarı uyğun gəlmir');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Şifrə yenilənə bilmədi');
      }

      setPassword('');
      setPasswordConfirm('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#171717',
            border: '1px solid #383334',
            borderRadius: 16,
            width: '100%',
            maxWidth: 440,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid #383334',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(0,211,125,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00D37D',
                }}
              >
                <KeyRound size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>
                  Şifrəni Yenilə
                </h3>
                <p style={{ fontSize: 12, color: '#B0B0B8', margin: 0 }}>
                  {employee.fullName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#B0B0B8',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 8,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#EF4444',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                Yeni Şifrə *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ən azı 6 simvol"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#222226',
                  border: '1px solid #383334',
                  color: '#F5F5F7',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                Şifrənin Təkrarı *
              </label>
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Şifrəni təkrar daxil edin"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#222226',
                  border: '1px solid #383334',
                  color: '#F5F5F7',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: '#2E292A',
                  border: '1px solid #383334',
                  color: '#B0B0B8',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Ləğv et
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 10,
                  background: '#00D37D',
                  border: 'none',
                  color: '#121212',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Yadda saxla
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

