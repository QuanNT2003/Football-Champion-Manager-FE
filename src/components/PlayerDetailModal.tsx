import React, { useState } from 'react';
import { Player } from '../types';
import { playersApi } from '../services/api';
import { X, ShieldAlert, DollarSign, Activity, Award, HeartPulse, Sparkles, Check } from 'lucide-react';

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
  const ovr = player.overall_rating ?? 75;
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
      setMessage(!isListed ? 'Player placed on the Transfer List!' : 'Player removed from Transfer List.');
      onPlayerUpdated();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update transfer listing.');
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div className="flex-center" style={{ gap: '0.75rem' }}>
            <div className="pos-badge" style={{ fontSize: '1rem', padding: '0.35rem 0.75rem' }}>{pos}</div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                {player.common_name || `${player.first_name} ${player.last_name}`}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {typeof player.nationality === 'object' ? (player.nationality as any)?.name || 'International' : (player.nationality || 'International')} · {player.age} Years Old · {player.club?.name || 'Free Agent'}
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
          <div className="stat-card text-center">
            <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Overall Rating</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'Outfit' }}>
              {ovr}
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Current Ability</span>
          </div>

          <div className="stat-card text-center">
            <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Potential</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'Outfit' }}>
              {pot}
            </div>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Ceiling</span>
          </div>

          <div className="stat-card text-center">
            <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Condition / Fitness</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: condition > 80 ? 'var(--neon-green)' : 'var(--danger)', fontFamily: 'Outfit' }}>
              {condition}%
            </div>
            {isInjured ? (
              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Injured</span>
            ) : (
              <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>Match Fit</span>
            )}
          </div>
        </div>

        {/* Contract & Financials */}
        <div className="card mb-4" style={{ padding: '1rem 1.25rem' }}>
          <h4 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <DollarSign className="text-success" size={18} /> Financial Details & Contract
          </h4>
          <div className="grid-2" style={{ gap: '1rem', fontSize: '0.875rem' }}>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-muted">Estimated Market Value:</span>
              <strong className="text-success">{formatMoney(value)}</strong>
            </div>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-muted">Weekly Wage:</span>
              <strong>{formatMoney(wage)} / wk</strong>
            </div>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span className="text-muted">Squad Status:</span>
              <span className="badge badge-primary">{player.squad_type || 'First Team'}</span>
            </div>
            <div className="flex-center" style={{ justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span className="text-muted">Transfer Listed:</span>
              <span className={`badge ${isListed ? 'badge-danger' : 'badge-outline'}`}>
                {isListed ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Transfer Listing Action for Manager */}
        {isOwnPlayer && (
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-bright)' }}>
              Manager Transfer Actions
            </h4>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              List this player to invite bids from competing AI and human clubs worldwide.
            </p>

            <div className="flex-center" style={{ gap: '1rem' }}>
              {!isListed && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Asking Price (€)</label>
                  <input
                    type="number"
                    className="input-text"
                    style={{ width: '100%', padding: '0.4rem 0.75rem' }}
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(Number(e.target.value))}
                    step={100000}
                  />
                </div>
              )}
              <button
                className={`btn ${isListed ? 'btn-danger' : 'btn-primary'}`}
                style={{ alignSelf: 'flex-end' }}
                disabled={toggling}
                onClick={handleToggleTransfer}
              >
                {toggling ? 'Updating...' : isListed ? 'Remove from Transfer Market' : 'List on Transfer Market'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
