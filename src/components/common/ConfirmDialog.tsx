'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Təsdiq et',
  cancelLabel = 'Ləğv et',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="dash-card"
          style={{
            width: '100%',
            maxWidth: 440,
            padding: 24,
            borderRadius: 16,
            background: '#1A1A1E',
            border: '1px solid #383334',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: isDestructive ? 'rgba(248, 113, 113, 0.15)' : 'rgba(0, 211, 125, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} color={isDestructive ? '#F87171' : '#00D37D'} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                {title}
              </h3>
              <p style={{ color: '#8888A0', fontSize: 14, margin: '6px 0 0', lineHeight: 1.5 }}>
                {description}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                color: '#8888A0',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="dash-btn-secondary"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: 'none',
                background: isDestructive ? '#EF4444' : '#00D37D',
                color: isDestructive ? '#FFFFFF' : '#0F0F14',
                fontWeight: 700,
                fontSize: 13,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ConfirmDialog;

