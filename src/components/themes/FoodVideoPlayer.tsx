'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Film } from 'lucide-react';

interface FoodVideoPlayerProps {
  videoUrl: string;
  itemName?: string;
  borderRadius?: string | number;
}

export default function FoodVideoPlayer({
  videoUrl,
  itemName,
  borderRadius = 24,
}: FoodVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(true);

  useEffect(() => {
    // Reset state on url change
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setShowControlsHint(false);
          })
          .catch(() => {
            // If browser blocks unmuted playback, try muted
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => {
                setIsPlaying(true);
                setShowControlsHint(false);
              }).catch(() => {});
            }
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div
      onClick={togglePlay}
      className="food-popup-video-card"
      style={{
        position: 'relative',
        borderRadius,
        overflow: 'hidden',
        backgroundColor: '#0a0b0d',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Subtle dark gradient overlay to make buttons pop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isPlaying
            ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.5) 100%)'
            : 'rgba(0, 0, 0, 0.45)',
          pointerEvents: 'none',
          transition: 'background 0.3s ease',
        }}
      />

      {/* Top Tag: Food Video */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: 9999,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.3px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <Film size={13} color="#FF9F1C" />
        <span>Video</span>
        {isPlaying && (
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981',
              display: 'inline-block',
            }}
          />
        )}
      </div>

      {/* Sound Toggle Button */}
      <button
        type="button"
        onClick={toggleMute}
        title={isMuted ? 'Səsi aç' : 'Səsi bağla'}
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#fff',
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3,
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 159, 28, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(255, 159, 28, 0.5), 0 0 0 8px rgba(255, 159, 28, 0.2)',
              color: '#111315',
              paddingLeft: 4,
              transition: 'transform 0.2s ease',
            }}
          >
            <Play size={28} fill="#111315" />
          </div>
          <span
            style={{
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(6px)',
              padding: '6px 14px',
              borderRadius: 9999,
              letterSpacing: '0.2px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Oynatmaq üçün toxunun
          </span>
        </div>
      )}

      {/* Bottom Hint when playing: click to pause */}
      {isPlaying && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
            padding: '4px 10px',
            borderRadius: 9999,
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: 11,
            pointerEvents: 'none',
            zIndex: 2,
            whiteSpace: 'nowrap',
          }}
        >
          Durdurmaq üçün klikləyin
        </div>
      )}
    </div>
  );
}
