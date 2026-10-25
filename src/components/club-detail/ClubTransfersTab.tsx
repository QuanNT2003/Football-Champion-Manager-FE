import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Loader2,
} from 'lucide-react';
import { ClubTransfersResponse } from '../../types';
import { useTranslation } from '../../i18n';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  transfers: ClubTransfersResponse | null;
  loadingTransfers: boolean;
}

export const ClubTransfersTab: React.FC<Props> = ({
  transfers,
  loadingTransfers,
}) => {
  const { t } = useTranslation();
  const [transferTab, setTransferTab] = useState<'arrivals' | 'departures'>('arrivals');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 3 Thẻ thống kê tài chính */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626' }}>
            {t('club_detail.total_spent')}
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626', margin: '4px 0 0', fontFamily: 'var(--font-game)' }}>
            {formatCurrency(transfers?.totalSpend || 0)}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669' }}>
            {t('club_detail.total_earned')}
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', margin: '4px 0 0', fontFamily: 'var(--font-game)' }}>
            {formatCurrency(transfers?.totalIncome || 0)}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7' }}>
            {t('club_detail.net_spend')}
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0', fontFamily: 'var(--font-game)' }}>
            {formatCurrency((transfers?.totalIncome || 0) - (transfers?.totalSpend || 0))}
          </h3>
        </div>
      </div>

      {/* Toggle Đến / Đi */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className={`btn btn-sm ${transferTab === 'arrivals' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTransferTab('arrivals')}
          style={{ fontWeight: 700 }}
        >
          📥 {t('club_detail.arrivals')} ({transfers?.arrivals.length ?? 0})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${transferTab === 'departures' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTransferTab('departures')}
          style={{ fontWeight: 700 }}
        >
          📤 {t('club_detail.departures')} ({transfers?.departures.length ?? 0})
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px 20px' }}>
        {loadingTransfers ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin text-emerald-600" style={{ margin: '0 auto 8px' }} />
            <span>{t('common.loading')}...</span>
          </div>
        ) : (() => {
          const currentList = transferTab === 'arrivals' ? transfers?.arrivals || [] : transfers?.departures || [];
          if (currentList.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <ArrowLeftRight size={40} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                <p>{t('club_detail.no_transfers')}</p>
              </div>
            );
          }

          return (
            <table className="table-hud">
              <thead>
                <tr>
                  <th>{t('club_detail.col_player')}</th>
                  <th>{t('club_detail.col_pos')}</th>
                  <th>{t('club_detail.col_age')}</th>
                  <th>{transferTab === 'arrivals' ? t('club_detail.from_club') : t('club_detail.to_club')}</th>
                  <th>{t('club_detail.contract_type')}</th>
                  <th style={{ textAlign: 'right' }}>{t('club_detail.transfer_fee')}</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((tItem) => (
                  <tr key={tItem.id}>
                    <td><strong>{tItem.player?.name}</strong></td>
                    <td><span className="position-tag pos-mid">{tItem.player?.position}</span></td>
                    <td>{tItem.player?.age}</td>
                    <td><strong>{tItem.other_club?.name || 'Tự do'}</strong></td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: tItem.transfer_type === 'LOAN' ? '#fef3c7' : '#dcfce7',
                          color: tItem.transfer_type === 'LOAN' ? '#b45309' : '#15803d',
                        }}
                      >
                        {tItem.transfer_type === 'LOAN' ? t('club_detail.loan_type') : t('club_detail.buy_type')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#15803d', fontFamily: 'var(--font-game)' }}>
                        {formatCurrency(tItem.transfer_fee)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  );
};
