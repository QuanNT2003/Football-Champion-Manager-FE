import { useTranslation } from '../../i18n/I18nContext';
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
  const { t } = useTranslation();
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
            {t('bids.status_pending', 'ĐANG CHỜ')}
          </span>
        );
      case 'ACCEPTED':
        return (
          <span
            className="badge badge-success flex-center"
            style={{ gap: '0.3rem', padding: '0.3rem 0.65rem', fontSize: '0.76rem', fontWeight: 800 }}
          >
            <CheckCircle2 size={12} />
            {t('bids.status_accepted', 'CHẤP THUẬN')}
          </span>
        );
      case 'REJECTED':
        return (
          <span
            className="badge badge-danger flex-center"
            style={{ gap: '0.3rem', padding: '0.3rem 0.65rem', fontSize: '0.76rem', fontWeight: 800 }}
          >
            <XCircle size={12} />
            {t('bids.status_rejected', 'TỪ CHỐI')}
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
            {t('bids.status_cancelled', 'ĐÃ HỦY')}
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
    const playerName = p?.common_name || (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : t('common.player', 'Cầu thủ'));
    const isLoan = Boolean(offer.is_loan);
    const amount = Number(offer.offer_amount);

    if (confirmModal.type === 'cancel') {
      return (
        <div>
          <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
            {t('bids.confirm_cancel')}
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
            <div>{t('player_modal.player_label', 'Cầu thủ:')} <strong style={{ color: '#0f172a' }}>{playerName}</strong></div>
            <div>{t('bids.to_club', 'Gửi tới CLB:')} <strong style={{ color: '#0f172a' }}>{offer.seller_club?.name || offer.to_club?.name || t('bids.partner_club_fallback', 'CLB Đối Tác')}</strong></div>
            <div>{t('player_modal.type_label', 'Hình thức:')} <strong>{isLoan ? t('player_modal.type_loan', 'Mượn Cầu Thủ') : t('player_modal.type_buy', 'Mua Đứt')}</strong></div>
            <div>{t('player_offer.offer_fee_label', 'Phí đề nghị:')} <strong style={{ color: '#dc2626' }}>{isLoan ? t('player_offer.loan_zero', '€0 (Mượn)') : formatMoney(amount)}</strong></div>
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
            {t('bids.confirm_sell_msg', 'Bạn có đồng ý {type} cầu thủ này theo các điều khoản sau?').replace('{type}', isLoan ? t('player_modal.type_loan', 'cho mượn') : t('player_modal.type_buy', 'chuyển nhượng bán'))}
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
            <div>{t('player_modal.player_label', 'Cầu thủ:')} <strong style={{ color: '#0f172a' }}>{playerName}</strong></div>
            <div>{t('bids.partner_club_fallback', 'CLB đối tác:')} <strong style={{ color: '#0f172a' }}>{offer.buyer_club?.name || offer.from_club?.name || t('bids.rival_club_fallback', 'CLB Đối Thủ')}</strong></div>
            <div>{t('player_modal.type_label', 'Hình thức:')} <strong style={{ color: '#16a34a' }}>{isLoan ? t('bids.type_loan_receive', 'Cho Mượn Cầu Thủ') : t('bids.type_buy_receive', 'Chuyển Nhượng Mua Đứt')}</strong></div>
            <div>
              {t('bids.receive_amount_label', 'Số tiền nhận được:')} <strong style={{ fontSize: '1.05rem', color: '#15803d' }}>{isLoan ? '€0 (Mượn)' : formatMoney(amount)}</strong>
            </div>
          </div>
          <p style={{ margin: '0.85rem 0 0 0', fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
            {t('bids.cash_added_notice', '✓ Khoản tiền sẽ được cộng trực tiếp vào số dư tiền mặt của CLB ngay khi hoàn tất.')}
          </p>
        </div>
      );
    }

    if (confirmModal.type === 'reject') {
      return (
        <div>
          <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
            {t('bids.confirm_reject_msg', 'Bạn có chắc chắn muốn từ chối lời đề nghị từ CLB đối tác không?')}
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
            <div>{t('player_modal.player_label', 'Cầu thủ:')} <strong style={{ color: '#0f172a' }}>{playerName}</strong></div>
            <div>{t('bids.from_club', 'CLB đề nghị:')} <strong style={{ color: '#0f172a' }}>{offer.buyer_club?.name || offer.from_club?.name || 'Rival Club'}</strong></div>
            <div>{t('bids.offered_price_label', 'Mức giá đề xuất:')} <strong style={{ color: '#dc2626' }}>{isLoan ? '€0 (Mượn)' : formatMoney(amount)}</strong></div>
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
            {t('bids.tab_all', 'Tất Cả Đề Nghị ({count})').replace('{count}', String(incomingOffers.length + outgoingOffers.length))}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'outgoing' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('outgoing')}
            style={{ fontWeight: 700 }}
          >
            <Send size={14} style={{ marginRight: '0.35rem' }} />
            {t('bids.tab_sent', 'Đã Gửi Đi ({count})').replace('{count}', String(outgoingOffers.length))}
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
            {t('bids.tab_received', 'Đề Nghị Nhận Được ({count})').replace('{count}', String(incomingOffers.length))}
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
          {t('bids.realtime_update', 'Cập nhật chuyển nhượng theo thời gian thực')}
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
                    {t('bids.sent_title')}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {t('bids.sent_desc')}
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
                  {t('bids.no_sent', 'Chưa có đề nghị mua nào được gửi đi')}
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  {t('bids.no_sent_sub', 'Tìm cầu thủ trên thị trường và gửi lời đề nghị chuyển nhượng ngay.')}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outgoingOffers.map((offer) => {
                  const p = offer.player;
                  const playerName =
                    p?.common_name ||
                    (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : t('bids.target_player', 'Cầu thủ mục tiêu'));
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
                          title={onSelectPlayer && p ? t('squad.view_player_tooltip', 'Bấm để xem chi tiết cầu thủ') : undefined}
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
                              {p?.age && <span>{t('tactics.age_years', '{age} tuổi').replace('{age}', String(p.age))}</span>}
                              {p?.ovr && (
                                <span style={{ fontWeight: 700, color: '#16a34a' }}>
                                  OVR {p.ovr}
                                </span>
                              )}
                              {p?.market_value && (
                                <span>{t('bids.market_val_label', 'Định giá: {val}').replace('{val}', formatMoney(Number(p.market_value)))}</span>
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
                            <Building2 size={13} /> {t('bids.to_club')}
                          </span>
                          <strong style={{ color: '#0f172a', display: 'block', marginTop: '2px' }}>
                            {clubPartner?.name || t('bids.partner_club_fallback', 'CLB Đối Tác')}
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={13} /> {t('bids.method')}
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
                            {isLoan ? t('player_modal.type_loan', 'Cho Mượn') : t('player_modal.type_buy', 'Mua Đứt')}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <DollarSign size={13} /> {t('bids.fee', 'Phí chuyển nhượng:')}
                          </span>
                          <strong
                            style={{
                              display: 'block',
                              marginTop: '2px',
                              fontSize: '0.92rem',
                              color: isLoan ? '#92400e' : '#16a34a',
                            }}
                          >
                            {isLoan ? t('player_offer.loan_zero', '€0 (Mượn)') : formatMoney(Number(offer.offer_amount))}
                          </strong>
                        </div>

                        {offer.proposed_wage !== undefined && offer.proposed_wage > 0 && (
                          <div>
                            <span style={{ color: '#64748b' }}>{t('player_offer.suggested_wage', 'Lương đề xuất:')}</span>
                            <strong style={{ display: 'block', marginTop: '2px', color: '#d97706' }}>
                              €{Number(offer.proposed_wage).toLocaleString()} {t('player_modal.per_week', '/ tuần')}
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
                          <span>{t('bids.sent_at')} {formatDate(offer.created_at)}</span>
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
                            title={t('bids.cancel_this_bid_tooltip', 'Hủy lời đề nghị chuyển nhượng này')}
                          >
                            <Trash2 size={13} />
                            <span>{t('bids.cancel_offer')}</span>
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
                    {t('bids.received_title')}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {t('bids.received_desc')}
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
                  {t('bids.no_received', 'Hiện chưa có đề nghị chuyển nhượng nào gửi tới')}
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  {t('bids.no_received_sub', 'Khi có CLB muốn mua cầu thủ của bạn, thông báo sẽ hiển thị tại đây.')}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingOffers.map((offer) => {
                  const p = offer.player;
                  const playerName =
                    p?.common_name ||
                    (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : t('bids.your_player_fallback', 'Cầu thủ của bạn'));
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
                          title={onSelectPlayer && p ? t('squad.view_player_tooltip', 'Bấm để xem chi tiết cầu thủ') : undefined}
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
                              {p?.age && <span>{t('tactics.age_years', '{age} tuổi').replace('{age}', String(p.age))}</span>}
                              {p?.ovr && (
                                <span style={{ fontWeight: 700, color: '#16a34a' }}>
                                  OVR {p.ovr}
                                </span>
                              )}
                              {marketVal > 0 && (
                                <span>{t('bids.market_val_label', 'Định giá: {val}').replace('{val}', formatMoney(marketVal))}</span>
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
                            <Building2 size={13} /> {t('bids.from_club')}
                          </span>
                          <strong style={{ color: '#0f172a', display: 'block', marginTop: '2px' }}>
                            {clubBuyer?.name || 'Rival Club'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={13} /> {t('bids.method')}
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
                            {isLoan ? t('player_modal.type_loan', 'Mượn Cầu Thủ') : t('player_modal.type_buy', 'Mua Đứt')}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <DollarSign size={13} /> {t('player_offer.fee_label', 'Mức giá đề nghị:')}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '2px' }}>
                            <strong
                              style={{
                                fontSize: '0.98rem',
                                color: '#15803d',
                              }}
                            >
                              {isLoan ? t('player_offer.loan_zero', '€0 (Mượn)') : formatMoney(offerAmount)}
                            </strong>
                            {!isLoan && marketVal > 0 && offerAmount > marketVal && (
                              <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                                {t('bids.price_diff_percent', '(+{pct}% giá thị trường)').replace('{pct}', String(Math.round(((offerAmount - marketVal) / marketVal) * 100)))}
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
                          <span>{t('bids.received_at')} {formatDate(offer.created_at)}</span>
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
                              <span>{isLoan ? t('bids.accept_loan') : t('bids.accept_buy')}</span>
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
                              <span>{t('bids.reject_btn')}</span>
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                            {t('bids.transaction_ended', 'Giao dịch đã kết thúc ({status})').replace('{status}', offer.status)}
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
            ? t('bids.modal_title_cancel', 'Xác Nhận Hủy Lời Đề Nghị')
            : confirmModal.type === 'accept'
            ? t('bids.modal_title_accept', 'Xác Nhận Chấp Thuận Chuyển Nhượng')
            : t('bids.modal_title_reject', 'Xác Nhận Từ Chối Đề Nghị')
        }
        variant={
          confirmModal.type === 'accept'
            ? 'success'
            : 'danger'
        }
        confirmText={
          confirmModal.type === 'cancel'
            ? t('bids.btn_confirm_cancel', 'Đồng Ý Hủy')
            : confirmModal.type === 'accept'
            ? t('bids.btn_accept_now', 'Chấp Nhận Ngay')
            : t('bids.btn_confirm_reject', 'Xác Nhận Từ Chối')
        }
        cancelText={t('bids.btn_back', 'Quay Lại')}
        isLoading={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={handleCloseConfirm}
        message={renderConfirmContent()}
      />
    </div>
  );
};
