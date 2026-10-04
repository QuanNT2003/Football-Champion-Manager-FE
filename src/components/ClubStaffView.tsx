import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Briefcase,
  Award,
  Calendar,
  Clock,
  Shield,
  Star,
  Plus,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Compass,
} from 'lucide-react';
import { transfersApi, StaffMarketItem } from '../services/transfers.service';
import { StaffDetailModal } from './StaffDetailModal';

interface Props {
  clubId: string;
  cashBalance?: number;
  onNavigateToMarket?: () => void;
}

export const ClubStaffView: React.FC<Props> = ({
  clubId,
  cashBalance,
  onNavigateToMarket,
}) => {
  const [staffList, setStaffList] = useState<StaffMarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedStaff, setSelectedStaff] = useState<StaffMarketItem | null>(null);

  const loadClubStaff = async () => {
    if (!clubId) return;
    try {
      setLoading(true);
      const data = await transfersApi.getClubStaff(clubId);
      setStaffList(data || []);
    } catch (err) {
      console.error('Failed to load club staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubStaff();
  }, [clubId]);

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'HEAD_COACH':
        return { label: 'HLV Trưởng', color: '#16a34a', bg: '#dcfce7' };
      case 'ASSISTANT_COACH':
        return { label: 'Trợ Lý HLV', color: '#0284c7', bg: '#e0f2fe' };
      case 'FITNESS_COACH':
        return { label: 'HLV Thể Lực', color: '#ea580c', bg: '#ffedd5' };
      case 'GOALKEEPING_COACH':
        return { label: 'HLV Thủ Môn', color: '#7c3aed', bg: '#ede9fe' };
      case 'SCOUT':
        return { label: 'Tuyển Trạch Viên', color: '#4f46e5', bg: '#e0e7ff' };
      case 'PHYSIO':
        return { label: 'Bác Sĩ / Trị Liệu', color: '#db2777', bg: '#fce7f3' };
      case 'YOUTH_DIRECTOR':
        return { label: 'GĐ Đào Tạo Trẻ', color: '#059669', bg: '#d1fae5' };
      default:
        return { label: role, color: '#475569', bg: '#f1f5f9' };
    }
  };

  const getLicenseBadge = (license: string) => {
    switch (license) {
      case 'PRO':
        return { text: 'PRO', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' };
      case 'A':
        return { text: 'A', bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' };
      case 'B':
        return { text: 'B', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff' };
      case 'C':
        return { text: 'C', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#ffffff' };
      default:
        return { text: license, bg: '#94a3b8', color: '#ffffff' };
    }
  };

  const renderStars = (reputation: number) => {
    const starCount = Math.min(5, Math.max(1, Math.round(reputation / 2000)));
    return (
      <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={12}
            style={{
              color: i <= starCount ? '#f59e0b' : '#cbd5e1',
              fill: i <= starCount ? '#f59e0b' : 'none',
            }}
          />
        ))}
      </div>
    );
  };

  // Filtered staff
  const filteredStaff = staffList.filter((s) => {
    if (roleFilter !== 'ALL' && s.staffType !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRole = s.staffType.toLowerCase().includes(q);
      const matchNat = s.nationality?.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchNat) return false;
    }
    return true;
  });

  // Calculate telemetry
  const totalWage = staffList.reduce((acc, cur) => acc + (cur.wage || 0), 0);
  const headCoach = staffList.find((s) => s.staffType === 'HEAD_COACH');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Total Staff */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Quy Mô Ban Huấn Luyện
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
              {staffList.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>thành viên</span>
            </div>
          </div>
        </div>

        {/* Total Weekly Wage */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Tổng Quỹ Lương Nhân Sự
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>
              {formatMoney(totalWage)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/ tuần</span>
            </div>
          </div>
        </div>

        {/* Head Coach Status */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: headCoach ? '#e0f2fe' : '#fee2e2',
              color: headCoach ? '#0284c7' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {headCoach ? <UserCheck size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              HLV Trưởng Hiện Tại
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: headCoach ? '#0f172a' : '#dc2626' }}>
              {headCoach ? headCoach.name : 'Chưa Có HLV Trưởng!'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Filter, Search, Action */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tên nhân sự, quốc gia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
              }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="#64748b" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
              }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="HEAD_COACH">HLV Trưởng</option>
              <option value="ASSISTANT_COACH">Trợ lý HLV</option>
              <option value="FITNESS_COACH">HLV Thể lực</option>
              <option value="GOALKEEPING_COACH">HLV Thủ môn</option>
              <option value="SCOUT">Tuyển trạch viên</option>
              <option value="PHYSIO">Bác sĩ / Y tế</option>
              <option value="YOUTH_DIRECTOR">GĐ Đào tạo trẻ</option>
            </select>
          </div>
        </div>

        {/* Nút Tuyển thêm nhân sự */}
        {onNavigateToMarket && (
          <button
            type="button"
            onClick={onNavigateToMarket}
            className="btn btn-sm btn-primary flex-center"
            style={{
              padding: '0.55rem 1.15rem',
              fontWeight: 800,
              gap: '0.45rem',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)',
            }}
          >
            <Plus size={16} />
            <span>Tuyển Thêm Nhân Sự</span>
          </button>
        )}
      </div>

      {/* 3. Danh Sách Staff (Grid Layout) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 0.75rem' }} />
          <div>Đang tải danh sách ban huấn luyện CLB...</div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Briefcase size={40} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: '#0f172a' }}>
            Chưa có nhân sự nào phù hợp
          </h4>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem' }}>
            {staffList.length === 0
              ? 'CLB của bạn hiện chưa có nhân sự nào trong ban huấn luyện. Hãy tuyển mộ thêm từ thị trường tự do!'
              : 'Không tìm thấy nhân viên nào khớp với bộ lọc hiện tại.'}
          </p>
          {onNavigateToMarket && staffList.length === 0 && (
            <button
              type="button"
              onClick={onNavigateToMarket}
              className="btn btn-sm btn-primary"
              style={{ padding: '0.65rem 1.35rem', fontWeight: 800, borderRadius: '8px' }}
            >
              Khám Phá Thị Trường Nhân Sự
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1rem' }}>
          {filteredStaff.map((st) => {
            const roleBadge = getRoleBadge(st.staffType);
            const licenseBadge = getLicenseBadge(st.coachingLicense);

            return (
              <div
                key={st.id}
                onClick={() => setSelectedStaff(st)}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.15rem 1.25rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Header: Avatar, Name, License, Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ position: 'relative' }}>
                    {st.photoUrl ? (
                      <img
                        src={st.photoUrl}
                        alt=""
                        style={{ width: 52, height: 52, borderRadius: '12px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.25rem',
                        }}
                      >
                        {st.name.charAt(0)}
                      </div>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        background: licenseBadge.bg,
                        color: licenseBadge.color,
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    >
                      {licenseBadge.text}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.96rem',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {st.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <span
                        style={{
                          background: roleBadge.bg,
                          color: roleBadge.color,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                        }}
                      >
                        {roleBadge.label}
                      </span>

                      <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {st.countryFlag && <img src={st.countryFlag} alt="" style={{ width: 14, height: 10, borderRadius: 2 }} />}
                        <span>{st.countryCode || st.nationality}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Specs */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.82rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b' }}>Triết lý: </span>
                    <strong style={{ color: '#16a34a' }}>{st.tacticalStyle || 'BALANCED'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Sơ đồ: </span>
                    <strong style={{ color: '#0f172a' }}>{st.preferredFormation?.name || '4-3-3'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Lương tuần: </span>
                    <strong style={{ color: '#d97706' }}>{formatMoney(st.wage)}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ color: '#64748b' }}>Danh tiếng: </span>
                    {renderStars(st.reputation)}
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', paddingTop: '0.25rem' }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <UserCheck size={14} /> Hợp đồng chính thức
                  </span>
                  <span style={{ color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Xem hồ sơ <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL CHI TIẾT NHÂN SỰ KHI CLICK VÀO ITEM */}
      {selectedStaff && (
        <StaffDetailModal
          staff={selectedStaff}
          staffList={staffList}
          currentClubId={clubId}
          cashBalance={cashBalance}
          onClose={() => setSelectedStaff(null)}
          onSelectStaff={(st) => setSelectedStaff(st)}
          onOfferSuccess={() => loadClubStaff()}
        />
      )}
    </div>
  );
};
