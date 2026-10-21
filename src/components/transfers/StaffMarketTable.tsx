import { useTranslation } from '../../i18n';
import React from 'react';
import { StaffMarketItem } from '../../services/transfers.service';
import { StaffAvatar } from '../common/StaffAvatar';
import { RoleBadge } from '../common/RoleBadge';
import {
  Search,
  Filter,
  Briefcase,
  UserCheck,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface StaffMarketTableProps {
  staffList: StaffMarketItem[];
  loading: boolean;
  currentClubId: string;
  search: string;
  roleFilter: string;
  activeFilterCount?: number;
  page: number;
  totalPages: number;
  totalItems?: number;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onRoleFilterChange: (val: string) => void;
  onOpenFilterModal?: () => void;
  onResetFilters?: () => void;
  onPageChange: (p: number) => void;
  onSelectStaff?: (staff: StaffMarketItem) => void;
  onOpenOfferModal?: (staff: StaffMarketItem) => void;
  onOpenHireModal: (staff: StaffMarketItem) => void;
}

export const StaffMarketTable: React.FC<StaffMarketTableProps> = ({
  staffList,
  loading,
  currentClubId,
  search,
  roleFilter,
  activeFilterCount = 0,
  page,
  totalPages,
  totalItems,
  onSearchChange,
  onSearchSubmit,
  onRoleFilterChange,
  onOpenFilterModal,
  onResetFilters,
  onPageChange,
  onSelectStaff,
  onOpenOfferModal,
  onOpenHireModal,
}) => {
  const { t } = useTranslation();

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const getLicenseBadge = (license: string) => {
    switch (license) {
      case 'PRO':
        return <span className="badge-license badge-license-pro">PRO</span>;
      case 'A':
        return <span className="badge-license badge-license-a">A</span>;
      case 'B':
        return <span className="badge-license badge-license-b">B</span>;
      case 'C':
        return <span className="badge-license badge-license-c">C</span>;
      default:
        return <span className="badge-license badge-license-c">{license}</span>;
    }
  };

  // Tính toán danh sách số trang hiển thị dạng [1, 2, 3, '...', 10]
  const pageNumbers = React.useMemo(() => {
    const list: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else {
      list.push(1);
      if (page > 3) list.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) list.push(i);
      if (page < totalPages - 2) list.push('...');
      list.push(totalPages);
    }
    return list;
  }, [page, totalPages]);

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', borderRadius: '12px' }}>
        <form onSubmit={onSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* 1. Search input */}
          <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={t('staff_market.searching', 'Tìm kiếm theo tên nhân viên, HLV...')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 2. Quick Role Select */}
          <select
            className="input-select"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            style={{ width: '230px' }}
          >
            <option value="">{t('staff.role_all', 'Tất cả vai trò & phân loại')}</option>
            <optgroup label={t('staff.category_all', '4 Nhóm Chuyên Môn')}>
              <option value="COACH">{t('staff.type_coach', 'Huấn Luyện Viên (Coach)')}</option>
              <option value="SCOUT">{t('staff.type_scout', 'Tuyển Trạch Viên (Scout)')}</option>
              <option value="PHYSIO">{t('staff.type_physio', 'Bác Sĩ / Trị Liệu (Physio)')}</option>
              <option value="DIRECTOR">{t('staff.type_director', 'Giám Đốc / Quản Lý (Director)')}</option>
            </optgroup>
            <optgroup label={t('staff.optgroup_coaching', 'Ban Huấn Luyện Đội Một (First Team)')}>
              <option value="HEAD_COACH">{t('staff.head_coach', 'HLV Trưởng')}</option>
              <option value="ASSISTANT_COACH">{t('staff.assistant_coach', 'Trợ Lý HLV')}</option>
              <option value="FITNESS_COACH">{t('staff.fitness_coach', 'HLV Thể Lực')}</option>
              <option value="GOALKEEPING_COACH">{t('staff.gk_coach', 'HLV Thủ Môn')}</option>
            </optgroup>
            <optgroup label={t('staff.optgroup_youth_team', 'Đội Trẻ U21 & Học Viện (Youth Team)')}>
              <option value="HEAD_COACH_YOUTH">{t('staff.head_coach_youth', 'HLV Trưởng Đội Trẻ U21')}</option>
              <option value="ASSISTANT_COACH_YOUTH">{t('staff.assistant_coach_youth', 'Trợ Lý HLV Đội Trẻ U21')}</option>
              <option value="YOUTH_DIRECTOR">{t('staff.youth_director', 'Giám Đốc Đào Tạo Trẻ')}</option>
            </optgroup>
            <optgroup label={t('staff.optgroup_scouting', 'Tuyển Trạch (Scouting)')}>
              <option value="HEAD_SCOUT">{t('staff.head_scout', 'Trưởng Ban Tuyển Trạch')}</option>
              <option value="SCOUT">{t('staff.scout', 'Tuyển Trạch Viên')}</option>
            </optgroup>
            <optgroup label={t('staff.optgroup_medical', 'Y Tế & Thể Trạng (Medical)')}>
              <option value="CHIEF_PHYSIO">{t('staff.chief_physio', 'Trưởng Ban Y Tế')}</option>
              <option value="PHYSIO">{t('staff.physio', 'Bác Sĩ / Trị Liệu')}</option>
            </optgroup>
            <optgroup label={t('staff.optgroup_director', 'Ban Giám Đốc (Board & Directors)')}>
              <option value="TECHNICAL_DIRECTOR">{t('staff.technical_director', 'Giám Đốc Kỹ Thuật')}</option>
              <option value="SCOUT_DIRECTOR">{t('staff.scout_director', 'Giám Đốc Tuyển Trạch')}</option>
              <option value="PHYSIO_DIRECTOR">{t('staff.physio_director', 'Giám Đốc Y Tế')}</option>
              <option value="FINANCIAL_DIRECTOR">{t('staff.financial_director', 'Giám Đốc Tài Chính')}</option>
            </optgroup>
          </select>

          {/* 3. Search submit button */}
          <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.45rem', padding: '0.5rem 1rem' }}>
            <Search size={15} />
            <span>{t('common.search', 'Tìm kiếm')}</span>
          </button>

          {/* 4. Open Advanced Filter Modal Button */}
          {onOpenFilterModal && (
            <button
              type="button"
              onClick={onOpenFilterModal}
              className={`btn btn-sm flex-center ${activeFilterCount > 0 ? 'btn-primary' : 'btn-outline'}`}
              style={{
                gap: '0.5rem',
                padding: '0.5rem 1.1rem',
                borderColor: activeFilterCount > 0 ? '#0284c7' : '#cbd5e1',
                background: activeFilterCount > 0 ? '#0284c7' : '#ffffff',
                color: activeFilterCount > 0 ? '#ffffff' : '#334155',
                fontWeight: 700,
              }}
              title={t('staff_filter.subtitle', 'Bộ lọc chuyên sâu cho ban huấn luyện')}
            >
              <SlidersHorizontal size={15} />
              <span>{t('staff_filter.btn', 'Kỹ Năng & Lọc Chi Tiết')}</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: '#ffffff',
                    color: '#0284c7',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* 5. Nút Reset Filters khi có filter đang kích hoạt */}
          {activeFilterCount > 0 && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="btn btn-sm btn-outline flex-center"
              style={{
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                color: '#ef4444',
                borderColor: '#fca5a5',
                background: '#fef2f2',
                fontWeight: 600,
              }}
              title={t('common.reset_filters', 'Xóa toàn bộ bộ lọc')}
            >
              <RotateCcw size={14} />
              <span>{t('common.reset', 'Đặt lại')}</span>
            </button>
          )}
        </form>
      </div>

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th className="th-left" style={{ width: '24%' }}>{t('staff_market.th_staff', 'Nhân Viên')}</th>
              <th className="th-center" style={{ width: '7%' }}>{t('staff_market.th_ovr', 'OVR')}</th>
              <th className="th-center" style={{ width: '14%' }}>{t('staff_market.th_role', 'Vai Trò')}</th>
              <th className="th-center" style={{ width: '8%' }}>{t('staff_market.th_license', 'Bằng Cấp')}</th>
              <th className="th-left" style={{ width: '12%' }}>{t('staff_market.th_philosophy', 'Triết Lý')}</th>
              <th className="th-left" style={{ width: '12%' }}>{t('staff_market.th_formation', 'Sơ Đồ Sở Trường')}</th>
              <th className="th-right" style={{ width: '12%' }}>{t('staff_market.th_wage_fee', 'Lương / Phí Tuyển')}</th>
              <th className="th-center" style={{ width: '11%' }}>{t('staff_market.th_actions', 'Thao Tác')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                  {t('staff_market.searching', 'Đang tìm kiếm danh sách ban huấn luyện và nhân sự...')}
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  {t('staff_market.no_results', 'Không tìm thấy nhân sự phù hợp với tiêu chí tìm kiếm.')}
                </td>
              </tr>
            ) : (
              staffList.map((st) => {
                const isOwnClub = st.currentClub?.id === currentClubId;
                const styleKey = st.tacticalStyle ? st.tacticalStyle.toLowerCase() : '';
                const styleLabel = styleKey ? t(`staff.style_${styleKey}`, st.tacticalStyle) : (st.tacticalStyle || 'BALANCED');
                const staffOvr = st.ovr || st.overall_rating || 60;
                const ovrColor = staffOvr >= 65 ? '#10b981' : staffOvr >= 55 ? '#0284c7' : '#64748b';
                const ovrBg = staffOvr >= 65 ? 'rgba(16, 185, 129, 0.12)' : staffOvr >= 55 ? 'rgba(2, 132, 199, 0.12)' : 'rgba(100, 116, 139, 0.12)';

                return (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStaff?.(st)}
                    style={{ cursor: 'pointer' }}
                    title={t('staff.view_profile', 'Xem hồ sơ')}
                  >
                    {/* Nhân Viên */}
                    <td className="td-left">
                      <div className="staff-info-cell">
                        <StaffAvatar
                          name={st.name}
                          role={st.role || st.staffType}
                          photoUrl={st.photoUrl || (st as any).photo_url}
                          size={40}
                        />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-bright)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={st.name}
                          >
                            {st.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'nowrap' }}>
                            {st.age && (
                              <span style={{ fontWeight: 600, color: '#334155' }}>
                                {t('staff.age_format', '{age} tuổi').replace('{age}', String(st.age))}
                              </span>
                            )}
                            {st.birth_season_day && (
                              <span>• {t('common.date', 'Ngày')} {st.birth_season_day}</span>
                            )}
                            {st.nationality && (
                              <span>• {st.nationality}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* OVR */}
                    <td className="td-center">
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                          color: ovrColor,
                          background: ovrBg,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {staffOvr}
                      </span>
                    </td>

                    {/* Vai Trò */}
                    <td className="td-center">
                      <RoleBadge role={st.role || st.staffType} />
                    </td>

                    {/* Bằng Cấp */}
                    <td className="td-center">
                      {st.coachingLicense ? getLicenseBadge(st.coachingLicense) : '-'}
                    </td>

                    {/* Triết Lý */}
                    <td className="td-left" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-main)' }}>{styleLabel}</span>
                    </td>

                    {/* Sơ Đồ Sở Trường */}
                    <td className="td-left" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {st.preferredFormation?.name || t('staff_market.default_formation', 'Mặc định')}
                    </td>

                    {/* Lương / Phí Tuyển */}
                    <td className="td-right">
                      <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.88rem' }}>
                        {formatMoney(st.wage)}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{t('common.per_week', '/tuần')}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        {t('staff_market.fee_prefix', 'Phí:')} {formatMoney(st.signingFee)}
                      </div>
                    </td>

                    {/* Thao Tác */}
                    <td className="td-center" onClick={(e) => e.stopPropagation()}>
                      {isOwnClub ? (
                        <span className="badge badge-success flex-center" style={{ gap: '0.25rem', margin: '0 auto', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                          <UserCheck size={13} /> {t('staff_market.serving_badge', 'Đang phục vụ')}
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary flex-center"
                          style={{ gap: '0.35rem', margin: '0 auto' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenOfferModal) {
                              onOpenOfferModal(st);
                            } else {
                              onOpenHireModal(st);
                            }
                          }}
                        >
                          <Briefcase size={14} /> {t('staff_market.hire_btn', 'Tuyển Mộ')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Numbered Pagination matching PlayerMarketTable */}
        {totalPages > 0 && (
          <div
            className="flex-center"
            style={{
              justifyContent: 'space-between',
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Hiển thị số lượng nhân sự và trang */}
            <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>
                {t('common.page_info', 'Trang {page} / {totalPages}')
                  .replace('{page}', String(page))
                  .replace('{totalPages}', String(totalPages))}
              </span>
              {totalItems !== undefined && totalItems > 0 && (
                <span style={{ color: '#94a3b8' }}>
                  ({t('common.total_staff', 'Tổng cộng {total} nhân sự').replace('{total}', Number(totalItems).toLocaleString())})
                </span>
              )}
            </div>

            {/* Danh sách các nút phân trang 1, 2, 3... */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {/* Nút về trang đầu « */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page <= 1}
                onClick={() => onPageChange(1)}
                title={t('common.first_page', 'Trang đầu')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page <= 1 ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Nút Trang trước ‹ */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                title={t('common.prev_page', 'Trang trước')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page <= 1 ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronLeft size={15} />
              </button>

              {/* Các nút số trang 1, 2, 3... */}
              {pageNumbers.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        padding: '0 6px',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        userSelect: 'none',
                      }}
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(p);
                const isActive = pageNum === page;

                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    style={{
                      minWidth: '32px',
                      height: '30px',
                      padding: '0 6px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 600,
                      border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      background: isActive ? '#0284c7' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? '0 2px 4px rgba(2, 132, 199, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Nút Trang sau › */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                title={t('common.next_page', 'Trang sau')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page >= totalPages ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronRight size={15} />
              </button>

              {/* Nút đến trang cuối » */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange(totalPages)}
                title={t('common.last_page', 'Trang cuối')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page >= totalPages ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
