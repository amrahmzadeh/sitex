'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Sparkles,
  Check,
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { PLATFORM_INFO } from './SocialIcons';

export interface SocialFeedPost {
  id: string;
  platform: string;
  authorName: string;
  authorHandle: string;
  avatarUrl?: string;
  postUrl: string;
  imageUrl: string;
  isVideo?: boolean;
  caption: string;
  timeAgo: string;
  likes: number;
  comments: number;
  tags: string[];
}

interface SocialMediaFeedProps {
  socialLinks: Array<{ platform: string; url: string }>;
  theme: Partial<ThemeConfig>;
  organization: {
    name: string;
    slug?: string;
    logo?: string;
    description?: string;
  };
  menuItems?: Array<{ name: string; image?: string; price?: number; description?: string }>;
}

const FALLBACK_POST_IMAGES = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
];

const CAPTIONS_BY_PLATFORM: Record<string, string[]> = {
  instagram: [
    'Hər gün təzə və ənənəvi reseptlərlə hazırlanan ləzzət nümunəsi! Masanızı indidən rezerv edin ✨🍽️',
    'Günün ən çox bəyənilən təamı! Zərif ədviyyatların ahəngi damağınızda unudulmaz iz buraxacaq 😋🔥',
    'Street food sevərlər üçün xüsusi təqdimat! İsti və ləzzətli seçimimizlə gününüzü gözəlləşdirin 🥘💛',
    'Mətbəximizin usta əlləri tərəfindən sevgiylə bişirildi. Dadına baxmağa hər kəsi dəvət edirik! 💫',
  ],
  tiktok: [
    'Bu dadı heç yerdə tapmayacaqsınız! Təbii kərə yağının cızıltısı və o xüsusi ətir... Baxın necə hazırlanır! 👀✨',
    'Günün ən sürətli və doyumlu sifarişi! Siz hansı porsiyanı seçərdiniz? Şərhlərdə yazın 👇🔥',
    'Gizli reseptimizlə tanış olun! İsti və təravətli dadlar birbaşa mətbəximizdən masanıza gəlir 🚀🍽️',
  ],
  youtube: [
    'Mətbəximizdən xüsusi kadrlar: Ənənəvi street food reseptlərimiz necə hazırlanır? Tam videonu izləyin! 🎥✨',
    'Yeni menyumuzun sevilən təamları və qonaqlarımızın rəyləri! Kanalımıza abunə olmağı unutmayın 🔴👍',
  ],
  facebook: [
    'Ailəniz və dostlarınızla birlikdə unudulmaz nahar və şam təcrübəsi üçün qapılarımız hər zaman açıqdır! 🌿🍽️',
    'Müştərilərimizin məmnuniyyəti bizim ən böyük qürurumuzdur. Qonağımız olan hər kəsə təşəkkür edirik! ❤️',
  ],
};

function extractHandle(url: string, platform: string, orgName: string): string {
  try {
    const clean = url.trim().replace(/\/+$/, '');
    const parts = clean.split('/');
    const last = parts[parts.length - 1];
    if (last && !last.includes('.com') && !last.includes('http') && last.length > 1) {
      return last.startsWith('@') ? last : `@${last}`;
    }
  } catch {}
  const fallback = orgName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `@${fallback || platform}`;
}

export default function SocialMediaFeed({
  socialLinks,
  theme,
  organization,
  menuItems = [],
}: SocialMediaFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [selectedPost, setSelectedPost] = useState<SocialFeedPost | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Configuration check
  const isEnabled = theme.socialFeedEnabled !== false;
  if (!isEnabled || !socialLinks || socialLinks.length === 0) {
    return null;
  }

  // Styles & colors from theme
  const title = theme.socialFeedTitle || 'Sosial Şəbəkələrdə Biz';
  const subtitle =
    theme.socialFeedSubtitle || 'Canlı atmosferimiz, yeni təamlarımız və xüsusi anlar';
  const layout = theme.socialFeedLayout || 'grid'; // 'grid' | 'carousel'
  const columns = theme.socialFeedColumns || 3;
  const cardStyle = theme.socialFeedCardStyle || 'glass'; // 'glass' | 'modern' | 'bordered'
  const showEngagement = theme.socialFeedShowEngagement !== false;

  const primaryColor = theme.primaryColor || '#D4A574';
  const accentColor = theme.socialFeedAccentColor || theme.accentColor || primaryColor;
  const sectionBg = theme.socialFeedBgColor || 'transparent';
  const textColor = theme.socialFeedTextColor || theme.textColor || '#FFFFFF';

  // Card background styling based on cardStyle
  const getCardStyle = () => {
    if (theme.socialFeedCardBg) {
      return {
        background: theme.socialFeedCardBg,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      };
    }
    switch (cardStyle) {
      case 'modern':
        return {
          background: '#1A1C1E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        };
      case 'bordered':
        return {
          background: 'rgba(20, 22, 25, 0.7)',
          border: `1.5px solid ${accentColor}40`,
        };
      case 'glass':
      default:
        return {
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        };
    }
  };

  // Generate dynamic posts from configured social links
  const posts = useMemo<SocialFeedPost[]>(() => {
    const validMenuItems = menuItems.filter((m) => Boolean(m.image));
    const items: SocialFeedPost[] = [];

    // Distinct platforms
    const supportedPlatforms = socialLinks.filter((l) =>
      ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter'].includes(l.platform.toLowerCase())
    );

    const targetLinks = supportedPlatforms.length > 0 ? supportedPlatforms : socialLinks;

    targetLinks.forEach((link, idx) => {
      const p = link.platform.toLowerCase().trim();
      const pInfo = PLATFORM_INFO[p] || { name: p, brandColor: primaryColor };
      const handle = extractHandle(link.url, p, organization.name);
      const caps = CAPTIONS_BY_PLATFORM[p] || CAPTIONS_BY_PLATFORM.instagram;

      // 2-3 dynamic posts per platform
      const count = targetLinks.length === 1 ? 6 : targetLinks.length === 2 ? 3 : 2;

      for (let i = 0; i < count; i++) {
        const itemImage =
          validMenuItems[(idx * 2 + i) % Math.max(1, validMenuItems.length)]?.image ||
          FALLBACK_POST_IMAGES[(idx * 2 + i) % FALLBACK_POST_IMAGES.length];

        const isVideo = p === 'tiktok' || p === 'youtube' || (p === 'instagram' && i % 2 === 1);
        const timeAgos = ['1 saat əvvəl', '3 saat əvvəl', 'Dünən', '2 gün əvvəl', 'Bu həftə'];
        const timeAgo = timeAgos[(idx + i) % timeAgos.length];
        const caption = caps[(idx + i) % caps.length];

        items.push({
          id: `post-${p}-${idx}-${i}`,
          platform: p,
          authorName: organization.name,
          authorHandle: handle,
          avatarUrl: organization.logo,
          postUrl: link.url,
          imageUrl: itemImage,
          isVideo,
          caption,
          timeAgo,
          likes: 85 + (idx * 137 + i * 94) % 940,
          comments: 6 + (idx * 17 + i * 11) % 48,
          tags: ['#streetfood', '#lezzet', '#restaurant', `#${p}`],
        });
      }
    });

    return items;
  }, [socialLinks, menuItems, organization.name, organization.logo, primaryColor]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return posts;
    return posts.filter((p) => p.platform === activeFilter);
  }, [posts, activeFilter]);

  // Platforms for the filter tabs
  const availablePlatforms = useMemo(() => {
    const set = new Set(posts.map((p) => p.platform));
    return Array.from(set);
  }, [posts]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = (post: SocialFeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(post.postUrl);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: dir === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const columnClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section
      id="social-feed"
      style={{
        backgroundColor: sectionBg,
        padding: '70px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 680, margin: '0 auto 36px' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}35`,
              color: accentColor,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            <Sparkles size={14} />
            <span>Canlı Sosial Yayım</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontFamily: theme.brandFont || theme.headingFont || 'Playfair Display',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: textColor,
              marginBottom: 12,
              lineHeight: 1.25,
            }}
          >
            {title}
          </motion.h2>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: `${textColor}99`,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Filter Pills */}
          {availablePlatforms.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 22,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 9999,
                  border: activeFilter === 'all' ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.12)',
                  background: activeFilter === 'all' ? `${accentColor}25` : 'rgba(255,255,255,0.04)',
                  color: activeFilter === 'all' ? accentColor : `${textColor}AA`,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                Hamısı ({posts.length})
              </button>

              {availablePlatforms.map((p) => {
                const pInfo = PLATFORM_INFO[p];
                const isActive = activeFilter === p;
                const count = posts.filter((item) => item.platform === p).length;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveFilter(p)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '6px 14px',
                      borderRadius: 9999,
                      border: isActive
                        ? `1px solid ${pInfo?.brandColor || accentColor}`
                        : '1px solid rgba(255,255,255,0.12)',
                      background: isActive
                        ? `${pInfo?.brandColor || accentColor}25`
                        : 'rgba(255,255,255,0.04)',
                      color: isActive ? pInfo?.brandColor || accentColor : `${textColor}AA`,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span style={{ width: 14, height: 14, display: 'inline-block' }}>{pInfo?.svg}</span>
                    <span>{pInfo?.name || p}</span>
                    <span style={{ opacity: 0.6, fontSize: 11 }}>({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Carousel Navigation Buttons */}
        {layout === 'carousel' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Əvvəlki"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(20,20,30,0.8)',
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.color = accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = textColor;
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Növbəti"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(20,20,30,0.8)',
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.color = accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = textColor;
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Posts Container (Grid or Carousel) */}
        {layout === 'carousel' ? (
          <div
            ref={carouselRef}
            style={{
              display: 'flex',
              gap: 20,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: 16,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {filteredPosts.map((post, idx) => (
              <div
                key={post.id}
                style={{
                  flex: '0 0 320px',
                  scrollSnapAlign: 'start',
                }}
              >
                <PostCard
                  post={post}
                  idx={idx}
                  theme={theme}
                  accentColor={accentColor}
                  textColor={textColor}
                  cardStyleObj={getCardStyle()}
                  showEngagement={showEngagement}
                  isLiked={Boolean(likedPosts[post.id])}
                  onToggleLike={(e) => toggleLike(post.id, e)}
                  onSelect={() => setSelectedPost(post)}
                  onShare={(e) => handleShare(post, e)}
                  copied={copiedPostId === post.id}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 22,
              gridTemplateColumns:
                columns === 2
                  ? 'repeat(auto-fit, minmax(320px, 1fr))'
                  : columns === 4
                  ? 'repeat(auto-fill, minmax(260px, 1fr))'
                  : 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {filteredPosts.map((post, idx) => (
              <PostCard
                key={post.id}
                post={post}
                idx={idx}
                theme={theme}
                accentColor={accentColor}
                textColor={textColor}
                cardStyleObj={getCardStyle()}
                showEngagement={showEngagement}
                isLiked={Boolean(likedPosts[post.id])}
                onToggleLike={(e) => toggleLike(post.id, e)}
                onSelect={() => setSelectedPost(post)}
                onShare={(e) => handleShare(post, e)}
                copied={copiedPostId === post.id}
              />
            ))}
          </div>
        )}

        {/* Bottom Social Follow Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 48,
            padding: '24px 28px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  objectFit: 'cover',
                  border: `1.5px solid ${accentColor}40`,
                }}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${accentColor}25`,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {organization.name.charAt(0)}
              </div>
            )}
            <div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: textColor }}>
                {organization.name} ilə əlaqədə qalın
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: `${textColor}88` }}>
                Yeniliklərdən xəbərdar olmaq üçün rəsmi səhifələrimizə qoşulun
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {socialLinks.map((link) => {
              const p = link.platform.toLowerCase();
              const pInfo = PLATFORM_INFO[p];
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    borderRadius: 10,
                    background: pInfo?.defaultBg || '#1e2022',
                    color: p === 'snapchat' ? '#000' : '#FFF',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ width: 16, height: 16, display: 'inline-block' }}>
                    {pInfo?.svg}
                  </span>
                  <span>{pInfo?.name || p} İzlə</span>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Lightbox / Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 820,
                maxHeight: '90vh',
                borderRadius: 20,
                overflow: 'hidden',
                background: '#16181B',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
              }}
            >
              {/* Media side */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#0c0d0e',
                  minHeight: 380,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {selectedPost.isVideo && (
                  <div
                    style={{
                      position: 'absolute',
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    <Play size={22} fill="#FFF" style={{ marginLeft: 3 }} />
                  </div>
                )}
              </div>

              {/* Info side */}
              <div
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#181A1D',
                }}
              >
                <div>
                  {/* Author Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      paddingBottom: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {selectedPost.avatarUrl ? (
                        <img
                          src={selectedPost.avatarUrl}
                          alt={selectedPost.authorName}
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `1.5px solid ${accentColor}`,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: `${accentColor}30`,
                            color: accentColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {selectedPost.authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9' }}>
                          {selectedPost.authorName}
                        </div>
                        <div style={{ fontSize: 12, color: '#9BA3AF' }}>
                          {selectedPost.authorHandle} • {selectedPost.timeAgo}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPost(null)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none',
                        color: '#9BA3AF',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Caption */}
                  <p
                    style={{
                      fontSize: 14,
                      color: '#E2E2E5',
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  >
                    {selectedPost.caption}
                  </p>

                  {/* Hashtags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    {selectedPost.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 12,
                          color: accentColor,
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      paddingTop: 14,
                      marginBottom: 14,
                      fontSize: 13,
                      color: '#9BA3AF',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Heart
                        size={16}
                        fill={likedPosts[selectedPost.id] ? '#F87171' : 'none'}
                        color={likedPosts[selectedPost.id] ? '#F87171' : 'currentColor'}
                      />
                      {selectedPost.likes + (likedPosts[selectedPost.id] ? 1 : 0)} bəyənmə
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MessageCircle size={16} />
                      {selectedPost.comments} şərh
                    </span>
                  </div>

                  <a
                    href={selectedPost.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      background:
                        PLATFORM_INFO[selectedPost.platform]?.defaultBg ||
                        `linear-gradient(135deg, ${accentColor}, #E5A93C)`,
                      color: '#FFF',
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                  >
                    <span>
                      {PLATFORM_INFO[selectedPost.platform]?.name || selectedPost.platform}-da bax
                    </span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PostCard({
  post,
  idx,
  theme,
  accentColor,
  textColor,
  cardStyleObj,
  showEngagement,
  isLiked,
  onToggleLike,
  onSelect,
  onShare,
  copied,
}: {
  post: SocialFeedPost;
  idx: number;
  theme: Partial<ThemeConfig>;
  accentColor: string;
  textColor: string;
  cardStyleObj: React.CSSProperties;
  showEngagement: boolean;
  isLiked: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onShare: (e: React.MouseEvent) => void;
  copied: boolean;
}) {
  const pInfo = PLATFORM_INFO[post.platform];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (idx % 6) * 0.07, duration: 0.35 }}
      onClick={onSelect}
      style={{
        ...cardStyleObj,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.22s ease',
      }}
      whileHover={{
        y: -6,
        boxShadow: `0 14px 34px rgba(0,0,0,0.35), 0 0 16px ${pInfo?.brandColor || accentColor}22`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {post.avatarUrl ? (
            <img
              src={post.avatarUrl}
              alt={post.authorName}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1px solid ${accentColor}50`,
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `${accentColor}25`,
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {post.authorName.charAt(0)}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: textColor,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 150,
              }}
            >
              {post.authorName}
            </div>
            <div style={{ fontSize: 11, color: `${textColor}77` }}>{post.timeAgo}</div>
          </div>
        </div>

        {/* Platform Badge */}
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: pInfo?.defaultBg || '#7C5CFC',
            color: post.platform === 'snapchat' ? '#000' : '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
            boxSizing: 'border-box',
            boxShadow: `0 2px 8px ${pInfo?.brandColor || '#7C5CFC'}35`,
          }}
          title={pInfo?.name || post.platform}
        >
          {pInfo?.svg}
        </div>
      </div>

      {/* Media with Hover Overlay */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          backgroundColor: '#0f1113',
        }}
      >
        <motion.img
          src={post.imageUrl}
          alt={post.caption}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        {/* Video Icon Badge */}
        {post.isVideo && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <Play size={12} fill="#FFF" />
            <span>Video</span>
          </div>
        )}

        {/* View on platform pill on hover */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            padding: '5px 10px',
            borderRadius: 9999,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(6px)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <span>Bax</span>
          <ExternalLink size={12} />
        </div>
      </div>

      {/* Caption Content */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: `${textColor}DD`,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.caption}
        </p>

        {/* Engagement Footer */}
        {showEngagement && (
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12,
              color: `${textColor}88`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                onClick={onToggleLike}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  color: isLiked ? '#F87171' : 'inherit',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: isLiked ? 700 : 500,
                  transition: 'color 0.15s ease',
                }}
              >
                <Heart
                  size={15}
                  fill={isLiked ? '#F87171' : 'none'}
                  color={isLiked ? '#F87171' : 'currentColor'}
                />
                <span>{post.likes + (isLiked ? 1 : 0)}</span>
              </button>

              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageCircle size={15} />
                <span>{post.comments}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onShare}
              title={copied ? 'Link kopyalandı!' : 'Linki kopyala'}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: copied ? '#34D399' : 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
              }}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copied ? 'Kopyalandı' : 'Paylaş'}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
