import React from 'react';
import { Player } from '../../types';

interface PlayerOfferModalProps {
  player: Player | null;
  cashBalance: number;
  offerAmount: number;
  offerError: string;
  offerSuccess: string;
  submittingOffer: boolean;
  onOfferAmountChange: (amount: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const PlayerOfferModal: React.FC<PlayerOfferModalProps> = ({
  player,
  cashBalance,
  offerAmount,
  offerError,
  offerSuccess,
  submittingOffer,
  onOfferAmountChange,
  onClose,
  onSubmit,
}) => {
  if (!player) return null;

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const playerName = (player as any).name || player.common_name || player.last_name || 'Player';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-bright)' }}>
          Đề Nghị Mua {playerName}
        </h3>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span className="text-muted">CLB Hiện Tại:</span>
            <span style={{ fontWeight: 600 }}>{player.club?.name || (player as any).currentClub?.name || 'Tự do'}</span>
          </div>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span className="text-muted">Chỉ Số Tổng Quát (OVR):</span>
            <span className="ovr-chip">{player.overall_rating || (player as any).ovr || 75}</span>
          </div>
          <div className="flex-center" style={{ justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span className="text-muted">Ngân Sách Hiện Có Của Bạn:</span>
            <span className="text-success" style={{ fontWeight: 700 }}>{formatMoney(cashBalance)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            Mức Giá Đề Nghị (€)
          </label>
          <input
            type="number"
            className="input-text"
            style={{ width: '100%' }}
            value={offerAmount}
            onChange={(e) => onOfferAmountChange(Number(e.target.value))}
            min={100000}
            step={50000}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-xs btn-outline" onClick={() => onOfferAmountChange(offerAmount + 500000)}>+500K</button>
            <button type="button" className="btn btn-xs btn-outline" onClick={() => onOfferAmountChange(offerAmount + 2000000)}>+2M</button>
            <button type="button" className="btn btn-xs btn-outline" onClick={() => onOfferAmountChange(Math.min(offerAmount + 5000000, cashBalance))}>+5M</button>
          </div>
        </div>

        {offerError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            {offerError}
          </div>
        )}
        {offerSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            {offerSuccess}
          </div>
        )}

        <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            disabled={submittingOffer}
            onClick={onSubmit}
          >
            {submittingOffer ? 'Đang Gửi...' : 'Xác Nhận & Gửi Đề Nghị'}
          </button>
        </div>
      </div>
    </div>
  );
};
