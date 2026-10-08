import { useTranslation } from '../../i18n';
import React from 'react';
import { Coins } from 'lucide-react';
import { PlayerDetailData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  detail: PlayerDetailData | null;
}

export const PlayerTransfersTab: React.FC<Props> = ({ detail }) => {
  const { t } = useTranslation();
  return (
                <div className="pm-transfers-view">
                  <h4 className="pm-sub-title">🕒 Transfer History</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>From Team</th>
                          <th>To Team</th>
                          <th>Season</th>
                          <th>Avg. Q</th>
                          <th className="text-right">Bid Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.transfers?.history || detail.transfers.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              {t('player.no_transfers')}
                            </td>
                          </tr>
                        ) : (detail.transfers.history.map((t, idx) => (
                          <tr key={idx}>
                            <td className="pm-team-name-cell">{t.from_team}</td>
                            <td className="pm-team-name-cell">{t.to_team}</td>
                            <td>{t.season}</td>
                            <td>{t.avg_quality}</td>
                            <td className="text-right pm-bold-cell">
                              <Coins size={13} className="pm-coin-inline" /> {t.bid_value}
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Potential Upgrades */}
                  <div className="pm-potential-box">
                    <h4 className="pm-sub-title">📈 Potential Upgrades</h4>
                    <p className="pm-potential-desc">
                      {t('player_tab.similar_players_desc', 'Những cầu thủ có chỉ số OVR và tiềm năng tương tự hiện đang có mặt trên thị trường chuyển nhượng hoặc trong học viện bóng đá.')}
                    </p>
                  </div>
                </div>
  );
};
