import { useTranslation } from '../../i18n';
import React from 'react';
import { AlertCircle, HeartPulse } from 'lucide-react';
import { PlayerDetailData } from '../../types';

interface Props {
  detail: PlayerDetailData | null;
}

export const PlayerInjuriesTab: React.FC<Props> = ({ detail }) => {
  const { t } = useTranslation();
  return (
                <div className="pm-injuries-view">
                  {/* Current Active Injury Status */}
                  <div className="pm-injury-status-box">
                    {detail?.active_injury ? (
                      <div className="pm-status-alert pm-status-injured">
                        <AlertCircle size={20} />
                        <div>
                          <strong>{t('player.injured_badge')}: {detail.active_injury.injury_type}</strong>
                          <p>
                            {t('injury.severity_label', 'Mức độ:')} {detail.active_injury.severity} • {t('injury.expected_days', 'Dự kiến nghỉ thi đấu thêm')}{' '}
                            {detail.active_injury.days_remaining} {t('player.days_remaining')}.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pm-status-alert pm-status-healthy">
                        <HeartPulse size={20} />
                        <div>
                          <strong>{t('injury.healthy_title', 'Thể trạng hoàn toàn khỏe mạnh')}</strong>
                          <p>{t('injury.healthy_desc', 'Cầu thủ sẵn sàng 100% cho mọi trận đấu và các bài tập huấn luyện.')}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="pm-sub-title">{t('injury.history_title', '📋 Hồ sơ chấn thương trong sự nghiệp')}</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>{t('injury.col_type', 'Loại chấn thương')}</th>
                          <th>{t('injury.col_severity', 'Mức độ')}</th>
                          <th>{t('injury.col_days', 'Số ngày nghỉ')}</th>
                          <th>{t('injury.col_time', 'Thời gian')}</th>
                          <th className="text-right">{t('injury.col_status', 'Tình trạng')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.injuries_tab?.history || detail.injuries_tab.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              {t('injury.no_injuries', 'Chưa có hồ sơ chấn thương nào trong cơ sở dữ liệu')}
                            </td>
                          </tr>
                        ) : (detail.injuries_tab.history.map((inj) => (
                          <tr key={inj.id}>
                            <td className="pm-bold-cell">{inj.injury_name}</td>
                            <td>
                              <span
                                className={`pm-sev-tag ${
                                  inj.severity === 'SEVERE'
                                    ? 'sev-high'
                                    : inj.severity === 'MODERATE'
                                    ? 'sev-mid'
                                    : 'sev-low'
                                }`}
                              >
                                {inj.severity === 'SEVERE'
                                  ? t('injury.sev_severe', 'Nặng')
                                  : inj.severity === 'MODERATE'
                                  ? t('injury.sev_medium', 'Trung bình')
                                  : t('injury.sev_light', 'Nhẹ')}
                              </span>
                            </td>
                            <td>{t('injury.days_count', '{days} ngày').replace('{days}', String(inj.days_missed))}</td>
                            <td>{inj.season}</td>
                            <td className="text-right">
                              <span
                                className={`pm-status-tag ${
                                  inj.status === 'ACTIVE' ? 'tag-active' : 'tag-recovered'
                                }`}
                              >
                                {inj.status === 'ACTIVE' ? t('injury.status_active', 'Đang điều trị') : t('injury.status_recovered', 'Đã bình phục')}
                              </span>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
  );
};
