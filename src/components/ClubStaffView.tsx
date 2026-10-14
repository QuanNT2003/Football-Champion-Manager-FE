import { useTranslation } from '../i18n';
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Briefcase,
  Star,
  Plus,
  AlertTriangle,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { transfersApi, StaffMarketItem } from '../services/transfers.service';
import { StaffDetailModal } from './StaffDetailModal';
import { StaffAvatar } from './common/StaffAvatar';
import { RoleBadge } from './common/RoleBadge';

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
  const { t } = useTranslation();
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

  const getLicenseBadge = (license: string) => {
    switch (license) {
      case 'PRO':
        return { text: 'PRO', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' };
      case 'A':
        return { text: 'A', bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' };
      case 'B':
        return { text: 'B', bg: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff' };
      case 'C':
        return { text: 'C', bg: 'linear-gradient(135deg, #64748b, #475569)', color: '#ffffff' };
      default:
        return { text: license || 'C', bg: '#e2e8f0', color: '#475569' };
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
  const headCoach = staffList.find((s) => s.staffType === 'HEAD_COACH' || s.staffType === 'HEAD_COACH_YOUTH') || staffList[0];

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
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('staff.total_members', 'Quy Mô Nhân Sự')}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              {staffList.length} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{t('staff.member_unit', 'thành viên')}</span>
            </div>
          </div>
        </div>

        {/* Total Weekly Wages */}
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
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('staff.total_wage_bill', 'Tổng Quỹ Lương Staff')}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>
              {formatMoney(totalWage)} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{t('staff.per_week', '/ tuần')}</span>
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
          {headCoach ? (
            <StaffAvatar
              name={headCoach.name}
              role={headCoach.staffType}
              photoUrl={headCoach.photoUrl || (headCoach as any).photo_url}
              size={48}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={24} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('staff.current_head_coach', 'HLV Trưởng Hiện Tại')}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: headCoach ? '#0f172a' : '#dc2626' }}>
              {headCoach ? headCoach.name : t('staff.no_head_coach', 'Chưa Có HLV Trưởng!')}
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
              placeholder={t('staff.search_placeholder', 'Tìm theo tên nhân sự, quốc gia...')}
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
            <Filter size={16} color="#64748b" />
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
              <option value="ALL">{t('staff.role_all', 'Tất cả vai trò')}</option>
              <option value="HEAD_COACH">{t('staff.head_coach', 'HLV Trưởng')}</option>
              <option value="ASSISTANT_COACH">{t('staff.assistant_coach', 'Trợ Lý HLV')}</option>
              <option value="HEAD_COACH_YOUTH">{t('staff.head_coach_youth', 'HLV Trưởng Đội Trẻ U21')}</option>
              <option value="ASSISTANT_COACH_YOUTH">{t('staff.assistant_coach_youth', 'Trợ Lý HLV Đội Trẻ U21')}</option>
              <option value="FITNESS_COACH">{t('staff.fitness_coach', 'HLV Thể Lực')}</option>
              <option value="GOALKEEPING_COACH">{t('staff.gk_coach', 'HLV Thủ Môn')}</option>
              <option value="SCOUT">{t('staff.scout_short', 'Tuyển Trạch Viên')}</option>
              <option value="PHYSIO">{t('staff.physio_short', 'Bác Sĩ / Trị Liệu')}</option>
              <option value="YOUTH_DIRECTOR">{t('staff.youth_director', 'GĐ Đào Tạo Trẻ')}</option>
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
            <span>{t('staff.hire_more_btn', 'Tuyển Thêm Nhân Sự')}</span>
          </button>
        )}
      </div>

      {/* 3. Danh sách thẻ nhân sự trong CLB */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 1rem' }} />
          <div style={{ color: '#64748b' }}>{t('staff.loading_club_staff', 'Đang nạp dữ liệu ban huấn luyện CLB...')}</div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <Users size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: '#0f172a' }}>
            {t('staff.empty_club_staff', 'Chưa Có Nhân Sự Nào')}
          </h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            {t('staff.empty_club_staff_desc', 'Hãy ghé qua Thị trường Tuyển mộ để ký hợp đồng với những chuyên gia bóng đá hàng đầu.')}
          </p>
          {onNavigateToMarket && (
            <button
              type="button"
              onClick={onNavigateToMarket}
              className="btn btn-primary"
              style={{ marginTop: '1.25rem', padding: '0.55rem 1.25rem', fontWeight: 800 }}
            >
              {t('staff.go_to_market_btn', 'Đến Thị Trường Tuyển Mộ')}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredStaff.map((st) => {
            const licenseBadge = getLicenseBadge(st.coachingLicense);
            const styleKey = st.tacticalStyle ? st.tacticalStyle.toLowerCase() : '';
            const styleLabel = styleKey ? t(`staff.style_${styleKey}`, st.tacticalStyle) : (st.tacticalStyle || 'BALANCED');

            return (
              <div
                key={st.id}
                onClick={() => setSelectedStaff(st)}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
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
                    <StaffAvatar
                      name={st.name}
                      role={st.staffType}
                      photoUrl={st.photoUrl || (st as any).photo_url}
                      size={52}
                      style={{ borderRadius: '12px' }}
                    />
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
                      <RoleBadge role={st.staffType} size="sm" />

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
                    <span style={{ color: '#64748b' }}>{t('staff.philosophy_label', 'Triết lý:')} </span>
                    <strong style={{ color: '#16a34a' }}>{styleLabel}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>{t('staff.formation_label', 'Sơ đồ:')} </span>
                    <strong style={{ color: '#0f172a' }}>{st.preferredFormation?.name || '4-3-3'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>{t('staff.weekly_wage_label', 'Lương tuần:')} </span>
                    <strong style={{ color: '#d97706' }}>{formatMoney(st.wage)}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ color: '#64748b' }}>{t('staff.reputation_label', 'Danh tiếng:')} </span>
                    {renderStars(st.reputation)}
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', paddingTop: '0.25rem' }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <UserCheck size={14} /> {t('staff.official_contract', 'Hợp đồng chính thức')}
                  </span>
                  <span style={{ color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    {t('staff.view_profile', 'Xem hồ sơ')} <ChevronRight size={14} />
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
          onOfferSuccess={() => {
            loadClubStaff();
          }}
        />
      )}
    </div>
  );
};
