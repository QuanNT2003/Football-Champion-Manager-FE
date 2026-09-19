import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Club, TimelineData } from '../types';
import {
  Building2,
  Calendar,
  Users,
  Coins,
  DollarSign,
  TrendingUp,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  Swords,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface Props {
  club: Club | null;
  timeline: TimelineData | null;
  onUpgradeFacility?: (facilityId: string) => void;
  onSwitchTab?: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  club,
  timeline,
  onUpgradeFacility,
  onSwitchTab,
}) => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  const handleNavigate = (path: string) => {
    if (onSwitchTab) onSwitchTab(path);
    navigate(`/${path}`);
  };

  if (!club) {
    return (
      <div className="game-empty-state">
        <div className="empty-icon-hex">⚽</div>
        <h3>CHƯA KÝ HỢP ĐỒNG QUẢN LÝ CLB</h3>
        <p>Vui lòng nhậm chức câu lạc bộ để truy cập Trung tâm Chỉ huy Quản lý.</p>
        <button className="btn-primary" onClick={() => navigate('/onboarding')}>
          ĐẾN PHÒNG NHẬM CHỨC HLV
        </button>
      </div>
    );
  }

  const currentDay = timeline?.season?.current_day || 1;
  const totalDays = timeline?.season?.total_days || 40;
  const seasonNum = timeline?.season?.season_number || 1;

  // Lấy chữ viết tắt câu lạc bộ (ví dụ: Phan Thiet -> PT)
  const getClubInitials = (name: string, shortName?: string) => {
    if (shortName && shortName.trim()) return shortName.trim().slice(0, 5);
    const words = name.replace(/[()]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
  };

  const hasValidLogo = club.logo_url && !logoError && !club.logo_url.includes('default_logo');

  return (
    <div className="view-container dashboard-page-hud">
      {/* HUD Top Broadcast Banner */}
      <div className="hud-broadcast-ticker">
        <div className="ticker-badge">
          <span className="live-dot" />
          <span>MATCH ENGINE LIVE</span>
        </div>
        <div className="ticker-text">
          <span>🏆 MÙA GIẢI {seasonNum} • VÒNG {currentDay}/{totalDays} ĐANG DIỄN RA • THỊ TRƯỜNG CHUYỂN NHƯỢNG ĐANG MỞ • 112 QUỐC GIA ĐỒNG BỘ TRỰC TUYẾN</span>
        </div>
      </div>

      {/* Hero Club Banner */}
      <div className="club-hero-card-hud">
        <div className="club-hero-left">
          {/* Logo / Badge Box - Clean, no text overflow */}
          <div className="club-badge-glow">
            {hasValidLogo ? (
              <img
                src={club.logo_url}
                alt=""
                onError={() => setLogoError(true)}
                className="club-img"
              />
            ) : (
              <div className="club-initials-badge">
                <span className="club-crest-icon">⚽</span>
                <span className="club-initials-text">{getClubInitials(club.name, club.short_name)}</span>
              </div>
            )}
          </div>

          <div className="club-hero-info">
            <div className="club-tier-tag">
              <ShieldCheck size={14} />
              <span>CÂU LẠC BỘ CHUYÊN NGHIỆP</span>
            </div>
            <h2 className="club-title-hud">{club.name}</h2>
            <p className="club-sub-hud">
              {club.country || 'Toàn cầu'} • {club.city || 'Thành Phố Sân Nhà'} • SVĐ: {club.stadium?.name || club.stadiums?.[0]?.name || 'Sân Vận Động Chính'}
            </p>

            <div className="club-pill-tags-hud">
              <span className="pill-item-hud">
                <Users size={14} />
                <span>{club.squadCount || 16} Cầu Thủ</span>
              </span>
              <span className="pill-item-hud">
                <Flame size={14} />
                <span>Tier 3 Chuyên Nghiệp</span>
              </span>
            </div>
          </div>
        </div>

        <div className="club-hero-stats-hud">
          <div className="hero-stat-hud">
            <span className="hero-stat-label">DANH TIẾNG CLB</span>
            <div className="hero-stat-val">
              <Award size={20} />
              <span>{club.reputation}</span>
            </div>
          </div>

          <div className="hero-stat-hud">
            <span className="hero-stat-label">ĐIỂM HẠNG ĐẤU</span>
            <div className="hero-stat-val">
              <TrendingUp size={20} />
              <span>{club.ranking_points}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Gaming Tiles */}
      <div className="gaming-tiles-grid">
        <div className="gaming-tile-card squad-tile" onClick={() => handleNavigate('squad')}>
          <div className="tile-icon-box">👥</div>
          <div className="tile-content">
            <h4>QUẢN LÝ ĐỘI HÌNH</h4>
            <p>Danh sách cầu thủ, chỉ số OVR, thể lực & hợp đồng</p>
          </div>
          <ChevronRight size={20} className="tile-arrow" />
        </div>

        <div className="gaming-tile-card tactics-tile" onClick={() => handleNavigate('tactics')}>
          <div className="tile-icon-box">📋</div>
          <div className="tile-content">
            <h4>SA BÀN CHIẾN THUẬT 2D</h4>
            <p>Sơ đồ 4-3-3, 4-4-2, puck nam châm & lệnh chỉ đạo</p>
          </div>
          <ChevronRight size={20} className="tile-arrow" />
        </div>

        <div className="gaming-tile-card matches-tile" onClick={() => handleNavigate('matches')}>
          <div className="tile-icon-box">⚽</div>
          <div className="tile-content">
            <h4>TRUNG TÂM TRẬN ĐẤU</h4>
            <p>Mô phỏng 90 phút trực tiếp, bán vé & bình luận</p>
          </div>
          <ChevronRight size={20} className="tile-arrow" />
        </div>

        <div className="gaming-tile-card transfers-tile" onClick={() => handleNavigate('transfers')}>
          <div className="tile-icon-box">🛒</div>
          <div className="tile-content">
            <h4>THỊ TRƯỜNG CHUYỂN NHƯỢNG</h4>
            <p>Săn tài năng trẻ, gửi đề nghị đàm phán mua/bán</p>
          </div>
          <ChevronRight size={20} className="tile-arrow" />
        </div>
      </div>

      {/* Stadium Card */}
      <div className="hud-panel-card">
        <div className="hud-panel-header">
          <div className="header-title-hud">
            <Building2 className="text-emerald" size={22} />
            <h3>SÂN VẬN ĐỘNG & ĐẠI BẢN DOANH ĐỘI NHÀ</h3>
          </div>
          <button className="btn-hud-link" onClick={() => handleNavigate('facilities')}>
            <span>NÂNG CẤP SVĐ</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="stadium-grid-hud">
          <div className="stadium-box-hud">
            <span className="box-sub">TÊN SÂN VẬN ĐỘNG</span>
            <strong className="box-title">
              {club.stadium?.name || club.stadiums?.[0]?.name || 'Sân Vận Động Chính'}
            </strong>
          </div>

          <div className="stadium-box-hud">
            <span className="box-sub">SỨC CHỨA KHÁN ĐÀI</span>
            <strong className="box-title text-cyan">
              {(club.stadium?.capacity || club.stadiums?.[0]?.capacity || 45000).toLocaleString()} <small>CHỖ NGỒI</small>
            </strong>
          </div>

          <div className="stadium-box-hud">
            <span className="box-sub">MẶT SÂN THI ĐẤU</span>
            <strong className="box-title text-emerald">CỎ TỰ NHIÊN HYBRID FIFA PRO</strong>
          </div>
        </div>
      </div>

      {/* Infrastructure 1-click preview */}
      <div className="hud-panel-card">
        <div className="hud-panel-header">
          <div className="header-title-hud">
            <Award className="text-cyan" size={22} />
            <h3>HẠ TẦNG CÂU LẠC BỘ (1-CLICK NÂNG CẤP NHANH)</h3>
          </div>
          <button className="btn-hud-link" onClick={() => handleNavigate('facilities')}>
            <span>XEM TẤT CẢ ({club.facilities?.length || 5} CƠ SỞ)</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="facilities-preview-grid-hud">
          {(club.facilities || club.club_facilities || [
            { id: '1', name: 'Trung Tâm Huấn Luyện', code: 'TRAINING', current_level: 3, status: 'OPERATIONAL' },
            { id: '2', name: 'Học Viện Đào Tạo Trẻ', code: 'YOUTH', current_level: 2, status: 'OPERATIONAL' },
            { id: '3', name: 'Phòng Y Tế & Phục Hồi', code: 'MEDICAL', current_level: 3, status: 'OPERATIONAL' },
            { id: '4', name: 'Mạng Lưới Tuyển Trạch', code: 'SCOUTING', current_level: 1, status: 'OPERATIONAL' },
          ]).slice(0, 4).map((facility) => (
            <div key={facility.id} className="facility-quick-card-hud">
              <div className="quick-header">
                <strong>{facility.name}</strong>
                <span className="lvl-badge-hud">CẤP {facility.current_level}</span>
              </div>
              <p className="quick-status text-emerald">● Đang hoạt động tối ưu</p>

              {onUpgradeFacility && (
                <button
                  type="button"
                  className="btn-quick-upgrade-hud"
                  onClick={() => onUpgradeFacility(facility.id)}
                >
                  <ArrowUpRight size={14} />
                  <span>Nâng Lên Cấp {facility.current_level + 1}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
