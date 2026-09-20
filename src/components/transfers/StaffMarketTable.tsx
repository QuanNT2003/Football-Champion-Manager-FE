import React from 'react';
import { StaffMarketItem } from '../../services/transfers.service';
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
  onOpenHireModal,
}) => {
  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const getStaffRoleLabel = (role: string) => {
    switch (role) {
      case 'HEAD_COACH':
        return { label: 'HLV Trưởng', class: 'badge-role-head' };
      case 'ASSISTANT_COACH':
        return { label: 'Trợ lý HLV', class: 'badge-role-assistant' };
      case 'FITNESS_COACH':
        return { label: 'HLV Thể lực', class: 'badge-role-fitness' };
      case 'SCOUT':
        return { label: 'Tuyển trạch viên', class: 'badge-role-scout' };
      case 'PHYSIO':
        return { label: 'Bác sĩ / Y tế', class: 'badge-role-physio' };
      default:
        return { label: role, class: 'badge-outline' };
    }
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
              placeholder="Tìm kiếm theo tên nhân viên, HLV..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            className="input-select"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="HEAD_COACH">HLV Trưởng</option>
            <option value="ASSISTANT_COACH">Trợ lý HLV</option>
            <option value="FITNESS_COACH">HLV Thể lực</option>
            <option value="SCOUT">Tuyển trạch viên</option>
            <option value="PHYSIO">Bác sĩ / Y tế</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.4rem' }}>
            <Filter size={16} /> Lọc
          </button>
        </form>
      </div>

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th className="th-left" style={{ width: '23%' }}>Nhân Viên</th>
              <th className="th-center" style={{ width: '12%' }}>Vai Trò</th>
              <th className="th-center" style={{ width: '8%' }}>Bằng Cấp</th>
              <th className="th-left" style={{ width: '13%' }}>Triết Lý</th>
              <th className="th-left" style={{ width: '13%' }}>Sơ Đồ Sở Trường</th>
              <th className="th-center" style={{ width: '8%' }}>Danh Tiếng</th>
              <th className="th-right" style={{ width: '12%' }}>Lương / Phí Tuyển</th>
              <th className="th-center" style={{ width: '11%' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                  Đang tìm kiếm danh sách ban huấn luyện và nhân sự...
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  Không tìm thấy nhân sự phù hợp với tiêu chí tìm kiếm.
                </td>
              </tr>
            ) : (
              staffList.map((st) => {
                const roleInfo = getStaffRoleLabel(st.staffType);
                const isOwnClub = st.currentClub?.id === currentClubId;

                return (
                  <tr key={st.id}>
                    {/* Nhân Viên */}
                    <td className="td-left">
                      <div className="staff-info-cell">
                        <div
                          className="player-avatar-sm"
                          style={{
                            background: '#f1f5f9',
                            border: '1.5px solid #94a3b8',
                            color: '#0f172a'
                          }}
                        >
                          {st.name.charAt(0).toUpperCase()}
                        </div>
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
                            {st.nationality || 'Quốc tế'} {st.countryCode ? `(${st.countryCode})` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vai Trò */}
                    <td className="td-center">
                      <span className={`badge-role ${roleInfo.class}`}>
                        {roleInfo.label}
                      </span>
                    </td>

                    {/* Bằng Cấp */}
                    <td className="td-center">
                      {getLicenseBadge(st.coachingLicense)}
                    </td>

                    {/* Triết Lý */}
                    <td className="td-left">
                      <span className="tactical-style-tag">
                        {st.tacticalStyle || 'BALANCED'}
                      </span>
                    </td>

                    {/* Sơ Đồ Sở Trường */}
                    <td className="td-left">
                      {st.preferredFormation ? (
                        <span style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
                          {st.preferredFormation.name}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Mặc định</span>
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
                        {formatMoney(st.wage)}/tuần
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Phí: {formatMoney(st.signingFee)}
                      </div>
                    </td>

                    {/* Thao Tác */}
                    <td className="td-center">
                      {isOwnClub ? (
                        <span className="badge badge-success flex-center" style={{ gap: '0.25rem', margin: '0 auto' }}>
                          <UserCheck size={12} /> Đang phục vụ
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary flex-center"
                          style={{ gap: '0.35rem', margin: '0 auto' }}
                          onClick={() => onOpenHireModal(st)}
                        >
                          <Briefcase size={14} /> Tuyển Dụng
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
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Trang {page} / {totalPages}</span>
          <div className="btn-group">
            <button
              className="btn btn-xs btn-outline"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              Trang trước
            </button>
            <button
              className="btn btn-xs btn-outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
