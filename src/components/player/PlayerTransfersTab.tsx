import { useTranslation } from '../../i18n';
import React from 'react';
import { Coins } from 'lucide-react';
import { PlayerDetailData } from '../../types';

interface Props {
  detail: PlayerDetailData | null;
}

export const PlayerTransfersTab: React.FC<Props> = ({ detail }) => {
  const { t } = useTranslation();
  return (
    <div className="pm-transfers-view">
      <h4 className="pm-sub-title">🕒 {t('player_transfers.title', 'Lịch Sử Chuyển Nhượng')}</h4>
      <div className="pm-table-wrapper">
        <table className="pm-data-table">
          <thead>
            <tr>
              <th>{t('player_transfers.from_team', 'Từ Đội')}</th>
              <th>{t('player_transfers.to_team', 'Đến Đội')}</th>
              <th>{t('player_transfers.season', 'Mùa Giải')}</th>
              <th>{t('player_transfers.avg_quality', 'Chất Lượng TB')}</th>
              <th className="text-right">{t('player_transfers.bid_value', 'Mức Phí')}</th>
            </tr>
          </thead>
          <tbody>
            {(!detail?.transfers?.history || detail.transfers.history.length === 0) ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  {t('player.no_transfers')}
                </td>
              </tr>
            ) : (
              detail.transfers.history.map((tItem, idx) => (
                <tr key={idx}>
                  <td className="pm-team-name-cell">{tItem.from_team}</td>
                  <td className="pm-team-name-cell">{tItem.to_team}</td>
                  <td>{tItem.season}</td>
                  <td>{tItem.avg_quality}</td>
                  <td className="text-right pm-bold-cell pm-bid-cell">
                    <span className="pm-bid-inline-wrap">
                      <Coins size={14} className="pm-coin-inline" />
                      <span>{tItem.bid_value}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Potential Upgrades */}
      <div className="pm-potential-box">
        <h4 className="pm-sub-title">📈 {t('player_transfers.potential_upgrades', 'Cầu Thủ Tương Tự')}</h4>
        <p className="pm-potential-desc">
          {t('player_tab.similar_players_desc', 'Những cầu thủ có chỉ số OVR và tiềm năng tương tự hiện đang có mặt trên thị trường chuyển nhượng hoặc trong học viện bóng đá.')}
        </p>
      </div>
    </div>
  );
};
