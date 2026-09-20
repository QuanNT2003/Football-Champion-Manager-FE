import React from 'react';
import { TransferOffer } from '../../types';
import { ArrowRightLeft, ShoppingCart, Check, X } from 'lucide-react';

interface TransferBidsViewProps {
  incomingOffers: TransferOffer[];
  outgoingOffers: TransferOffer[];
  onRespondOffer: (offerId: string, response: 'ACCEPTED' | 'REJECTED') => void;
}

export const TransferBidsView: React.FC<TransferBidsViewProps> = ({
  incomingOffers,
  outgoingOffers,
  onRespondOffer,
}) => {
  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  return (
    <div className="grid-2">
      {/* Incoming Offers */}
      <div className="card">
        <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <ArrowRightLeft className="text-warning" size={20} />
          Đề Nghị Mua Cầu Thủ Của Bạn ({incomingOffers.length})
        </h3>
        {incomingOffers.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Hiện chưa có đề nghị chuyển nhượng nào gửi tới.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incomingOffers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                    {offer.player?.common_name || 'Cầu thủ'}
                  </span>
                  <span className="badge badge-warning">{offer.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Từ CLB: <strong>{offer.buyer_club?.name || 'Rival Club'}</strong>
                  <br />
                  Mức giá đề nghị: <strong className="text-success">{formatMoney(Number(offer.offer_amount))}</strong>
                </div>
                {offer.status === 'PENDING' && (
                  <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <button
                      className="btn btn-xs btn-success flex-center"
                      style={{ gap: '0.25rem' }}
                      onClick={() => onRespondOffer(offer.id, 'ACCEPTED')}
                    >
                      <Check size={14} /> Chấp Nhận Bán
                    </button>
                    <button
                      className="btn btn-xs btn-danger flex-center"
                      style={{ gap: '0.25rem' }}
                      onClick={() => onRespondOffer(offer.id, 'REJECTED')}
                    >
                      <X size={14} /> Từ Chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Offers */}
      <div className="card">
        <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <ShoppingCart className="text-primary" size={20} />
          Đề Nghị Mua Của Bạn Đã Gửi Đi ({outgoingOffers.length})
        </h3>
        {outgoingOffers.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Chưa có đề nghị mua nào đang chờ xử lý.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {outgoingOffers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                    {offer.player?.common_name || 'Cầu thủ mục tiêu'}
                  </span>
                  <span className={`badge ${offer.status === 'ACCEPTED' ? 'badge-success' : offer.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                    {offer.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Gửi tới CLB: <strong>{offer.seller_club?.name || 'Club'}</strong>
                  <br />
                  Mức giá bạn đặt: <strong className="text-success">{formatMoney(Number(offer.offer_amount))}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
