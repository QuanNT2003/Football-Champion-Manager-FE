import React, { useState } from 'react';
import { TransferOffer } from '../../types';
import {
  Send,
  Inbox,
  Check,
  X,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  DollarSign,
  User,
} from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PositionBadge } from '../common/PositionBadge';

interface TransferBidsViewProps {
  incomingOffers: TransferOffer[];
  outgoingOffers: TransferOffer[];
  onRespondOffer: (offerId: string, response: 'ACCEPTED' | 'REJECTED') => void;
  onCancelOffer?: (offerId: string) => void;
  onSelectPlayer?: (player: any) => void;
}

export const TransferBidsView: React.FC<TransferBidsViewProps> = ({
  incomingOffers,
  outgoingOffers,
  onRespondOffer,
  onCancelOffer,
  onSelectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'outgoing' | 'incoming'>('all');
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const formatMoney = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '€0';
    if (val >= 1000000) return `€${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCancelClick = async (offerId: string) => {
    if (!onCancelOffer) return;
    if (window.confirm('Bạn có chắc chắn muốn hủy lời đề nghị chuyển nhượng này không?')) {
      setCancellingId(offerId);
      try {
        await onCancelOffer(offerId);
      } finally {
        setCancellingId(null);
      }
    }
  };

  const handleRespondClick = async (offerId: string, response: 'ACCEPTED' | 'REJECTED') => {
    const actionText = response === 'ACCEPTED' ? 'chấp nhận' : 'từ chối';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} lời đề nghị này không?`)) {
      setRespondingId(offerId);
      try {
        await onRespondOffer(offerId, response);
      } finally {
        setRespondingId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span
            className="badge badge-warning flex-center"
            style={{ gap: '0.3rem', padding: '0.3rem 0.65rem', fontSize: '0.76rem', fontWeight: 800 }}
          >
            <Clock size={12} />
            ĐANG CHỜ
          </span>
        );
      case 'ACCEPTED':
        return (
          <span
            className="badge badge-success flex-center"
            style={{ gap: '0.3rem', padding: '0.3rem 0.65rem', fontSize: '0.76rem', fontWeight: 800 }}
          >
            <CheckCircle2 size={12} />
            CHẤP THUẬN
          </span>
        );
      case 'REJECTED':
        return (
          <span
            className="badge badge-danger flex-center"
            style={{ gap: '0.3rem', padding: '0.3rem 0.65rem', fontSize: '0.76rem', fontWeight: 800 }}
          >
            <XCircle size={12} />
            TỪ CHỐI
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            className="badge flex-center"
            style={{
              gap: '0.3rem',
              padding: '0.3rem 0.65rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              background: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #cbd5e1',
            }}
          >
            <AlertCircle size={12} />
            ĐÃ HỦY
          </span>
        );
      default:
        return <span className="badge badge-outline">{status}</span>;
    }
  };

  const pendingIncomingCount = incomingOffers.filter((o) => o.status === 'PENDING').length;
  const pendingOutgoingCount = outgoingOffers.filter((o) => o.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subnav Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--card-bg, #ffffff)',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('all')}
            style={{ fontWeight: 700 }}
          >
            Tất Cả Đề Nghị ({incomingOffers.length + outgoingOffers.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'outgoing' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('outgoing')}
            style={{ fontWeight: 700 }}
          >
            <Send size={14} style={{ marginRight: '0.35rem' }} />
            Đã Gửi Đi ({outgoingOffers.length})
            {pendingOutgoingCount > 0 && (
              <span
                style={{
                  marginLeft: '0.4rem',
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                {pendingOutgoingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'incoming' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('incoming')}
            style={{ fontWeight: 700 }}
          >
            <Inbox size={14} style={{ marginRight: '0.35rem' }} />
            Đề Nghị Nhận Được ({incomingOffers.length})
            {pendingIncomingCount > 0 && (
              <span
                style={{
                  marginLeft: '0.4rem',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                {pendingIncomingCount}
              </span>
            )}
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
          Cập nhật chuyển nhượng theo thời gian thực
        </div>
      </div>

      {/* Grid 2 Columns for Outgoing and Incoming */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            activeTab === 'all'
              ? 'repeat(auto-fit, minmax(460px, 1fr))'
              : '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ======================================================== */}
        {/* LIST 1: ĐỀ NGHỊ MUA CỦA BẠN ĐÃ GỬI ĐI (OUTGOING OFFERS) */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'outgoing') && (
          <div className="card" style={{ padding: '1.25rem', height: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803d',
                  }}
                >
                  <Send size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--text-bright, #0f172a)',
                    }}
                  >
                    Đề Nghị Mua Của Bạn Đã Gửi Đi
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Các đề nghị mua đứt / mượn cầu thủ bạn đã gửi tới các CLB
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '20px',
                }}
              >
                {outgoingOffers.length}
              </span>
            </div>

            {outgoingOffers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1rem',
                  color: '#94a3b8',
                }}
              >
                <Send size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>
                  Chưa có đề nghị mua nào được gửi đi
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Tìm cầu thủ trên thị trường và gửi lời đề nghị chuyển nhượng ngay.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outgoingOffers.map((offer) => {
                  const p = offer.player;
                  const playerName =
                    p?.common_name ||
                    (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Cầu thủ mục tiêu');
                  const pos = p?.position || (p as any)?.player_positions?.[0]?.positions?.code || 'ST';
                  const clubPartner = offer.seller_club || offer.to_club;
                  const isLoan = Boolean(offer.is_loan);

                  return (
                    <div
                      key={offer.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1.1rem',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                      }}
                    >
                      {/* Top Bar: Player Info & Status Badge */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: onSelectPlayer && p ? 'pointer' : 'default',
                            flex: 1,
                            minWidth: 0,
                          }}
                          onClick={() => onSelectPlayer && p && onSelectPlayer(p)}
                          title={onSelectPlayer && p ? 'Bấm để xem chi tiết cầu thủ' : undefined}
                        >
                          <PlayerAvatar
                            name={playerName}
                            position={pos}
                            photoUrl={p?.photo_url}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: '0.96rem',
                                  color: 'var(--text-bright, #0f172a)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {playerName}
                              </strong>
                              <PositionBadge position={pos} />
                            </div>

                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                marginTop: '2px',
                              }}
                            >
                              {p?.age && <span>{p.age} tuổi</span>}
                              {p?.ovr && (
                                <span style={{ fontWeight: 700, color: '#16a34a' }}>
                                  OVR {p.ovr}
                                </span>
                              )}
                              {p?.market_value && (
                                <span>Định giá: {formatMoney(Number(p.market_value))}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>{getStatusBadge(offer.status)}</div>
                      </div>

                      {/* Middle Details Grid */}
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '0.75rem 0.9rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: '0.6rem',
                          fontSize: '0.82rem',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Building2 size={13} /> Gửi tới CLB:
                          </span>
                          <strong style={{ color: '#0f172a', display: 'block', marginTop: '2px' }}>
                            {clubPartner?.name || 'CLB Đối Tác'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={13} /> Hình thức:
                          </span>
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '2px',
                              fontWeight: 800,
                              fontSize: '0.76rem',
                              padding: '1px 7px',
                              borderRadius: '4px',
                              background: isLoan ? '#fef3c7' : '#dcfce7',
                              color: isLoan ? '#92400e' : '#15803d',
                            }}
                          >
                            {isLoan ? 'Cho Mượn' : 'Mua Đứt'}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <DollarSign size={13} /> Phí chuyển nhượng:
                          </span>
                          <strong
                            style={{
                              display: 'block',
                              marginTop: '2px',
                              fontSize: '0.92rem',
                              color: isLoan ? '#92400e' : '#16a34a',
                            }}
                          >
                            {isLoan ? '€0 (Mượn)' : formatMoney(Number(offer.offer_amount))}
                          </strong>
                        </div>

                        {offer.proposed_wage !== undefined && offer.proposed_wage > 0 && (
                          <div>
                            <span style={{ color: '#64748b' }}>Lương đề xuất:</span>
                            <strong style={{ display: 'block', marginTop: '2px', color: '#d97706' }}>
                              €{Number(offer.proposed_wage).toLocaleString()}/tuần
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions & Metadata */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.4rem',
                          borderTop: '1px solid #f1f5f9',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Calendar size={13} />
                          <span>Gửi ngày: {formatDate(offer.created_at)}</span>
                        </div>

                        {/* NÚT HỦY ĐỀ NGHỊ (Chỉ khi PENDING) */}
                        {offer.status === 'PENDING' && onCancelOffer && (
                          <button
                            type="button"
                            disabled={cancellingId === offer.id}
                            className="btn btn-xs btn-danger flex-center"
                            style={{
                              gap: '0.35rem',
                              padding: '0.4rem 0.8rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                            }}
                            onClick={() => handleCancelClick(offer.id)}
                            title="Hủy lời đề nghị chuyển nhượng này"
                          >
                            <Trash2 size={13} />
                            <span>{cancellingId === offer.id ? 'Đang hủy...' : 'HỦY ĐỀ NGHỊ'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* LIST 2: ĐỀ NGHỊ MUA CẦU THỦ CỦA BẠN (INCOMING OFFERS)   */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'incoming') && (
          <div className="card" style={{ padding: '1.25rem', height: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309',
                  }}
                >
                  <Inbox size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--text-bright, #0f172a)',
                    }}
                  >
                    Đề Nghị Mua Cầu Thủ Của Bạn
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Các CLB khác đang hỏi mua / mượn cầu thủ trong đội hình bạn
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '20px',
                }}
              >
                {incomingOffers.length}
              </span>
            </div>

            {incomingOffers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1rem',
                  color: '#94a3b8',
                }}
              >
                <Inbox size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>
                  Hiện chưa có đề nghị chuyển nhượng nào gửi tới
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Khi có CLB muốn mua cầu thủ của bạn, thông báo sẽ hiển thị tại đây.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingOffers.map((offer) => {
                  const p = offer.player;
                  const playerName =
                    p?.common_name ||
                    (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Cầu thủ của bạn');
                  const pos = p?.position || (p as any)?.player_positions?.[0]?.positions?.code || 'ST';
                  const clubBuyer = offer.buyer_club || offer.from_club;
                  const isLoan = Boolean(offer.is_loan);
                  const offerAmount = Number(offer.offer_amount);
                  const marketVal = Number(p?.market_value || 0);

                  return (
                    <div
                      key={offer.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1.1rem',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                      }}
                    >
                      {/* Top Bar: Player Info & Status Badge */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: onSelectPlayer && p ? 'pointer' : 'default',
                            flex: 1,
                            minWidth: 0,
                          }}
                          onClick={() => onSelectPlayer && p && onSelectPlayer(p)}
                          title={onSelectPlayer && p ? 'Bấm để xem chi tiết cầu thủ' : undefined}
                        >
                          <PlayerAvatar
                            name={playerName}
                            position={pos}
                            photoUrl={p?.photo_url}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: '0.96rem',
                                  color: 'var(--text-bright, #0f172a)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {playerName}
                              </strong>
                              <PositionBadge position={pos} />
                            </div>

                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                marginTop: '2px',
                              }}
                            >
                              {p?.age && <span>{p.age} tuổi</span>}
                              {p?.ovr && (
                                <span style={{ fontWeight: 700, color: '#16a34a' }}>
                                  OVR {p.ovr}
                                </span>
                              )}
                              {marketVal > 0 && (
                                <span>Định giá: {formatMoney(marketVal)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>{getStatusBadge(offer.status)}</div>
                      </div>

                      {/* Middle Details Grid */}
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '0.75rem 0.9rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: '0.6rem',
                          fontSize: '0.82rem',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Building2 size={13} /> CLB Đề Nghị:
                          </span>
                          <strong style={{ color: '#0f172a', display: 'block', marginTop: '2px' }}>
                            {clubBuyer?.name || 'Rival Club'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={13} /> Hình thức:
                          </span>
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '2px',
                              fontWeight: 800,
                              fontSize: '0.76rem',
                              padding: '1px 7px',
                              borderRadius: '4px',
                              background: isLoan ? '#fef3c7' : '#dcfce7',
                              color: isLoan ? '#92400e' : '#15803d',
                            }}
                          >
                            {isLoan ? 'Mượn Cầu Thủ' : 'Mua Đứt'}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <DollarSign size={13} /> Mức giá đề nghị:
                          </span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '2px' }}>
                            <strong
                              style={{
                                fontSize: '0.98rem',
                                color: '#15803d',
                              }}
                            >
                              {isLoan ? '€0 (Mượn)' : formatMoney(offerAmount)}
                            </strong>
                            {!isLoan && marketVal > 0 && offerAmount > marketVal && (
                              <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                                (+{Math.round(((offerAmount - marketVal) / marketVal) * 100)}% giá thị trường)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions: Chấp Nhận & Từ Chối */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid #f1f5f9',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Calendar size={13} />
                          <span>Nhận lúc: {formatDate(offer.created_at)}</span>
                        </div>

                        {offer.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              disabled={respondingId === offer.id}
                              className="btn btn-xs btn-success flex-center"
                              style={{
                                gap: '0.3rem',
                                padding: '0.45rem 0.85rem',
                                fontWeight: 800,
                                borderRadius: '6px',
                                background: '#16a34a',
                                borderColor: '#16a34a',
                                color: '#ffffff',
                              }}
                              onClick={() => handleRespondClick(offer.id, 'ACCEPTED')}
                            >
                              <Check size={14} />
                              <span>{isLoan ? 'Đồng Ý Cho Mượn' : 'Chấp Nhận Bán'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={respondingId === offer.id}
                              className="btn btn-xs btn-danger flex-center"
                              style={{
                                gap: '0.3rem',
                                padding: '0.45rem 0.85rem',
                                fontWeight: 800,
                                borderRadius: '6px',
                              }}
                              onClick={() => handleRespondClick(offer.id, 'REJECTED')}
                            >
                              <X size={14} />
                              <span>Từ Chối</span>
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                            Giao dịch đã kết thúc ({offer.status})
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
