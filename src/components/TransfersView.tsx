import React, { useState, useEffect } from 'react';
import { transfersApi } from '../services/transfers.service';
import { playersApi } from '../services/players.service';
import { Player, TransferOffer } from '../types';
import { ShoppingCart, DollarSign, Search, Filter, ArrowRightLeft, CheckCircle, XCircle, Check, X } from 'lucide-react';

interface TransfersViewProps {
  currentClubId: string;
  cashBalance: number;
  onRefreshFinance: () => void;
  onSelectPlayer: (player: Player) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  currentClubId,
  cashBalance,
  onRefreshFinance,
  onSelectPlayer
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'offers'>('market');
  const [marketPlayers, setMarketPlayers] = useState<Player[]>([]);
  const [incomingOffers, setIncomingOffers] = useState<TransferOffer[]>([]);
  const [outgoingOffers, setOutgoingOffers] = useState<TransferOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Offer modal
  const [selectedPlayerForOffer, setSelectedPlayerForOffer] = useState<Player | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerError, setOfferError] = useState('');
  const [offerSuccess, setOfferSuccess] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    if (activeTab === 'market') {
      loadMarket();
    } else {
      loadOffers();
    }
  }, [activeTab, page, positionFilter]);

  const loadMarket = async () => {
    try {
      setLoading(true);
      const data = await transfersApi.getMarket({
        search: search || undefined,
        position: positionFilter || undefined,
        page,
        limit: 15
      });
      const items = data.items || (Array.isArray(data) ? data : []);
      setMarketPlayers(items);
      setTotalPages(Math.ceil((data.total || items.length) / 15) || 1);
    } catch (err) {
      console.error('Failed to load market:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await transfersApi.getClubOffers(currentClubId);
      setIncomingOffers(data.incoming || []);
      setOutgoingOffers(data.outgoing || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMarket();
  };

  const openOfferModal = (player: Player) => {
    setSelectedPlayerForOffer(player);
    const estimated = Number(player.market_value || player.player_financial_data?.market_value || 1000000);
    setOfferAmount(estimated);
    setOfferError('');
    setOfferSuccess('');
  };

  const handleSendOffer = async () => {
    if (!selectedPlayerForOffer) return;
    if (offerAmount > cashBalance) {
      setOfferError('Insufficient club funds for this offer!');
      return;
    }
    try {
      setSubmittingOffer(true);
      setOfferError('');
      await transfersApi.makeOffer({
        player_id: selectedPlayerForOffer.id,
        buyer_club_id: currentClubId,
        offer_amount: offerAmount,
        proposed_wage: Math.round(offerAmount * 0.05)
      });
      setOfferSuccess('Transfer bid dispatched to seller!');
      setTimeout(() => {
        setSelectedPlayerForOffer(null);
        setOfferSuccess('');
      }, 1500);
    } catch (err: any) {
      setOfferError(err.response?.data?.message || 'Failed to submit bid.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleRespondOffer = async (offerId: string, response: 'ACCEPTED' | 'REJECTED') => {
    try {
      await transfersApi.respondOffer(offerId, { response });
      loadOffers();
      onRefreshFinance();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to respond to offer.');
    }
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val}`;
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title flex-center" style={{ gap: '0.75rem' }}>
            <ShoppingCart className="text-primary" size={28} />
            Transfer Market
          </h1>
          <p className="view-subtitle">Scout talent, submit purchase offers, and negotiate contracts</p>
        </div>

        <div className="flex-center" style={{ gap: '1rem' }}>
          <div className="stat-chip" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <DollarSign size={16} className="text-success" />
            <span>Budget: <strong>{formatMoney(cashBalance)}</strong></span>
          </div>

          <div className="btn-group">
            <button
              className={`btn btn-sm ${activeTab === 'market' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('market')}
            >
              Market Listings
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'offers' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('offers')}
            >
              Transfer Bids ({incomingOffers.length + outgoingOffers.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'market' ? (
        <>
          <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <form onSubmit={handleSearchSubmit} className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search player name or nationality..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <select
                className="input-select"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="">All Positions</option>
                <option value="GK">Goalkeeper (GK)</option>
                <option value="DEF">Defender (CB/LB/RB)</option>
                <option value="MID">Midfielder (CM/CAM/CDM)</option>
                <option value="ATT">Forward (ST/LW/RW)</option>
              </select>

              <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.4rem' }}>
                <Filter size={16} /> Filter
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th style={{ textAlign: 'center' }}>Pos</th>
                  <th style={{ textAlign: 'center' }}>Age</th>
                  <th style={{ textAlign: 'center' }}>OVR</th>
                  <th style={{ textAlign: 'center' }}>POT</th>
                  <th>Current Club</th>
                  <th style={{ textAlign: 'right' }}>Market Value</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                      <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                      Scouting database...
                    </td>
                  </tr>
                ) : marketPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                      No players listed for transfer matching criteria.
                    </td>
                  </tr>
                ) : (
                  marketPlayers.map((p) => {
                    const pos = p.player_positions?.[0]?.position_code || 'FW';
                    const isOwnClub = p.club_id === currentClubId;
                    const value = Number(p.market_value || p.player_financial_data?.market_value || 2500000);

                    return (
                      <tr key={p.id}>
                        <td>
                          <div
                            className="flex-center cursor-pointer"
                            style={{ justifyContent: 'flex-start', gap: '0.75rem' }}
                            onClick={() => onSelectPlayer(p)}
                          >
                            <div className="player-avatar-sm">
                              {p.first_name?.[0] || 'P'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
                                {p.common_name || `${p.first_name || ''} ${p.last_name || ''}`}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {typeof p.nationality === 'object' ? (p.nationality as any)?.name || 'International' : (p.nationality || 'International')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="pos-badge">{pos}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{p.age || 24}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="ovr-chip">{p.overall_rating || 75}</span>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--accent-gold)', fontWeight: 600 }}>
                          {p.potential_rating || 82}
                        </td>
                        <td>{p.club?.name || 'Free Agent'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--neon-green)' }}>
                          {formatMoney(value)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isOwnClub ? (
                            <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>Your Squad</span>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => openOfferModal(p)}
                            >
                              Make Offer
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
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
              <div className="btn-group">
                <button
                  className="btn btn-xs btn-outline"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="btn btn-xs btn-outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid-2">
          {/* Incoming Offers */}
          <div className="card">
            <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ArrowRightLeft className="text-warning" size={20} />
              Incoming Bids for Your Players ({incomingOffers.length})
            </h3>
            {incomingOffers.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No incoming transfer offers at this time.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingOffers.map((offer) => (
                  <div key={offer.id} className="offer-card">
                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                        {offer.player?.common_name || 'Player'}
                      </span>
                      <span className="badge badge-warning">{offer.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Bid from: <strong>{offer.buyer_club?.name || 'Rival Club'}</strong>
                      <br />
                      Offered Fee: <strong className="text-success">{formatMoney(Number(offer.offer_amount))}</strong>
                    </div>
                    {offer.status === 'PENDING' && (
                      <div className="flex-center" style={{ gap: '0.5rem' }}>
                        <button
                          className="btn btn-xs btn-success flex-center"
                          style={{ gap: '0.25rem' }}
                          onClick={() => handleRespondOffer(offer.id, 'ACCEPTED')}
                        >
                          <Check size={14} /> Accept & Sell
                        </button>
                        <button
                          className="btn btn-xs btn-danger flex-center"
                          style={{ gap: '0.25rem' }}
                          onClick={() => handleRespondOffer(offer.id, 'REJECTED')}
                        >
                          <X size={14} /> Reject
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
              Your Outgoing Bids ({outgoingOffers.length})
            </h3>
            {outgoingOffers.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No active purchase bids.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outgoingOffers.map((offer) => (
                  <div key={offer.id} className="offer-card">
                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                        {offer.player?.common_name || 'Target Player'}
                      </span>
                      <span className={`badge ${offer.status === 'ACCEPTED' ? 'badge-success' : offer.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {offer.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Target Club: <strong>{offer.seller_club?.name || 'Club'}</strong>
                      <br />
                      Your Bid: <strong className="text-success">{formatMoney(Number(offer.offer_amount))}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {selectedPlayerForOffer && (
        <div className="modal-backdrop" onClick={() => setSelectedPlayerForOffer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-bright)' }}>
              Transfer Bid for {selectedPlayerForOffer.common_name || selectedPlayerForOffer.last_name}
            </h3>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span className="text-muted">Current Club:</span>
                <span>{selectedPlayerForOffer.club?.name || 'Unassigned'}</span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span className="text-muted">Overall Rating:</span>
                <span className="ovr-chip">{selectedPlayerForOffer.overall_rating || 75}</span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-muted">Your Club Budget:</span>
                <span className="text-success" style={{ fontWeight: 700 }}>{formatMoney(cashBalance)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Transfer Fee Offered (€)
              </label>
              <input
                type="number"
                className="input-text"
                style={{ width: '100%' }}
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                min={100000}
                step={50000}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-xs btn-outline" onClick={() => setOfferAmount(a => a + 500000)}>+500K</button>
                <button type="button" className="btn btn-xs btn-outline" onClick={() => setOfferAmount(a => a + 2000000)}>+2M</button>
                <button type="button" className="btn btn-xs btn-outline" onClick={() => setOfferAmount(a => Math.min(a + 5000000, cashBalance))}>+5M</button>
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
              <button className="btn btn-outline" onClick={() => setSelectedPlayerForOffer(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={submittingOffer}
                onClick={handleSendOffer}
              >
                {submittingOffer ? 'Dispatching...' : 'Confirm & Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
