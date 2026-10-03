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
  AlertTriangle,
} from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PositionBadge } from '../common/PositionBadge';
import { ConfirmModal } from '../common/ConfirmModal';

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Modal xác nhận state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'accept' | 'reject';
    offer: TransferOffer | null;
  }>({
    isOpen: false,
    type: 'cancel',
    offer: null,
  });

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

  const handleOpenConfirm = (
    type: 'cancel' | 'accept' | 'reject',
    offer: TransferOffer
  ) => {
    setConfirmModal({
      isOpen: true,
      type,
      offer,
    });
  };

  const handleCloseConfirm = () => {
    if (isProcessing) return;
    setConfirmModal({
      isOpen: false,
      type: 'cancel',
      offer: null,
    });
  };

  const handleConfirmAction = async () => {
    const { type, offer } = confirmModal;
    if (!offer) return;

    try {
      setIsProcessing(true);
      if (type === 'cancel' && onCancelOffer) {
        await onCancelOffer(offer.id);
      } else if (type === 'accept') {
        await onRespondOffer(offer.id, 'ACCEPTED');
      } else if (type === 'reject') {
        await onRespondOffer(offer.id, 'REJECTED');
      }
      handleCloseConfirm();
    } finally {
      setIsProcessing(false);
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

  // Render nội dung trong ConfirmModal tùy theo loại
  const renderConfirmContent = () => {
    const offer = confirmModal.offer;
    if (!offer) return null;

    const p = offer.player;
    const playerName = p?.common_name || (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Cầu thủ');
    const isLoan = Boolean(offer.is_loan);
    const amount = Number(offer.offer_amount);

    if (confirmModal.type === 'cancel') {
      return (
        <div>
          <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
            Bạn có chắc chắn muốn hủy lời đề nghị chuyển nhượng này không?
          </p>
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.86rem',
            }}
          >
            <div>Cầu thủ: <strong style={{ color: '#0f172a' }}>{playerName}</strong></div>
            <div>Gửi tới CLB: <strong style={{ color: '#0f172a' }}>{offer.seller_club?.name || offer.to_club?.name || 'CLB Đối Tác'}</strong></div>
            <div>Hình thức: <strong>{isLoan ? 'Mượn Cầu Thủ' : 'Mua Đứt'}</strong></div>
            <div>Phí đề nghị: <strong style={{ color: '#dc2626' }}>{isLoan ? '€0 (Mượn)' : formatMoney(amount)}</strong></div>
          </div>
          <p style={{ margin: '0.85rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            * Lưu ý: Thao tác hủy lời đề nghị sẽ được cập nhật ngay lập tức và không thể hoàn tác.
          </p>
        </div>
      );
    }

    if (confirmModal.type === 'accept') {
      return (
        <div>
          <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
            Bạn có đồng ý {isLoan ? 'cho mượn' : 'chuyển nhượng bán'} cầu thủ này theo các điều khoản sau?
          </p>
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.86rem',
            }}
          >
            <div>Cầu thủ: <strong style={{ color: '#0f172a' }}>{playerName}</strong></div>
            <div>CLB đối tác: <strong style={{ color: '#0f172a' }}>{offer.buyer_club?.name || offer.from_club?.name || 'Rival Club'}</strong></div>
            <div>Hình thức: <strong style={{ color: '#16a34a' }}>{isLoan ? 'Cho Mượn Cầu Thủ' : 'Chuyển Nhượng Mua Đứt'}</strong></div>
            <div>
              Số tiền nhận được: <strong style={{ fontSize: '1.05rem', color: '#15803d' }}>{isLoan ? '€0 (Mượn)' : formatMoney(amount)}</strong>
            </div>
          </div>
          <p style={{ margin: '0.85rem 0 0 0', fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
            ✓ Khoản tiền sẽ được cộng trực tiếp vào số dư tiền mặt của CLB ngay khi hoàn tất.
          </p>
        </div>
      );
    }

    if (confirmModal.type === 'reject') {
      return (
        <div>
          <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
            Bạn có chắc chắn muốn từ chối lời đề nghị từ CLB đối tác không?
          </p>
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.86rem',
            }}
          >
            <div>Cầu thủ: <strong style={{ color: '#0f172a' }}>{playerName}</strong></div>
            <div>CLB đề nghị: <strong style={{ color: '#0f172a' }}>{offer.buyer_club?.name || offer.from_club?.name || 'Rival Club'}</strong></div>
            <div>Mức giá đề xuất: <strong style={{ color: '#dc2626' }}>{isLoan ? '€0 (Mượn)' : formatMoney(amount)}</strong></div>
          </div>
          <p style={{ margin: '0.85rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            * CLB đối tác sẽ nhận được phản hồi từ chối thương vụ này.
          </p>
        </div>
      );
    }

    return null;
  };

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
                  animation: 'pulse 2s infinite',
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
                            className="btn btn-xs btn-danger flex-center"
                            style={{
                              gap: '0.35rem',
                              padding: '0.4rem 0.8rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                            }}
                            onClick={() => handleOpenConfirm('cancel', offer)}
                            title="Hủy lời đề nghị chuyển nhượng này"
                          >
                            <Trash2 size={13} />
                            <span>HỦY ĐỀ NGHỊ</span>
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
                              onClick={() => handleOpenConfirm('accept', offer)}
                            >
                              <Check size={14} />
                              <span>{isLoan ? 'Đồng Ý Cho Mượn' : 'Chấp Nhận Bán'}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-danger flex-center"
                              style={{
                                gap: '0.3rem',
                                padding: '0.45rem 0.85rem',
                                fontWeight: 800,
                                borderRadius: '6px',
                              }}
                              onClick={() => handleOpenConfirm('reject', offer)}
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

      {/* CONFIRM MODAL ĐỒNG NHẤT VÀ ĐẸP MẮT */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.type === 'cancel'
            ? 'Xác Nhận Hủy Lời Đề Nghị'
            : confirmModal.type === 'accept'
            ? 'Xác Nhận Chấp Thuận Chuyển Nhượng'
            : 'Xác Nhận Từ Chối Đề Nghị'
        }
        variant={
          confirmModal.type === 'accept'
            ? 'success'
            : 'danger'
        }
        confirmText={
          confirmModal.type === 'cancel'
            ? 'Đồng Ý Hủy'
            : confirmModal.type === 'accept'
            ? 'Chấp Nhận Ngay'
            : 'Xác Nhận Từ Chối'
        }
        cancelText="Quay Lại"
        isLoading={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={handleCloseConfirm}
        message={renderConfirmContent()}
      />
    </div>
  );
};
