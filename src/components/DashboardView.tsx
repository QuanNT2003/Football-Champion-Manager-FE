import React from 'react';
import { Club, TimelineData } from '../types';
import { Building2, Award, TrendingUp, Clock, HeartPulse, Radio, ArrowUpRight, Shield, Zap, Sparkles } from 'lucide-react';

interface Props {
  club: Club | null;
  timeline?: TimelineData | null;
  onUpgradeFacility: (facilityId: string) => void;
  onSwitchTab: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  club,
  timeline,
  onUpgradeFacility,
  onSwitchTab
}) => {
  if (!club) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Bạn chưa chọn hoặc quản lý Câu Lạc Bộ nào</h2>
        <p style={{ color: '#64748b', marginTop: '10px' }}>
          Vui lòng chọn một CLB để bắt đầu sự nghiệp huấn luyện viên!
        </p>
      </div>
    );
  }

  const currentDay = timeline?.season?.current_day || 1;
  const totalDays = timeline?.season?.total_days || 40;
  const progressPercent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Online Matchday Schedule Banner (Daylight Broadcast Style) */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        border: 'none',
        boxShadow: '0 8px 25px rgba(2, 132, 199, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        color: '#ffffff'
      }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: '#dcfce7', color: '#15803d' }}>
              <Radio size={14} /> MÁY CHỦ ONLINE REAL-TIME
            </span>
            <span style={{ fontSize: '0.85rem', color: '#e0f2fe', fontFamily: 'var(--font-game)' }}>
              MÙA GIẢI: <strong style={{ color: '#ffffff' }}>MÙA {timeline?.season?.season_number || 1}</strong>
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            VÒNG ĐẤU {currentDay} / {totalDays}
          </h2>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.25)', borderRadius: '5px', overflow: 'hidden', margin: '12px 0' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #86efac)',
              borderRadius: '5px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '0.82rem', color: '#e0f2fe' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#bae6fd" /> Lịch thi đấu tự động 21h30 hàng ngày
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartPulse size={15} color="#86efac" /> Hồi phục thể lực tự động theo thời gian thực
            </span>
          </div>
        </div>

        {/* Match Center Quick Action */}
        <div>
          <button
            className="btn"
            onClick={() => onSwitchTab('matches')}
            style={{
              padding: '16px 30px',
              fontSize: '1.05rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              color: '#0284c7',
              boxShadow: '0 4px 0 #cbd5e1, 0 8px 20px rgba(0,0,0,0.15)'
            }}
          >
            <Zap size={20} color="#0284c7" />
            <span>VÀO TRUNG TÂM TRẬN ĐẤU</span>
          </button>
        </div>
      </div>

      {/* Club Hero Banner */}
      <div className="glass-panel" style={{ padding: '26px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '2.5px solid #7dd3fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 900, color: '#0f172a' }}>{club.name}</h2>
              <span className="badge badge-green">{typeof club.country === 'object' ? (club.country as any)?.name || 'International' : (club.country || 'International')}</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '6px' }}>
              HLV Trưởng: <strong style={{ color: '#0284c7', fontFamily: 'var(--font-game)' }}>{club.manager?.username || 'Bạn (Manager)'}</strong> | Thành phố: {club.city || 'Châu Âu'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '28px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-game)' }}>DANH TIẾNG CLB</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Award color="#d97706" size={22} />
              <strong style={{ fontSize: '1.6rem', color: '#d97706', fontFamily: 'var(--font-game)' }}>{club.reputation}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-game)' }}>ĐIỂM XẾP HẠNG</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <TrendingUp color="#0284c7" size={22} />
              <strong style={{ fontSize: '1.6rem', color: '#0284c7', fontFamily: 'var(--font-game)' }}>{club.ranking_points}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stadium Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
            <Building2 color="#059669" size={22} />
            SÂN VẬN ĐỘNG ĐỘI NHÀ
          </h3>
          <span className="badge badge-gold">TIÊU CHUẨN FIFA PRO</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-game)' }}>TÊN SÂN</span>
            <strong style={{ display: 'block', fontSize: '1.15rem', marginTop: '6px', color: '#0f172a' }}>
              {club.stadium?.name || club.stadiums?.[0]?.name || 'Sân Vận Động Chính'}
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-game)' }}>SỨC CHỨA KHÁN GIẢ</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', marginTop: '6px', color: '#059669', fontFamily: 'var(--font-game)' }}>
              {(club.stadium?.capacity || club.stadiums?.[0]?.capacity || 45000).toLocaleString()} CHỖ NGỒI
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-game)' }}>MẶT SÂN THI ĐẤU</span>
            <strong style={{ display: 'block', fontSize: '1.15rem', marginTop: '6px', color: '#0284c7' }}>CỎ TỰ NHIÊN HYBRID</strong>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
          <Building2 color="#0284c7" size={22} />
          CƠ SỞ VẬT CHẤT CÂU LẠC BỘ (1-CLICK NÂNG CẤP)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {(club.facilities || club.club_facilities || [
            { id: '1', name: 'Trung Tâm Huấn Luyện (Training)', code: 'TRAINING', current_level: 3, status: 'OPERATIONAL' },
            { id: '2', name: 'Học Viện Đào Tạo Trẻ (Youth)', code: 'YOUTH', current_level: 2, status: 'OPERATIONAL' },
            { id: '3', name: 'Phòng Y Tế & Phục Hồi (Medical)', code: 'MEDICAL', current_level: 3, status: 'OPERATIONAL' },
            { id: '4', name: 'Văn Phòng Thương Mại (Commercial)', code: 'COMMERCIAL', current_level: 1, status: 'OPERATIONAL' },
          ]).map((facility) => (
            <div
              key={facility.id}
              className="facility-card"
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>{facility.name}</strong>
                  <span className="badge badge-gold">CẤP {facility.current_level}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>
                  ● Hoạt động tối ưu
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onUpgradeFacility(facility.id)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ArrowUpRight size={16} />
                <span>Nâng Lên Cấp {facility.current_level + 1} (€500.000)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div
          className="glass-panel"
          style={{ padding: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s ease' }}
          onClick={() => onSwitchTab('squad')}
        >
          <div style={{ fontSize: '36px' }}>👥</div>
          <div>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>QUẢN LÝ ĐỘI HÌNH</strong>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Xem thẻ bài cầu thủ FUT & chỉ số</span>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s ease' }}
          onClick={() => onSwitchTab('tactics')}
        >
          <div style={{ fontSize: '36px' }}>📋</div>
          <div>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>CHIẾN THUẬT 2D</strong>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Sơ đồ sa bàn & puck nam châm 3D</span>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s ease' }}
          onClick={() => onSwitchTab('matches')}
        >
          <div style={{ fontSize: '36px' }}>⚽</div>
          <div>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>TRUNG TÂM TRẬN ĐẤU</strong>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Mô phỏng 90 phút & bán vé SVĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
