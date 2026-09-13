import React from 'react';
import { Club, TimelineData } from '../types';
import { Shield, Building2, MapPin, Award, Users, ArrowUpRight, TrendingUp, Calendar, HeartPulse, DollarSign, Clock, Radio } from 'lucide-react';

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
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>
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

      {/* Online Matchday Schedule Banner */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <Radio size={14} /> MÁY CHỦ TRỰC TUYẾN
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Mùa giải: <strong style={{ color: '#38bdf8' }}>Mùa {timeline?.season?.season_number || 1}</strong>
            </span>
          </div>

          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Vòng Đấu {currentDay} / {totalDays}
          </h2>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', margin: '10px 0' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #06d6a0)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} color="#38bdf8" /> Trận đấu máy chủ diễn ra theo lịch cố định hàng ngày
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HeartPulse size={14} color="#10b981" /> Thể lực cầu thủ tự động hồi phục theo thời gian thực
            </span>
          </div>
        </div>

        {/* Match Center Quick Action */}
        <div>
          <button
            className="btn btn-primary"
            onClick={() => onSwitchTab('matches')}
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 800,
              fontFamily: 'Outfit',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>⚽ Vào Trung Tâm Trận Đấu</span>
          </button>
        </div>
      </div>

      {/* Club Hero Banner */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '2px solid #7dd3fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800 }}>{club.name}</h2>
              <span className="badge badge-green">{typeof club.country === 'object' ? (club.country as any)?.name || 'International' : (club.country || 'International')}</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
              HLV Trưởng: <strong style={{ color: '#0f172a' }}>{club.manager?.username || 'Bạn (Manager)'}</strong> | Thành phố: {club.city || 'Châu Âu'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Danh Tiếng (Reputation)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <Award color="#f59e0b" size={20} />
              <strong style={{ fontSize: '1.4rem', color: '#f59e0b', fontFamily: 'Outfit' }}>{club.reputation}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Điểm Xếp Hạng</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <TrendingUp color="#3b82f6" size={20} />
              <strong style={{ fontSize: '1.4rem', color: '#3b82f6', fontFamily: 'Outfit' }}>{club.ranking_points}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stadium Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 color="#10b981" size={22} />
            Sân Vận Động Đội Nhà
          </h3>
          <span className="badge badge-gold">TIÊU CHUẨN FIFA</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Tên Sân</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', marginTop: '4px' }}>
              {club.stadium?.name || club.stadiums?.[0]?.name || 'Sân Vận Động Chính'}
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sức Chứa Khán Giả</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', marginTop: '4px', color: '#06d6a0' }}>
              {(club.stadium?.capacity || club.stadiums?.[0]?.capacity || 45000).toLocaleString()} Chỗ Ngồi
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Mặt Sân</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', marginTop: '4px' }}>Cỏ Tự Nhiên Hybrid</strong>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 color="#3b82f6" size={22} />
          Cơ Sở Vật Chất Câu Lạc Bộ (1-Click Nâng Cấp)
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
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{facility.name}</strong>
                  <span className="badge badge-gold">Cấp {facility.current_level}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Trạng thái: Hoạt động tối ưu
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
          style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          onClick={() => onSwitchTab('squad')}
        >
          <div style={{ fontSize: '32px' }}>👥</div>
          <div>
            <strong style={{ display: 'block', fontSize: '1.05rem' }}>Quản Lý Đội Hình</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Xem danh sách cầu thủ & chỉ số</span>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          onClick={() => onSwitchTab('tactics')}
        >
          <div style={{ fontSize: '32px' }}>📋</div>
          <div>
            <strong style={{ display: 'block', fontSize: '1.05rem' }}>Chiến Thuật 2D</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sơ đồ 4-3-3 & đội hình ra sân</span>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          onClick={() => onSwitchTab('matches')}
        >
          <div style={{ fontSize: '32px' }}>⚽</div>
          <div>
            <strong style={{ display: 'block', fontSize: '1.05rem' }}>Trung Tâm Trận Đấu</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mô phỏng 90 phút & bán vé</span>
          </div>
        </div>
      </div>
    </div>
  );
};
