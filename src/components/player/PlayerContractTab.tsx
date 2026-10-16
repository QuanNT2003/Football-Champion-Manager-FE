import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileCheck,
  UserMinus,
  Clock,
  ShieldAlert,
  Building,
  CheckCircle2,
  ShoppingCart,
  ArrowRightLeft,
  Coins,
  Tag,
  X,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Player, PlayerDetailData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { playersApi } from '../../services/players.service';

export interface PlayerContractTabProps {
  player: Player;
  detail: PlayerDetailData | null;
  isOwnClub: boolean;
  onOpenRenewModal: () => void;
  onOpenTerminateModal: () => void;
  onPlayerUpdated?: () => void;
}

export const PlayerContractTab: React.FC<PlayerContractTabProps> = ({
  player,
  detail,
  isOwnClub,
  onOpenRenewModal,
  onOpenTerminateModal,
  onPlayerUpdated,
}) => {
  const { t } = useTranslation();

  const contract = detail?.contract || (player as any).contract;

  // Trạng thái thị trường chuyển nhượng của cầu thủ
  const initialTransferListed = Boolean(
    detail?.status?.is_transfer_listed ??
    player.player_status?.is_transfer_listed ??
    (player as any).is_transfer_listed
  );
  const initialLoanListed = Boolean(
    detail?.status?.is_loan_listed ??
    player.player_status?.is_loan_listed ??
    (player as any).is_loan_listed
  );
  const initialAskingPrice = Number(
    detail?.status?.asking_price ??
    player.player_status?.asking_price ??
    (player as any).asking_price ??
    0
  );

  const [isTransferListed, setIsTransferListed] = useState<boolean>(initialTransferListed);
  const [isLoanListed, setIsLoanListed] = useState<boolean>(initialLoanListed);
  const [currentAskingPrice, setCurrentAskingPrice] = useState<number>(initialAskingPrice);

  useEffect(() => {
    setIsTransferListed(
      Boolean(detail?.status?.is_transfer_listed ?? player.player_status?.is_transfer_listed ?? (player as any).is_transfer_listed)
    );
    setIsLoanListed(
      Boolean(detail?.status?.is_loan_listed ?? player.player_status?.is_loan_listed ?? (player as any).is_loan_listed)
    );
    setCurrentAskingPrice(
      Number(detail?.status?.asking_price ?? player.player_status?.asking_price ?? (player as any).asking_price ?? 0)
    );
  }, [detail, player]);

  // Modal Listing Form State
  const [showListingModal, setShowListingModal] = useState<boolean>(false);
  const [listingMode, setListingMode] = useState<'TRANSFER' | 'LOAN'>('TRANSFER');
  const [inputAskingPrice, setInputAskingPrice] = useState<number>(0);
  const [updatingListing, setUpdatingListing] = useState<boolean>(false);
  const [listingSuccess, setListingSuccess] = useState<string>('');
  const [listingError, setListingError] = useState<string>('');

  const marketVal = Number(
    player.market_value ||
    (player as any).player_financial_data?.market_value ||
    (detail as any)?.market_value ||
    (player as any).market_value ||
    2500000
  );

  const openListingModal = (mode: 'TRANSFER' | 'LOAN') => {
    setListingMode(mode);
    setListingError('');
    setListingSuccess('');
    if (mode === 'TRANSFER') {
      setInputAskingPrice(currentAskingPrice > 0 ? currentAskingPrice : marketVal);
    } else {
      setInputAskingPrice(0);
    }
    setShowListingModal(true);
  };

  const handleConfirmListing = async () => {
    const isTrans = listingMode === 'TRANSFER';
    const isLoan = listingMode === 'LOAN';
    const askPrice = isTrans ? Math.max(0, inputAskingPrice) : 0;

    try {
      setUpdatingListing(true);
      setListingError('');
      await playersApi.updateTransferListing(
        String(player.id),
        isTrans,
        isLoan,
        askPrice
      );

      setIsTransferListed(isTrans);
      setIsLoanListed(isLoan);
      setCurrentAskingPrice(askPrice);

      // Cập nhật lại object player/detail trực tiếp trong runtime
      if (player.player_status) {
        player.player_status.is_transfer_listed = isTrans;
        player.player_status.is_loan_listed = isLoan;
        player.player_status.asking_price = askPrice;
      }
      if (detail?.status) {
        detail.status.is_transfer_listed = isTrans;
        detail.status.is_loan_listed = isLoan;
        detail.status.asking_price = askPrice;
      }

      setListingSuccess(
        isTrans
          ? t('contract.listed_transfer_success', 'Đã niêm yết cầu thủ lên thị trường chuyển nhượng với mức phí €{price}!').replace('{price}', askPrice.toLocaleString())
          : t('contract.listed_loan_success', 'Đã đưa cầu thủ vào danh sách cho mượn thành công!')
      );

      onPlayerUpdated?.();

      setTimeout(() => {
        setShowListingModal(false);
        setListingSuccess('');
      }, 1200);
    } catch (err: any) {
      setListingError(err.response?.data?.message || err.message || t('contract.listing_failed', 'Cập nhật trạng thái niêm yết thất bại.'));
    } finally {
      setUpdatingListing(false);
    }
  };

  const handleRemoveListing = async () => {
    if (!window.confirm(t('contract.confirm_remove_listing', 'Bạn có chắc chắn muốn gỡ cầu thủ khỏi thị trường chuyển nhượng và danh sách cho mượn không?'))) {
      return;
    }

    try {
      setUpdatingListing(true);
      await playersApi.updateTransferListing(String(player.id), false, false, 0);

      setIsTransferListed(false);
      setIsLoanListed(false);
      setCurrentAskingPrice(0);

      if (player.player_status) {
        player.player_status.is_transfer_listed = false;
        player.player_status.is_loan_listed = false;
        player.player_status.asking_price = 0;
      }
      if (detail?.status) {
        detail.status.is_transfer_listed = false;
        detail.status.is_loan_listed = false;
        detail.status.asking_price = 0;
      }

      alert(t('contract.remove_listing_success', 'Đã gỡ cầu thủ khỏi thị trường chuyển nhượng thành công.'));
      onPlayerUpdated?.();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || t('contract.remove_listing_failed', 'Gỡ khỏi thị trường thất bại.'));
    } finally {
      setUpdatingListing(false);
    }
  };

  if (!contract || contract.status === 'TERMINATED' || contract.status === 'EXPIRED') {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b' }}>
        <FileText size={44} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: '#334155', fontSize: '1.1rem' }}>
          {t('contract.no_active_contract', 'Cầu Thủ Hiện Chưa Có Hợp Đồng Có Hiệu Lực')}
        </h4>
        <p style={{ margin: 0, fontSize: '0.88rem' }}>
          {t('contract.free_agent_desc', 'Cầu thủ đang là cầu thủ tự do (Free Agent) hoặc hợp đồng đã chấm dứt.')}
        </p>
      </div>
    );
  }

  const currentSeason = contract.current_season || 1;
  const endSeason = contract.end_season_id || 1;
  const remainingSeasons = contract.remaining_seasons !== undefined 
    ? contract.remaining_seasons 
    : Math.max(0, endSeason - currentSeason);

  const isExpiringSoon = remainingSeasons <= 1;
  const wage = contract.weekly_wage || contract.salary || 0;
  const clubName = contract.club_name || detail?.club?.name || player.club?.name || t('player_modal.current_club', 'CLB Chủ Quản');
  const clubLogo = contract.club_logo || detail?.club?.logo_url || player.club?.logo_url;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Banner thông báo hợp đồng mượn cầu thủ */}
      {contract.is_loan_contract && (
        <div
          style={{
            background: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ArrowRightLeft size={20} color="#1d4ed8" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.92rem' }}>
                {t('contract.loan_banner_title', 'Hợp Đồng Cầu Thủ Cho Mượn')}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1d4ed8', marginTop: '2px' }}>
                {t('contract.loan_banner_desc', 'Cầu thủ thuộc quyền sở hữu của {parentClub}, đang thi đấu cho CLB theo diện cho mượn đến hết Mùa {endSeason}.')
                  .replace('{parentClub}', contract.parent_club_name || t('player_modal.owning_club', 'CLB Chủ Quản'))
                  .replace('{endSeason}', String(endSeason))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expiration Banner Alert if <= 1 season */}
      {isExpiringSoon && (
        <div
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} color="#d97706" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.92rem' }}>
                {remainingSeasons === 0
                  ? t('contract.expires_this_season', 'Hợp đồng sẽ hết hạn vào cuối mùa giải này!')
                  : t('contract.expires_one_season', 'Hợp đồng chỉ còn 1 mùa giải nữa là hết hạn!')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>
                {isOwnClub
                  ? (contract.is_loan_contract
                      ? t('contract.loan_banner_desc', 'Cầu thủ thuộc quyền sở hữu của {parentClub}, đang thi đấu cho CLB theo diện cho mượn đến hết Mùa {endSeason}.')
                          .replace('{parentClub}', contract.parent_club_name || t('player_modal.owning_club', 'CLB Chủ Quản'))
                          .replace('{endSeason}', String(endSeason))
                      : t('contract.renew_recommendation', 'Hãy gia hạn hợp đồng ngay để đảm bảo tương lai của cầu thủ tại đội bóng.'))
                  : t('contract.expiring_soon_info', 'Cầu thủ sắp trở thành cầu thủ tự do hoặc có thể đàm phán hợp đồng.')}
              </div>
            </div>
          </div>

          {isOwnClub && !contract.is_loan_contract && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={onOpenRenewModal}
              style={{
                background: '#059669',
                borderColor: '#059669',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexShrink: 0,
              }}
            >
              <FileCheck size={15} />
              <span>{t('contract.renew_btn', 'Gia Hạn Hợp Đồng')}</span>
            </button>
          )}
        </div>
      )}

      {/* Grid of Contract Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Club & Squad Role */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building size={18} color="#0284c7" />
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              {t('contract.club_role_section', 'Đơn Vị Quản Lý & Vai Trò')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {contract.is_loan_contract ? t('contract.borrowing_club_label', 'CLB Mượn:') : t('contract.club_label', 'Câu Lạc Bộ:')}
              </span>
              <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {clubLogo && <img src={clubLogo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />}
                <span>{clubName}</span>
              </span>
            </div>

            {contract.is_loan_contract && contract.parent_club_name && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.parent_club_label', 'CLB Chủ Quản (Gốc):')}</span>
                <span style={{ fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {contract.parent_club_logo && <img src={contract.parent_club_logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />}
                  <span>{contract.parent_club_name}</span>
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.status_label', 'Trạng Thái:')}</span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: isExpiringSoon ? '#fef3c7' : '#dcfce7',
                  color: isExpiringSoon ? '#92400e' : '#15803d',
                }}
              >
                {isExpiringSoon ? t('contract.expiring_soon_status', 'Sắp Hết Hạn') : t('contract.active_status', 'Đang Hiệu Lực')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.squad_role_label', 'Vai Trò Đội Hình:')}</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                {contract.squad_role || 'FIRST_TEAM'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.loan_type_label', 'Hình Thức:')}</span>
              <span style={{ fontWeight: 700, color: contract.is_loan_contract ? '#b45309' : '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {contract.is_loan_contract ? `🤝 ${t('contract.loan_contract', 'Hợp Đồng Cho Mượn')}` : t('contract.official_contract', 'Hợp Đồng Chính Thức')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Financial Terms */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <DollarSign size={18} color="#d97706" />
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              {t('contract.financial_terms_section', 'Đãi Ngộ & Điều Khoản')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.weekly_wage_label', 'Mức Lương Tuần:')}</span>
              <span style={{ fontWeight: 800, color: '#d97706', fontSize: '1.05rem' }}>
                {formatCurrency(wage)} / {t('common.week', 'tuần')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.release_clause_label', 'Phí Phá Vỡ Hợp Đồng:')}</span>
              <span style={{ fontWeight: 700, color: contract.release_clause && contract.release_clause > 0 ? '#059669' : '#64748b', fontSize: '0.88rem' }}>
                {contract.release_clause && contract.release_clause > 0 ? formatCurrency(contract.release_clause) : t('common.none', 'Không có')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.signing_bonus_label', 'Thưởng Ký HĐ:')}</span>
              <span style={{ fontWeight: 700, color: contract.signing_bonus && contract.signing_bonus > 0 ? '#0284c7' : '#64748b', fontSize: '0.88rem' }}>
                {contract.signing_bonus && contract.signing_bonus > 0 ? formatCurrency(contract.signing_bonus) : t('common.none', 'Không có')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Timeline & Duration */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            gridColumn: '1 / -1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Calendar size={18} color="#059669" />
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              {t('contract.timeline_section', 'Thời Hạn & Lịch Trình Mùa Giải')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('contract.start_season_label', 'Mùa giải bắt đầu')}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                {t('contract.season_num', 'Mùa {num}').replace('{num}', String(contract.start_season_id || 1))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {t('common.date', 'Ngày')} {contract.start_season_day || 1}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('contract.end_season_label', 'Mùa giải hết hạn')}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: isExpiringSoon ? '#b45309' : '#334155', marginTop: '2px' }}>
                {t('contract.season_num', 'Mùa {num}').replace('{num}', String(endSeason))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {t('common.date', 'Ngày')} {contract.end_season_day || 36}
              </div>
            </div>

            <div style={{ background: isExpiringSoon ? '#fef3c7' : '#ecfdf5', padding: '0.85rem', borderRadius: '8px', border: isExpiringSoon ? '1px solid #fde68a' : '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.75rem', color: isExpiringSoon ? '#92400e' : '#047857' }}>{t('contract.remaining_label', 'Thời gian còn lại')}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isExpiringSoon ? '#b45309' : '#065f46', marginTop: '2px' }}>
                {remainingSeasons} {t('contract.season_unit', 'mùa')}
              </div>
              <div style={{ fontSize: '0.75rem', color: isExpiringSoon ? '#b45309' : '#047857', marginTop: '2px' }}>
                {remainingSeasons === 0
                  ? t('contract.expires_end_of_current', 'Đáo hạn cuối mùa này')
                  : t('contract.active_future', 'Có hiệu lực')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD MỚI: TRẠNG THÁI THỊ TRƯỜNG CHUYỂN NHƯỢNG & CHO MƯỢN (CHỈ DÀNH CHO CLB CHỦ QUẢN) */}
      {isOwnClub && (contract.is_loan_contract ? (
        <div
          style={{
            background: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} color="#64748b" />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#334155', fontSize: '0.92rem' }}>
              {t('contract.loan_no_transfer_market', 'Cầu thủ đang thi đấu theo diện cho mượn. CLB mượn không có quyền niêm yết bán hoặc cho mượn tiếp.')}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
              {t('contract.parent_club_label', 'CLB Chủ Quản (Gốc):')}{' '}
              <strong style={{ color: '#0369a1' }}>
                {contract.parent_club_name || t('player_modal.owning_club', 'CLB Chủ Quản')}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} color="#2563eb" />
              <div>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                  {t('contract.market_listing_title', 'Trạng Thái Thị Trường Chuyển Nhượng')}
                </span>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                  {t('contract.market_listing_desc', 'Quản lý việc niêm yết bán hoặc cho mượn cầu thủ trên Transfer Market')}
                </div>
              </div>
            </div>

            {/* Trạng thái hiện tại Badge */}
            <div>
              {isTransferListed ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                  }}
                >
                  <Tag size={13} />
                  <span>{t('contract.status_transfer_listed', 'Đang Rao Bán')}</span>
                  {currentAskingPrice > 0 && (
                    <span style={{ color: '#059669', fontWeight: 900, marginLeft: '4px' }}>
                      (€{currentAskingPrice.toLocaleString()})
                    </span>
                  )}
                </span>
              ) : isLoanListed ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#fefce8',
                    border: '1px solid #fef08a',
                    color: '#a16207',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                  }}
                >
                  <Clock size={13} />
                  <span>{t('contract.status_loan_listed', 'Đang Cho Mượn')}</span>
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                  }}
                >
                  <span>{t('contract.status_unlisted', 'Nội Bộ CLB (Không Rao Bán)')}</span>
                </span>
              )}
            </div>
          </div>

          {/* Dòng tóm tắt thông số giá trị thị trường và asking price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
              fontSize: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>{t('contract.market_val_label', 'Định giá thị trường:')}</span>{' '}
              <strong style={{ color: '#0f172a' }}>€{marketVal.toLocaleString()}</strong>
            </div>
            {isTransferListed && currentAskingPrice > 0 && (
              <div>
                <span style={{ color: '#64748b' }}>{t('contract.asking_price_label', 'Mức phí tối thiểu yêu cầu (Asking Price):')}</span>{' '}
                <strong style={{ color: '#15803d' }}>€{currentAskingPrice.toLocaleString()}</strong>
              </div>
            )}
          </div>

          {/* Nhóm nút thao tác chuyển nhượng */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => openListingModal('TRANSFER')}
              style={{
                background: isTransferListed ? '#0284c7' : '#2563eb',
                borderColor: isTransferListed ? '#0284c7' : '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
              }}
            >
              <ShoppingCart size={15} />
              <span>{isTransferListed ? t('contract.edit_transfer_btn', 'Chỉnh Sửa Phí Chuyển Nhượng') : t('contract.put_transfer_btn', 'Đưa Lên TTCN (Bán)')}</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => openListingModal('LOAN')}
              style={{
                borderColor: '#eab308',
                color: isLoanListed ? '#854d0e' : '#a16207',
                background: isLoanListed ? '#fef9c3' : 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
              }}
            >
              <Clock size={15} />
              <span>{isLoanListed ? t('contract.edit_loan_btn', 'Cập Nhật Cho Mượn') : t('contract.put_loan_btn', 'Đưa Vào Diện Cho Mượn')}</span>
            </button>

            {(isTransferListed || isLoanListed) && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                disabled={updatingListing}
                onClick={handleRemoveListing}
                style={{
                  borderColor: '#cbd5e1',
                  color: '#dc2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                <X size={15} />
                <span>{t('contract.delist_btn', 'Gỡ Khỏi TTCN')}</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Contract Management Actions (Gia Hạn / Sa Thải / Trả Mượn) */}
      {isOwnClub && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              {contract.is_loan_contract
                ? t('contract.terminate_loan_title', 'Chấm Dứt Mượn / Trả Về CLB Gốc')
                : t('contract.manage_actions_title', 'Thao Tác Hợp Đồng')}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {contract.is_loan_contract
                ? t('contract.terminate_loan_note', 'Chấm dứt mượn trước hạn sẽ hoàn trả cầu thủ về CLB chủ quản gốc.')
                : isExpiringSoon
                ? t('contract.manage_expiring_note', 'Hợp đồng sắp hết hạn. Bạn có thể gia hạn hoặc thanh lý hợp đồng.')
                : t('contract.manage_standard_note', 'Thanh lý trước hạn sẽ giải phóng cầu thủ trở thành tự do.')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Button Gia hạn (chỉ hiện khi hợp đồng chính thức và còn 1 mùa nữa hết hạn hoặc sắp hết hạn) */}
            {!contract.is_loan_contract && isExpiringSoon && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenRenewModal}
                style={{
                  background: '#059669',
                  borderColor: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                }}
              >
                <FileCheck size={16} />
                <span>{t('contract.renew_btn', 'Gia Hạn Hợp Đồng')}</span>
              </button>
            )}

            {/* Button Kết thúc hợp đồng / Sa thải / Trả cầu thủ mượn */}
            <button
              type="button"
              className="btn btn-danger"
              onClick={onOpenTerminateModal}
              style={{
                background: contract.is_loan_contract ? '#ea580c' : '#dc2626',
                borderColor: contract.is_loan_contract ? '#ea580c' : '#dc2626',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
              }}
            >
              {contract.is_loan_contract ? <ArrowRightLeft size={16} /> : <UserMinus size={16} />}
              <span>
                {contract.is_loan_contract
                  ? t('contract.terminate_loan_btn', 'Chấm Dứt Mượn / Trả Về CLB Gốc')
                  : t('contract.terminate_btn', 'Kết Thúc HĐ / Sa Thải')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL NIÊM YẾT THỊ TRƯỜNG CHUYỂN NHƯỢNG / CHO MƯỢN */}
      {showListingModal && (
        <div
          className="modal-backdrop"
          onClick={() => !updatingListing && setShowListingModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '480px',
              width: '92%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={22} className="text-primary" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {t('contract.listing_modal_title', 'Niêm Yết Cầu Thủ Lên Thị Trường')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !updatingListing && setShowListingModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Thông báo Alert */}
            {listingSuccess && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                {listingSuccess}
              </div>
            )}
            {listingError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                {listingError}
              </div>
            )}

            {/* Chọn Chế Độ Niêm Yết */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                {t('contract.choose_listing_type', 'Chọn hình thức niêm yết:')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setListingMode('TRANSFER')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: listingMode === 'TRANSFER' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: listingMode === 'TRANSFER' ? '#eff6ff' : '#ffffff',
                    color: listingMode === 'TRANSFER' ? '#1d4ed8' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Tag size={16} />
                  <span>{t('contract.mode_transfer', 'Rao Bán Đứt')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setListingMode('LOAN')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: listingMode === 'LOAN' ? '2px solid #eab308' : '1px solid #cbd5e1',
                    background: listingMode === 'LOAN' ? '#fefce8' : '#ffffff',
                    color: listingMode === 'LOAN' ? '#a16207' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Clock size={16} />
                  <span>{t('contract.mode_loan', 'Cho Mượn')}</span>
                </button>
              </div>
            </div>

            {/* Nếu chọn RAO BÁN: Nhập mức phí tối thiểu (asking_price) */}
            {listingMode === 'TRANSFER' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {t('contract.asking_price_input_label', 'Mức phí chuyển nhượng tối thiểu (Asking Price €):')}
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {t('contract.valuation_label', 'Định giá:')} <strong>€{marketVal.toLocaleString()}</strong>
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={inputAskingPrice || ''}
                    onChange={(e) => setInputAskingPrice(Math.max(0, Number(e.target.value)))}
                    className="input-text"
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#059669',
                    }}
                  />
                  <span style={{ position: 'absolute', right: 12, top: 10, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
                    €{(inputAskingPrice / 1000000).toFixed(2)}M
                  </span>
                </div>

                {/* Các nút chọn nhanh mức giá */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => setInputAskingPrice(Math.round(marketVal * 0.5))}
                  >
                    {t('contract.quick_min', 'Tối thiểu (50%):')} €{Math.round(marketVal * 0.5 / 1000000 * 10) / 10}M
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => setInputAskingPrice(marketVal)}
                  >
                    {t('contract.quick_standard', 'Chuẩn (100%):')} €{(marketVal / 1000000).toFixed(1)}M
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => setInputAskingPrice(Math.round(marketVal * 1.2))}
                  >
                    +20%: €{Math.round(marketVal * 1.2 / 1000000 * 10) / 10}M
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => setInputAskingPrice(Math.round(marketVal * 1.5))}
                  >
                    +50%: €{Math.round(marketVal * 1.5 / 1000000 * 10) / 10}M
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                  {t('contract.asking_price_hint', '💡 Các CLB khác trên thị trường sẽ không thể đưa ra lời đề nghị thấp hơn mức phí tối thiểu này.')}
                </div>
              </div>
            )}

            {/* Nếu chọn CHO MƯỢN */}
            {listingMode === 'LOAN' && (
              <div
                style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#854d0e',
                }}
              >
                {t('contract.loan_listing_note', 'Cầu thủ sẽ được gắn thẻ sẵn sàng cho mượn. CLB mượn sẽ chi trả toàn bộ hoặc một phần tiền lương thi đấu cho cầu thủ.')}
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={updatingListing}
                onClick={() => setShowListingModal(false)}
              >
                {t('common.cancel', 'Hủy')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={updatingListing}
                onClick={handleConfirmListing}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                {updatingListing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('common.processing', 'Đang cập nhật...')}</span>
                  </>
                ) : (
                  <span>{t('contract.confirm_listing_btn', 'Xác Nhận & Đưa Lên TTCN')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
