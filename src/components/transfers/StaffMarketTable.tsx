import { useTranslation } from '../../i18n';
import React from 'react';
import { StaffMarketItem } from '../../services/transfers.service';
import { StaffAvatar } from '../common/StaffAvatar';
import { RoleBadge } from '../common/RoleBadge';
import { Search, Filter, Briefcase, UserCheck } from 'lucide-react';

interface StaffMarketTableProps {
  staffList: StaffMarketItem[];
  loading: boolean;
  currentClubId: string;
  search: string;
  roleFilter: string;
  page: number;
  totalPages: number;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onRoleFilterChange: (val: string) => void;
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
  page,
  totalPages,
  onSearchChange,
  onSearchSubmit,
  onRoleFilterChange,
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

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <form onSubmit={onSearchSubmit} className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
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

          <select
            className="input-select"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            style={{ width: '220px' }}
          >
            <option value="">{t('staff.role_all', 'Tất cả vai trò')}</option>
            <option value="HEAD_COACH">{t('staff.head_coach', 'HLV Trưởng')}</option>
            <option value="ASSISTANT_COACH">{t('staff.assistant_coach', 'Trợ Lý HLV')}</option>
            <option value="FITNESS_COACH">{t('staff.fitness_coach', 'HLV Thể Lực')}</option>
            <option value="GOALKEEPING_COACH">{t('staff.gk_coach', 'HLV Thủ Môn')}</option>
            <option value="SCOUT">{t('staff.scout_short', 'Tuyển Trạch Viên')}</option>
            <option value="PHYSIO">{t('staff.physio_short', 'Bác Sĩ / Trị Liệu')}</option>
            <option value="YOUTH_DIRECTOR">{t('staff.youth_director', 'GĐ Đào Tạo Trẻ')}</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.4rem' }}>
            <Filter size={16} /> {t('common.filter', 'Lọc')}
          </button>
        </form>
      </div>

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th className="th-left" style={{ width: '24%' }}>{t('staff_market.th_staff', 'Nhân Viên')}</th>
              <th className="th-center" style={{ width: '13%' }}>{t('staff_market.th_role', 'Vai Trò')}</th>
              <th className="th-center" style={{ width: '8%' }}>{t('staff_market.th_license', 'Bằng Cấp')}</th>
              <th className="th-left" style={{ width: '13%' }}>{t('staff_market.th_philosophy', 'Triết Lý')}</th>
              <th className="th-left" style={{ width: '12%' }}>{t('staff_market.th_formation', 'Sơ Đồ Sở Trường')}</th>
              <th className="th-center" style={{ width: '8%' }}>{t('staff_market.th_reputation', 'Danh Tiếng')}</th>
              <th className="th-right" style={{ width: '11%' }}>{t('staff_market.th_wage_fee', 'Lương / Phí Tuyển')}</th>
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
                          role={st.staffType}
                          photoUrl={st.photoUrl || (st as any).photo_url}
                          size={38}
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {st.nationality || t('common.international', 'Quốc tế')} {st.countryCode ? `(${st.countryCode})` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vai Trò */}
                    <td className="td-center">
                      <RoleBadge role={st.staffType} size="sm" />
                    </td>

                    {/* Bằng Cấp */}
                    <td className="td-center">
                      {getLicenseBadge(st.coachingLicense)}
                    </td>

                    {/* Triết Lý */}
                    <td className="td-left">
                      <span className="tactical-style-tag" title={styleLabel}>
                        {styleLabel}
                      </span>
                    </td>

                    {/* Sơ Đồ Sở Trường */}
                    <td className="td-left">
                      {st.preferredFormation ? (
                        <span style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
                          {st.preferredFormation.name}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{t('staff_market.default_formation', 'Mặc định')}</span>
                      )}
                    </td>

                    {/* Danh Tiếng */}
                    <td className="td-center">
                      <span className="ovr-chip" style={{ background: '#1e293b', color: '#f59e0b', border: '1px solid #f59e0b' }}>
                        {Math.round(st.reputation / 100) || 75}
                      </span>
                    </td>

                    {/* Lương / Phí */}
                    <td className="td-right">
                      <div style={{ fontWeight: 700, color: '#059669' }}>
                        {formatMoney(st.wage)} {t('staff.per_week', '/ tuần')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {t('staff_market.fee_prefix', 'Phí:')} {formatMoney(st.signingFee)}
                      </div>
                    </td>

                    {/* Thao Tác */}
                    <td className="td-center">
                      {isOwnClub ? (
                        <span className="badge badge-success flex-center" style={{ gap: '0.25rem', margin: '0 auto' }}>
                          <UserCheck size={12} /> {t('staff_market.serving_badge', 'Đang phục vụ')}
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

        {/* Pagination */}
        <div className="flex-center" style={{ justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t('common.page', 'Trang')} {page} / {totalPages}</span>
          <div className="btn-group">
            <button
              className="btn btn-xs btn-outline"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              {t('staff_market.prev_page', 'Trang trước')}
            </button>
            <button
              className="btn btn-xs btn-outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t('staff_market.next_page', 'Trang sau')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
