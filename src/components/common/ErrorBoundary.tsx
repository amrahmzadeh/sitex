'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center',
            background: '#121216',
            borderRadius: 16,
            border: '1px solid #383334',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(248, 113, 113, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={28} color="#F87171" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F5F5F7', margin: '0 0 8px' }}>
            Gözlənilməz xəta baş verdi
          </h2>
          <p style={{ color: '#8888A0', fontSize: 14, maxWidth: 440, lineHeight: 1.5, margin: '0 0 20px' }}>
            {this.state.error?.message || 'Bu bölmə yüklənərkən xəta yarandı. Yenidən cəhd edin və ya ana səhifəyə qayıdın.'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={this.reset}
              className="dash-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13 }}
            >
              <RefreshCw size={14} /> Yenidən cəhd et
            </button>
            <Link
              href="/dashboard"
              className="dash-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, textDecoration: 'none' }}
            >
              <Home size={14} /> Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

