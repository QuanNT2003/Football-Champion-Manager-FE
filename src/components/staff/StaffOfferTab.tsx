import React from 'react';
import { UserCheck, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { StaffDetailResponse } from '../../services/transfers.service';

interface Props {
  detail: StaffDetailResponse | null;
  isCurrentOwnStaff: boolean;
  proposedWage: number;
  contractYears: number;
  signingBonus: number;
  roleOffered: string;
  submittingOffer: boolean;
  offerSuccess: string;
  offerError: string;
  currentClubId?: string;
  formatMoney: (val: number) => string;
  setProposedWage: (val: number) => void;
  setContractYears: (val: number) => void;
  setSigningBonus: (val: number) => void;
  setRoleOffered: (val: string) => void;
  handleSubmitOffer: () => void;
  onOpenCancelConfirm: () => void;
}

export const StaffOfferTab: React.FC<Props> = ({
  detail,
  isCurrentOwnStaff,
  proposedWage,
  contractYears,
  signingBonus,
  roleOffered,
  submittingOffer,
  offerSuccess,
  offerError,
  formatMoney,
  setProposedWage,
  setContractYears,
  setSigningBonus,
  setRoleOffered,
  handleSubmitOffer,
  onOpenCancelConfirm,
}) => {
  if (isCurrentOwnStaff) {
    return (
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#166534',
        }}
      >
        <UserCheck size={36} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Nhân Sự Này Đang Thuộc CLB Của Bạn</h4>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#15803d' }}>
          Hợp đồng hiện tại đang có hiệu lực với mức lương <strong>{formatMoney(detail?.currentContract?.salary || 0)} / tuần</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Đề nghị đang chờ (nếu có) */}
      {detail?.existingOffer && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#b45309', fontSize: '0.9rem' }}>
              <Clock size={16} /> Đang có lời đề nghị chờ phản hồi
            </span>
            <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              {detail.existingOffer.status}
            </span>
          </div>

          <div style={{ fontSize: '0.84rem', color: '#78350f', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
            <div>Vai trò: <strong>{detail.existingOffer.role_offered || 'HLV'}</strong></div>
            <div>Lương đề xuất: <strong>{formatMoney(detail.existingOffer.proposed_wage)} / tuần</strong></div>
            <div>Thời hạn: <strong>{detail.existingOffer.contract_years} năm</strong></div>
            {detail.existingOffer.signing_bonus > 0 && (
              <div>Lót tay: <strong>{formatMoney(detail.existingOffer.signing_bonus)}</strong></div>
            )}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onOpenCancelConfirm}
              className="btn btn-sm"
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '6px',
                padding: '0.35rem 0.85rem',
                cursor: 'pointer',
              }}
            >
              Hủy Đề Nghị Này
            </button>
          </div>
        </div>
      )}

      {offerSuccess && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {offerSuccess}
        </div>
      )}

      {offerError && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {offerError}
        </div>
      )}

      {/* Form đề nghị */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
          {detail?.existingOffer ? 'Cập Nhật Lời Đề Nghị Tuyển Mộ' : 'Gửi Lời Đề Nghị Tuyển Mộ Mới'}
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Vai trò */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Vai trò bổ nhiệm
            </label>
            <select
              value={roleOffered}
              onChange={(e) => setRoleOffered(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', fontWeight: 600 }}
            >
              <option value="HEAD_COACH">HLV Trưởng</option>
              <option value="ASSISTANT_COACH">Trợ Lý HLV</option>
              <option value="FITNESS_COACH">HLV Thể Lực</option>
              <option value="GOALKEEPING_COACH">HLV Thủ Môn</option>
              <option value="SCOUT">Tuyển Trạch Viên</option>
              <option value="PHYSIO">Bác Sĩ / Trị Liệu</option>
              <option value="YOUTH_DIRECTOR">GĐ Đào Tạo Trẻ</option>
            </select>
          </div>

          {/* Lương tuần */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Lương tuần đề xuất (€)
            </label>
            <input
              type="number"
              step="500"
              value={proposedWage}
              onChange={(e) => setProposedWage(Number(e.target.value))}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}
            />
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
              Mức lương ước tính: {formatMoney(detail?.estimatedWage || 0)} / tuần
            </div>
          </div>

          {/* Hạn hợp đồng */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Thời hạn hợp đồng
            </label>
            <select
              value={contractYears}
              onChange={(e) => setContractYears(Number(e.target.value))}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', fontWeight: 600 }}
            >
              <option value={1}>1 Năm</option>
              <option value={2}>2 Năm</option>
              <option value={3}>3 Năm</option>
              <option value={4}>4 Năm</option>
              <option value={5}>5 Năm</option>
            </select>
          </div>

          {/* Phí lót tay */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Phí lót tay ký hợp đồng (€)
            </label>
            <input
              type="number"
              step="5000"
              value={signingBonus}
              onChange={(e) => setSigningBonus(Number(e.target.value))}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}
            />
          </div>
        </div>

        {/* Nút gửi */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            disabled={submittingOffer}
            onClick={handleSubmitOffer}
            className="btn btn-primary flex-center"
            style={{ padding: '0.65rem 1.4rem', fontWeight: 800, gap: '0.45rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' }}
          >
            <Send size={16} />
            <span>{submittingOffer ? 'Đang gửi...' : detail?.existingOffer ? 'Cập Nhật Đề Nghị' : 'Gửi Lời Đề Nghị Tuyển Mộ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
