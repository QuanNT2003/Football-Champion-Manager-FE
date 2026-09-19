import React from 'react';
import { Club } from '../types';
import {
  Building2,
  Dumbbell,
  Stethoscope,
  Users,
  GraduationCap,
  Hammer,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  club: Club | null;
  onUpgradeFacility: (facilityId: string) => Promise<void> | void;
}

export const FacilitiesView: React.FC<Props> = ({ club, onUpgradeFacility }) => {
  if (!club) {
    return (
      <div className="game-empty-state">
        <Building2 size={48} className="empty-icon" />
        <h3>Chưa có dữ liệu câu lạc bộ</h3>
        <p>Vui lòng chọn hoặc hoàn tất nhận câu lạc bộ để truy cập cơ sở hạ tầng.</p>
      </div>
    );
  }

  const facilities = club.facilities || [];
  const stadium = club.stadiums?.[0] || club.stadium;
  const cash = club.financial_accounts?.[0]?.cash_balance ?? club.finances?.cash ?? 1500000;

  const getFacilityIcon = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'TRAINING_GROUND':
      case 'TRAINING':
        return <Dumbbell size={24} className="facility-type-icon text-cyan" />;
      case 'YOUTH_ACADEMY':
      case 'YOUTH':
        return <GraduationCap size={24} className="facility-type-icon text-emerald" />;
      case 'MEDICAL_CENTER':
      case 'MEDICAL':
        return <Stethoscope size={24} className="facility-type-icon text-rose" />;
      case 'SCOUTING_NETWORK':
      case 'SCOUTING':
        return <Users size={24} className="facility-type-icon text-amber" />;
      default:
        return <Building2 size={24} className="facility-type-icon text-purple" />;
    }
  };

  const getFacilityDescription = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'TRAINING_GROUND':
      case 'TRAINING':
        return 'Tăng hiệu quả phát triển chỉ số thuộc tính cầu thủ trong các buổi tập chuyên sâu.';
      case 'YOUTH_ACADEMY':
      case 'YOUTH':
        return 'Sản sinh các tài năng trẻ U19 tiềm năng cao (Wonderkids) mỗi đầu mùa giải.';
      case 'MEDICAL_CENTER':
      case 'MEDICAL':
        return 'Giảm 50% thời gian điều trị chấn thương và tăng tốc độ hồi phục thể lực thi đấu.';
      case 'SCOUTING_NETWORK':
      case 'SCOUTING':
        return 'Mở rộng tầm quét trinh sát toàn cầu, báo cáo chính xác tiềm năng cầu thủ đối thủ.';
      default:
        return 'Nâng cao danh tiếng quốc tế và quy mô hạ tầng chuyên nghiệp của câu lạc bộ.';
    }
  };

  return (
    <div className="view-container facilities-page">
      {/* Stadium Landmark Hero Banner */}
      <div className="stadium-hero-card">
        <div className="stadium-hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>ĐẠI BẢN DOANH CHÍNH THỨC</span>
          </div>
          <h2 className="stadium-name">{stadium?.name || `${club.name} Arena`}</h2>
          <p className="stadium-city">
            {club.city || 'Thành Phố'}, {club.country || 'Quốc Gia'} • Mặt cỏ tự nhiên chuẩn FIFA Pro
          </p>

          <div className="stadium-stats-row">
            <div className="stadium-stat-item">
              <span className="stat-label">SỨC CHỨA SÂN KHÁCH & NHÀ</span>
              <strong className="stat-value text-cyan">
                {(stadium?.capacity || 25000).toLocaleString()} <small>CHỖ NGỒI</small>
              </strong>
            </div>

            <div className="stadium-stat-item">
              <span className="stat-label">NGÂN SÁCH XÂY DỰNG KHẢ DỤNG</span>
              <strong className="stat-value text-emerald">
                €{Number(cash).toLocaleString()} <small>CASH</small>
              </strong>
            </div>

            <div className="stadium-stat-item">
              <span className="stat-label">ĐẲNG CẤP KIẾN TRÚC</span>
              <strong className="stat-value text-amber">
                HẠNG ĐẲNG CẤP THẾ GIỚI
              </strong>
            </div>
          </div>
        </div>

        <div className="stadium-visual-badge">
          <div className="stadium-3d-glow" />
          <span className="stadium-emoji">🏟️</span>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="section-heading-row">
        <div>
          <h3 className="section-title">HỆ THỐNG CƠ SỞ VẬT CHẤT & TRUNG TÂM PHÁT TRIỂN</h3>
          <p className="section-subtitle">
            Nâng cấp cấp độ cơ sở hạ tầng để nâng cao chỉ số toàn đội, tăng tốc hồi phục và ươm mầm thế hệ kế cận.
          </p>
        </div>
      </div>

      <div className="facilities-grid">
        {facilities.map((f) => {
          const maxLevel = 10;
          const currentLvl = f.current_level || 1;
          const progressPercent = Math.min(100, Math.round((currentLvl / maxLevel) * 100));

          return (
            <div key={f.id} className="facility-card-hud">
              <div className="facility-card-header">
                <div className="facility-icon-wrap">
                  {getFacilityIcon(f.code)}
                </div>
                <div className="facility-title-box">
                  <h4>{f.name}</h4>
                  <div className="facility-code-pill">{f.code || 'INFRA'}</div>
                </div>
                <div className="facility-level-pill">
                  <span>CẤP</span>
                  <strong>{currentLvl}/{maxLevel}</strong>
                </div>
              </div>

              <p className="facility-desc">{getFacilityDescription(f.code)}</p>

              {/* Progress Bar */}
              <div className="facility-progress-section">
                <div className="progress-labels">
                  <span>Tiến độ phát triển</span>
                  <strong>{progressPercent}%</strong>
                </div>
                <div className="hud-progress-track">
                  <div
                    className="hud-progress-bar"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="facility-card-footer">
                <div className="facility-status-tag">
                  <span className="status-dot-pulse" />
                  <span>{f.status || 'HOẠT ĐỘNG TỐT'}</span>
                </div>

                <button
                  type="button"
                  className="btn-upgrade-hud"
                  onClick={() => onUpgradeFacility(f.id)}
                  disabled={currentLvl >= maxLevel}
                >
                  <Hammer size={16} />
                  <span>{currentLvl >= maxLevel ? 'ĐẠT CẤP TỐI ĐA' : 'NÂNG CẤP (+1 CẤP)'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
