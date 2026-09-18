import React, { useState } from 'react';
import { Player } from '../types';
import { playersApi } from '../services/players.service';
import { X, DollarSign, Check } from 'lucide-react';

interface PlayerDetailModalProps {
  player: Player | null;
  currentClubId: string;
  onClose: () => void;
  onPlayerUpdated: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  currentClubId,
  onClose,
  onPlayerUpdated
}) => {
  if (!player) return null;

  const isOwnPlayer = player.club_id === currentClubId;
  const isInjured = player.status?.is_injured || player.player_status?.is_injured;
  const isListed = player.status?.is_transfer_listed || player.player_status?.is_transfer_listed;
  const condition = player.status?.condition ?? player.player_status?.condition ?? 95;
  const ovr = player.overall_rating ?? (player.reputation ? Math.min(99, Math.round(player.reputation / 100)) : 75);
  const pot = player.potential_rating ?? player.potential ?? 82;
  const value = Number(player.market_value || player.player_financial_data?.market_value || 2500000);
  const wage = Number(player.contract?.salary || player.contract?.wage || player.player_financial_data?.wage || 35000);
  const pos = player.player_positions?.[0]?.position_code || player.position?.code || 'FW';

  const [toggling, setToggling] = useState(false);
  const [askingPrice, setAskingPrice] = useState(value);
  const [message, setMessage] = useState('');

  const handleToggleTransfer = async () => {
    try {
      setToggling(true);
      setMessage('');
      await playersApi.toggleTransferListing(player.id, {
        is_listed: !isListed,
        asking_price: askingPrice
      });
      setMessage(!isListed ? 'Đã niêm yết cầu thủ lên thị trường chuyển nhượng!' : 'Đã rút cầu thủ khỏi thị trường chuyển nhượng.');
      onPlayerUpdated();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Không thể cập nhật trạng thái chuyển nhượng.');
    } finally {
      setToggling(false);
    }
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 660 }}>
        {/* Modal Top Bar */}
        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div className="flex-center" style={{ gap: '1rem' }}>
            <div className="ovr-badge-fut" style={{ width: '48px', height: '52px' }}>
              <span className="ovr-score" style={{ fontSize: '1.25rem' }}>{ovr}</span>
              <span className="ovr-label">OVR</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                  {player.common_name || `${player.first_name || ''} ${player.last_name || player.name}`}
                </h2>
                <span className="pos-badge">{pos}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                {typeof player.nationality === 'object' ? (player.nationality as any)?.name || 'Quốc tế' : (player.nationality || 'Quốc tế')} · {player.age} tuổi · {player.club?.name || 'Cầu thủ tự do'}
              </div>
            </div>
          </div>
          <button className="btn btn-xs btn-outline" onClick={onClose}><X size={18} /></button>
        </div>

        {message && (
          <div className="alert alert-success mb-4 flex-center" style={{ gap: '0.5rem' }}>
            <Check size={16} /> {message}
          </div>
        )}

        {/* Top Ratings Grid */}
        <div className="grid-3 mb-4">
          <div className="stat-card text-center" style={{ background: '#f8fafc' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, fontFamily: 'var(--font-game)' }}>CHỈ SỐ TỔNG (OVR)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-game)', lineHeight: 1.1, margin: '4px 0' }}>
              {ovr}
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>HIỆN TẠI</span>
          </div>

          <div className="stat-card text-center" style={{ background: '#f8fafc' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, fontFamily: 'var(--font-game)' }}>TIỀM NĂNG (POTENTIAL)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-game)', lineHeight: 1.1, margin: '4px 0' }}>
              {pot}
            </div>
            <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>TRẦN PHÁT TRIỂN</span>
          </div>

          <div className="stat-card text-center" style={{ background: '#f8fafc' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, fontFamily: 'var(--font-game)' }}>THỂ LỰC (FITNESS)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: condition > 80 ? '#0284c7' : '#dc2626', fontFamily: 'var(--font-game)', lineHeight: 1.1, margin: '4px 0' }}>
              {condition}%
            </div>
            {isInjured ? (
              <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>CHẤN THƯƠNG 🚑</span>
            ) : (
              <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>SẴN SÀNG ĐÁ CHÍNH</span>
            )}
          </div>
        </div>

        {/* Contract & Financials */}
        <div className="card mb-4" style={{ padding: '1.25rem', background: '#f8fafc' }}>
          <h4 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.9rem', fontSize: '1rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            <DollarSign color="#059669" size={18} /> HỢP ĐỒNG & TÀI CHÍNH CẦU THỦ
          </h4>
          <div className="grid-2" style={{ gap: '1rem', fontSize: '0.88rem' }}>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Định Giá Thị Trường:</span>
              <strong style={{ color: '#059669', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>{formatMoney(value)}</strong>
            </div>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Lương Tuần:</span>
              <strong style={{ color: '#0f172a', fontFamily: 'var(--font-game)' }}>{formatMoney(wage)} / tuần</strong>
            </div>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#64748b' }}>Vai Trò Đội Hình:</span>
              <span className="badge badge-primary">{player.squad_type || 'Đội 1 (First Team)'}</span>
            </div>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#64748b' }}>Trạng Thái Rao Bán:</span>
              <span className={`badge ${isListed ? 'badge-danger' : 'badge-outline'}`}>
                {isListed ? 'ĐANG RAO BÁN 🏷️' : 'KHÔNG RAO BÁN'}
              </span>
            </div>
          </div>
        </div>

        {/* Transfer Listing Action for Manager */}
        {isOwnPlayer && (
          <div className="card" style={{ padding: '1.25rem', background: '#f0f9ff', border: '1.5px solid #bae6fd' }}>
            <h4 style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#0369a1', fontFamily: 'var(--font-display)' }}>
              THAO TÁC THỊ TRƯỜNG CHUYỂN NHƯỢNG (HLV)
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              Niêm yết cầu thủ lên thị trường chuyển nhượng để nhận các lời đề nghị từ các HLV khác và câu lạc bộ trên toàn máy chủ.
            </p>

            <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              {!isListed && (
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontFamily: 'var(--font-game)' }}>GIÁ YÊU CẦU (€)</label>
                  <input
                    type="number"
                    className="input-text"
                    style={{ width: '100%' }}
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(Number(e.target.value))}
                    step={100000}
                  />
                </div>
              )}
              <button
                className={`btn ${isListed ? 'btn-danger' : 'btn-primary'}`}
                style={{ alignSelf: 'flex-end', padding: '12px 22px' }}
                disabled={toggling}
                onClick={handleToggleTransfer}
              >
                {toggling ? 'Đang Xử Lý...' : isListed ? 'Rút Khỏi Thị Trường Chuyển Nhượng' : 'Rao Bán Cầu Thủ Này'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
