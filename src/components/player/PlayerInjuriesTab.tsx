import React from 'react';
import { AlertCircle, HeartPulse } from 'lucide-react';
import { PlayerDetailData } from '../../types';

interface Props {
  detail: PlayerDetailData | null;
}

export const PlayerInjuriesTab: React.FC<Props> = ({ detail }) => {
  return (
                <div className="pm-injuries-view">
                  {/* Current Active Injury Status */}
                  <div className="pm-injury-status-box">
                    {detail?.active_injury ? (
                      <div className="pm-status-alert pm-status-injured">
                        <AlertCircle size={20} />
                        <div>
                          <strong>Đang gặp chấn thương: {detail.active_injury.injury_type}</strong>
                          <p>
                            Mức độ: {detail.active_injury.severity} • Dự kiến nghỉ thi đấu thêm{' '}
                            {detail.active_injury.days_remaining} ngày nữa.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pm-status-alert pm-status-healthy">
                        <HeartPulse size={20} />
                        <div>
                          <strong>Thể trạng hoàn toàn khỏe mạnh</strong>
                          <p>Cầu thủ sẵn sàng 100% cho mọi trận đấu và các bài tập huấn luyện.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="pm-sub-title">📋 Hồ sơ chấn thương trong sự nghiệp</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>Loại chấn thương</th>
                          <th>Mức độ</th>
                          <th>Số ngày nghỉ</th>
                          <th>Thời gian</th>
                          <th className="text-right">Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.injuries_tab?.history || detail.injuries_tab.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có hồ sơ chấn thương nào trong cơ sở dữ liệu
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
                                  ? 'Nặng'
                                  : inj.severity === 'MODERATE'
                                  ? 'Trung bình'
                                  : 'Nhẹ'}
                              </span>
                            </td>
                            <td>{inj.days_missed} ngày</td>
                            <td>{inj.season}</td>
                            <td className="text-right">
                              <span
                                className={`pm-status-tag ${
                                  inj.status === 'ACTIVE' ? 'tag-active' : 'tag-recovered'
                                }`}
                              >
                                {inj.status === 'ACTIVE' ? 'Đang điều trị' : 'Đã bình phục'}
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
