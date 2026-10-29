import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Zap, Truck } from 'lucide-react';
import { fetchActiveBanners } from '../services/api';

const FALLBACK_BANNERS = [
  {
    id: 'banner-gaming-fest',
    title: 'ĐẠI TIỆC BUILD PC GAMING 2026',
    subtitle: 'Tặng ngay Tản nhiệt nước AIO 360mm + Chuột Gaming RGB khi build trọn bộ PC tại CBStore',
    badge_text: '⚡ SIÊU KHUYẾN MÃI',
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80',
    link_url: '#builder',
    cta_text: 'Build Cấu Hình Ngay',
    bg_gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)'
  },
  {
    id: 'banner-rtx-super',
    title: 'VGA RTX 40 SUPER & INTEL GEN 14',
    subtitle: 'Sức mạnh đồ họa đỉnh cao với Ray Tracing và DLSS 3.5. Trải nghiệm Gaming 4K mượt mà',
    badge_text: '🔥 ĐỈNH CAO HIỆU NĂNG',
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&auto=format&fit=crop&q=80',
    link_url: '#products',
    cta_text: 'Xem Linh Kiện Mới',
    bg_gradient: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)'
  },
  {
    id: 'banner-laptop-flagship',
    title: 'LAPTOP GAMING & ĐỒ HỌA THẾ HỆ MỚI',
    subtitle: 'Màn hình 2.5K 240Hz, Core i9 & RTX 4080. Trả góp 0% lãi suất - 1 đổi 1 trong 15 ngày',
    badge_text: '✨ BẢO HÀNH CHÍNH HÃNG',
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&auto=format&fit=crop&q=80',
    link_url: '#products',
    cta_text: 'Mua Ngay',
    bg_gradient: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)'
  }
];

export default function BannerCarousel({ onNavigateTab }) {
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await fetchActiveBanners();
        if (data && data.length > 0) {
          setBanners(data);
        }
      } catch (err) {
        console.warn('Using fallback banners:', err);
      }
    }
    loadBanners();
  }, []);

  // Auto slide interval: 4.5s
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(timerRef.current);
  }, [banners.length, isPaused]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex] || banners[0];

  const handleBannerAction = (banner) => {
    if (!banner) return;
    const link = (banner.link_url || '#builder').trim();
    if (link.startsWith('#')) {
      const tab = link.replace('#', '');
      if (['builder', 'products', 'lookup'].includes(tab)) {
        if (onNavigateTab) onNavigateTab(tab);
        return;
      }
    }

    try {
      const target = new URL(link, window.location.origin);
      if (target.protocol !== 'http:' && target.protocol !== 'https:') return;

      if (target.origin === window.location.origin) {
        window.location.assign(`${target.pathname}${target.search}${target.hash}`);
      } else {
        window.open(target.href, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Invalid banner link:', error);
    }
  };

  return (
    <div className="home-banner-section" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="banner-grid-layout">
        {/* Main Auto-sliding Carousel */}
        <div
          className="main-banner-slide"
          style={{
            background: currentBanner?.bg_gradient || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
          }}
          onClick={() => handleBannerAction(currentBanner)}
        >
          {/* Background image illustration */}
          <div className="banner-image-backdrop">
            <img
              src={currentBanner?.image_url}
              alt={currentBanner?.title}
              className="banner-bg-img"
            />
            <div className="banner-overlay-gradient"></div>
          </div>

          {/* Banner Content */}
          <div className="banner-content-box">
            {currentBanner?.badge_text && (
              <div className="banner-badge">
                <Sparkles size={13} />
                <span>{currentBanner.badge_text}</span>
              </div>
            )}

            <h2 className="banner-title">
              {currentBanner?.title}
            </h2>

            <p className="banner-subtitle">
              {currentBanner?.subtitle}
            </p>

            <div className="banner-action-row">
              <button
                type="button"
                className="banner-cta-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerAction(currentBanner);
                }}
              >
                <span>{currentBanner?.cta_text || 'Khám Phá Ngay'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Nav Arrows */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                className="banner-arrow-btn prev"
                onClick={handlePrev}
                title="Banner trước"
                aria-label="Previous Banner"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="banner-arrow-btn next"
                onClick={handleNext}
                title="Banner kế tiếp"
                aria-label="Next Banner"
              >
                <ChevronRight size={22} />
              </button>

              {/* Indicator Dots */}
              <div className="banner-dots-bar" onClick={(e) => e.stopPropagation()}>
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`banner-dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Chuyển tới banner ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 2 Right Sub-Banners (HACOM Signature side banners) */}
        <div className="side-banners-col">
          <div
            className="side-banner-item side-banner-1"
            onClick={() => onNavigateTab && onNavigateTab('builder')}
            title="Xây dựng cấu hình PC Gaming ngay"
          >
            <div className="side-banner-badge">
              <Zap size={12} />
              <span>CẤU HÌNH TỐI ƯU</span>
            </div>
            <h4 className="side-banner-title">Build PC Theo Yêu Cầu</h4>
            <p className="side-banner-desc">Tương thích 100% linh kiện & lắp ráp miễn phí lấy ngay</p>
            <span className="side-banner-link">Khám phá PC Builder ➔</span>
          </div>

          <div
            className="side-banner-item side-banner-2"
            onClick={() => onNavigateTab && onNavigateTab('lookup')}
            title="Tra cứu tình trạng vận chuyển đơn hàng"
          >
            <div className="side-banner-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Truck size={12} />
              <span>GIAO SIÊU TỐC</span>
            </div>
            <h4 className="side-banner-title">Tra Cứu Đơn Hàng Nhanh</h4>
            <p className="side-banner-desc">Chỉ cần số điện thoại để theo dõi lộ trình đơn hàng 24/7</p>
            <span className="side-banner-link">Tra cứu ngay ➔</span>
          </div>
        </div>
      </div>
    </div>
  );
}
