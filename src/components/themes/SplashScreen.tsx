'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

export interface SplashConfig {
  type?: 'video' | 'code';
  videoUrl?: string;
  videoMuted?: boolean;
  videoLoop?: boolean;
  html?: string;
  css?: string;
  js?: string;
  duration?: number; // seconds, 0 = no auto close
  showSkipButton?: boolean;
  skipButtonText?: string;
  backgroundColor?: string;
  alwaysShow?: boolean;
}

interface SplashScreenProps {
  config: SplashConfig;
  siteSlug: string;
}

function getEmbedUrl(url: string, muted: boolean, loop: boolean): string | null {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${id}&controls=0&modestbranding=1`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return `https://player.vimeo.com/video/${id}?autoplay=1&muted=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=0`;
  }

  return null;
}

export default function SplashScreen({ config, siteSlug }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const {
    type = 'video',
    videoUrl = '',
    videoMuted = true,
    videoLoop = false,
    html = '',
    css = '',
    js = '',
    duration = 5,
    showSkipButton = true,
    skipButtonText = 'Keç',
    backgroundColor = '#0A0A0F',
    alwaysShow = false,
  } = config;

  useEffect(() => {
    // Check session storage
    if (!alwaysShow && typeof window !== 'undefined') {
      const seen = sessionStorage.getItem(`splash_seen_${siteSlug}`);
      if (seen) return;
    }

    setVisible(true);

    if (duration > 0) {
      setTimeLeft(duration);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            handleDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [siteSlug, duration, alwaysShow]);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`splash_seen_${siteSlug}`, 'true');
    }
  };

  if (!visible) return null;

  const embedUrl = getEmbedUrl(videoUrl, videoMuted, videoLoop);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Skip Button */}
          {showSkipButton && (
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 100,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <span>{skipButtonText}</span>
              {timeLeft !== null && timeLeft > 0 && (
                <span style={{ opacity: 0.7, fontSize: 12 }}>({timeLeft}s)</span>
              )}
              <X size={16} />
            </button>
          )}

          {/* Content: Video Mode */}
          {type === 'video' && videoUrl && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Splash Video"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    border: 'none',
                    pointerEvents: 'none',
                  }}
                  allow="autoplay; fullscreen"
                />
              ) : (
                <video
                  src={videoUrl}
                  autoPlay
                  muted={videoMuted}
                  loop={videoLoop}
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onEnded={() => {
                    if (!videoLoop) handleDismiss();
                  }}
                />
              )}
            </div>
          )}

          {/* Content: Custom Code Mode (HTML / CSS / JS) */}
          {type === 'code' && (
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                      body {
                        margin: 0;
                        padding: 0;
                        background: ${backgroundColor};
                        color: #ffffff;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        overflow: hidden;
                      }
                      ${css || ''}
                    </style>
                  </head>
                  <body>
                    ${html || '<div style="text-align: center; font-size: 24px;">Xoş gəlmisiniz!</div>'}
                    <script>
                      try {
                        ${js || ''}
                      } catch (err) {
                        console.error('Splash script error:', err);
                      }
                    <\/script>
                  </body>
                </html>
              `}
              title="Splash Custom Content"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
