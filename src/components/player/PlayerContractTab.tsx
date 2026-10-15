import React from 'react';
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
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Player, PlayerDetailData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export interface PlayerContractTabProps {
  player: Player;
  detail: PlayerDetailData | null;
  isOwnClub: boolean;
  onOpenRenewModal: () => void;
  onOpenTerminateModal: () => void;
}

export const PlayerContractTab: React.FC<PlayerContractTabProps> = ({
  player,
  detail,
  isOwnClub,
  onOpenRenewModal,
  onOpenTerminateModal,
}) => {
  const { t } = useTranslation();

  const contract = detail?.contract || (player as any).contract;

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
                  ? t('contract.renew_recommendation', 'Hãy gia hạn hợp đồng ngay để đảm bảo tương lai của cầu thủ tại đội bóng.')
                  : t('contract.expiring_soon_info', 'Cầu thủ sắp trở thành cầu thủ tự do hoặc có thể đàm phán hợp đồng.')}
              </div>
            </div>
          </div>

          {isOwnClub && (
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
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('contract.club_label', 'Câu Lạc Bộ:')}</span>
              <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {clubLogo && <img src={clubLogo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />}
                <span>{clubName}</span>
              </span>
            </div>

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
              <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>
                {contract.is_loan_contract ? t('contract.loan_contract', 'Hợp Đồng Cho Mượn') : t('contract.official_contract', 'Hợp Đồng Chính Thức')}
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

      {/* Contract Management Actions (Only for Own Club) */}
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
              {t('contract.manage_actions_title', 'Thao Tác Hợp Đồng')}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {isExpiringSoon
                ? t('contract.manage_expiring_note', 'Hợp đồng sắp hết hạn. Bạn có thể gia hạn hoặc thanh lý hợp đồng.')
                : t('contract.manage_standard_note', 'Thanh lý trước hạn sẽ giải phóng cầu thủ trở thành tự do.')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Button Gia hạn (chỉ hiện khi còn 1 mùa nữa hết hạn hoặc sắp hết hạn) */}
            {isExpiringSoon && (
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

            {/* Button Kết thúc hợp đồng / Sa thải */}
            <button
              type="button"
              className="btn btn-danger"
              onClick={onOpenTerminateModal}
              style={{
                background: '#dc2626',
                borderColor: '#dc2626',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
              }}
            >
              <UserMinus size={16} />
              <span>{t('contract.terminate_btn', 'Kết Thúc HĐ / Sa Thải')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
