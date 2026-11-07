'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SplashConfig {
  type?: 'video' | 'code';
  videoUrl?: string;
  videoMuted?: boolean;
  videoLoop?: boolean;
  html?: string;
  css?: string;
  js?: string;
  duration?: number; // seconds, 0 = auto close when background site is ready
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
  let parsedConfig: SplashConfig = {};
  try {
    parsedConfig = typeof config === 'string' ? JSON.parse(config) : (config || {});
  } catch {
    parsedConfig = {};
  }

  const {
    type = 'video',
    videoUrl = '',
    videoMuted = true,
    videoLoop = false,
    html = '',
    css = '',
    js = '',
    duration = 0,
    showSkipButton = false,
    skipButtonText = 'Keç',
    backgroundColor = '#0A0A0F',
    alwaysShow = false,
  } = parsedConfig;

  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(duration > 0 ? duration : null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      const overlay = document.getElementById('splash-screen-overlay');
      if (overlay) {
        overlay.style.pointerEvents = 'none';
      }
    }
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`splash_seen_${siteSlug}`, 'true');
      } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !alwaysShow) {
      try {
        if (sessionStorage.getItem(`splash_seen_${siteSlug}`)) {
          setVisible(false);
          if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
          }
          return;
        }
      } catch { /* ignore */ }
    }
  }, [siteSlug, alwaysShow]);

  // Always reset body overflow on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  // Immediate Video Play
  useEffect(() => {
    if (!visible || type !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Browser autoplay policy requires muted
      video.muted = true;
      video.play().catch(() => {
        handleDismiss();
      });
    });
  }, [visible, type, videoUrl]);

  // Lifecycle & Auto-Dismiss: NEVER trap the user
  useEffect(() => {
    if (!visible) return;

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    let autoCloseTimer: NodeJS.Timeout | null = null;
    let countdownInterval: NodeJS.Timeout | null = null;
    let hardFallbackTimer: NodeJS.Timeout | null = null;

    const closeSplash = () => {
      handleDismiss();
    };

    if (duration > 0) {
      setTimeLeft(duration);

      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

      autoCloseTimer = setTimeout(closeSplash, duration * 1000);
    } else if (type !== 'video') {
      // duration === 0 and non-video: close as soon as page is loaded
      const onSiteReady = () => {
        autoCloseTimer = setTimeout(closeSplash, 1500);
      };

      if (typeof document !== 'undefined' && (document.readyState === 'complete' || document.readyState === 'interactive')) {
        onSiteReady();
      } else if (typeof window !== 'undefined') {
        window.addEventListener('load', onSiteReady, { once: true });
      }

      hardFallbackTimer = setTimeout(closeSplash, 4000);
    } else {
      // Video mode with duration=0: let video play and trigger onEnded, fallback at 6s
      hardFallbackTimer = setTimeout(closeSplash, 6000);
    }

    // Absolute fallback: no splash screen should ever lock a site for more than 10s
    const maxSafety = setTimeout(closeSplash, 10000);

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      if (hardFallbackTimer) clearTimeout(hardFallbackTimer);
      clearTimeout(maxSafety);
    };
  }, [visible, duration, siteSlug, type]);

  const embedUrl = getEmbedUrl(videoUrl, videoMuted, videoLoop);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="splash-screen-overlay"
          key="splash-screen-overlay"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
          onClick={handleDismiss}
          suppressHydrationWarning
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Synchronous inline script: hides immediately if seen in session, sets failsafe */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){
                try {
                  if (!${alwaysShow ? 'true' : 'false'} && sessionStorage.getItem('splash_seen_${siteSlug}')) {
                    var el = document.getElementById('splash-screen-overlay');
                    if (el) el.style.display = 'none';
                  } else {
                    document.body.style.overflow = 'hidden';
                  }
                } catch(e) {}
                setTimeout(function(){
                  var el = document.getElementById('splash-screen-overlay');
                  if (el && el.style.display !== 'none') {
                    el.style.transition = 'opacity 0.4s ease';
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    setTimeout(function(){ if (el) { el.style.display = 'none'; } document.body.style.overflow = ''; }, 400);
                  }
                }, ${(duration && duration > 0 ? duration + 1.5 : 6) * 1000});
              })()`,
            }}
          />

          {/* Content: Video Mode */}
          {type === 'video' && videoUrl && (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Subtle spinner while remote video buffers from CDN */}
              {!videoLoaded && !embedUrl && (
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#f2a60b', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}

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
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  muted={true}
                  loop={false}
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoLoaded(true)}
                  onCanPlay={() => setVideoLoaded(true)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={() => {
                    handleDismiss();
                  }}
                  onEnded={() => {
                    handleDismiss();
                  }}
                />
              )}
            </div>
          )}

          {/* Content: Custom Code Mode (HTML / CSS / JS) */}
          {type === 'code' && (
            <iframe
              sandbox="allow-scripts"
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

          {/* Fallback if type is video but videoUrl is empty */}
          {type === 'video' && !videoUrl && (
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Xoş Gəlmisiniz</h2>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
