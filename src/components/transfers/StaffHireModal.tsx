import React from 'react';
import { StaffMarketItem } from '../../services/transfers.service';
import { Briefcase, X, ShieldAlert } from 'lucide-react';

interface StaffHireModalProps {
  staff: StaffMarketItem | null;
  cashBalance: number;
  hiring: boolean;
  error: string;
  success: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const StaffHireModal: React.FC<StaffHireModalProps> = ({
  staff,
  cashBalance,
  hiring,
  error,
  success,
  onClose,
  onConfirm,
}) => {
  if (!staff) return null;

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const getStaffRoleLabel = (role: string) => {
    switch (role) {
      case 'HEAD_COACH': return { label: 'HLV Trưởng', class: 'badge-role-head' };
      case 'ASSISTANT_COACH': return { label: 'Trợ lý HLV', class: 'badge-role-assistant' };
      case 'FITNESS_COACH': return { label: 'HLV Thể lực', class: 'badge-role-fitness' };
      case 'SCOUT': return { label: 'Tuyển trạch viên', class: 'badge-role-scout' };
      case 'PHYSIO': return { label: 'Bác sĩ / Y tế', class: 'badge-role-physio' };
      default: return { label: role, class: 'badge-outline' };
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={22} className="text-primary" />
            Tuyển Dụng Nhân Viên
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted">Họ và Tên:</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{staff.name}</span>
          </div>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted">Vai Trò:</span>
            <span className={`badge-role ${getStaffRoleLabel(staff.staffType).class}`}>
              {getStaffRoleLabel(staff.staffType).label}
            </span>
          </div>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted">Bằng Cấp Huấn Luyện:</span>
            <span className={`badge-license badge-license-${staff.coachingLicense.toLowerCase()}`}>{staff.coachingLicense}</span>
          </div>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted">Triết Lý:</span>
            <span className="tactical-style-tag">{staff.tacticalStyle || 'BALANCED'}</span>
          </div>
          {staff.preferredFormation && (
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Sơ Đồ Ưa Thích:</span>
              <span style={{ fontWeight: 600 }}>{staff.preferredFormation.name}</span>
            </div>
          )}
          <div className="flex-center" style={{ justifyContent: 'space-between' }}>
            <span className="text-muted">CLB Hiện Tại:</span>
            <span>Tự Do (Free Agent)</span>
          </div>
        </div>

        {/* Chi Phí Hợp Đồng */}
        <div style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#047857', fontWeight: 600 }}>Phí Ký Hợp Đồng:</span>
            <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
              {formatMoney(staff.signingFee)}
            </span>
          </div>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#047857', fontWeight: 600 }}>Mức Lương Tuần:</span>
            <span style={{ fontWeight: 800, color: '#059669' }}>
              {formatMoney(staff.wage)} / tuần
            </span>
          </div>
          <div className="flex-center" style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span className="text-muted">Ngân Sách Hiện Có:</span>
            <span style={{ fontWeight: 700, color: cashBalance >= staff.signingFee ? '#059669' : '#dc2626' }}>
              {formatMoney(cashBalance)}
            </span>
          </div>
        </div>

        {staff.staffType === 'HEAD_COACH' && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              color: '#b45309',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Lưu ý:</strong> Khi bổ nhiệm HLV Trưởng mới, HLV Trưởng hiện tại của CLB sẽ tự động được thanh lý hợp đồng.
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            {success}
          </div>
        )}

        <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary flex-center"
            style={{ gap: '0.4rem' }}
            disabled={hiring || cashBalance < staff.signingFee}
            onClick={onConfirm}
          >
            {hiring ? 'Đang Xử Lý...' : 'Xác Nhận Ký Hợp Đồng'}
          </button>
        </div>
      </div>
    </div>
  );
};
