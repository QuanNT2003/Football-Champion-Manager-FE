import { useTranslation } from '../../i18n';
import React from 'react';
import { PlayerDetailData } from '../../types';

interface Props {
  detail: PlayerDetailData | null;
}

export const PlayerStatsTab: React.FC<Props> = ({ detail }) => {
  const { t } = useTranslation();
  return (
                <div className="pm-stats-view">
                  {/* Career Totals Bar */}
                  <div className="pm-career-totals-bar">
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Matches</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.matches ?? 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Caps</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.caps || 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Tackles</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.tackles ?? 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Key/Ass</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.key_ass || '0/0'}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Shot/Goal</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.shot_goal || '0/0'}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Rating</span>
                      <span className="pm-stat-mini-val">
                        {Number(detail?.statistics?.career_totals?.rating ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>S</th>
                          <th>Team</th>
                          <th>Avg. Q</th>
                          <th>Matches</th>
                          <th>Tackles</th>
                          <th>Key/Ass</th>
                          <th>Shot/Goal</th>
                          <th className="text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.statistics?.seasons || detail.statistics.seasons.length === 0) ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              {t('player.no_stats')}
                            </td>
                          </tr>
                        ) : (detail.statistics.seasons.map((s, idx) => (
                          <tr key={idx}>
                            <td className="pm-dim-cell">{s.season}</td>
                            <td className="pm-team-name-cell">{s.team}</td>
                            <td>{s.avg_quality.toFixed(2)}</td>
                            <td>{s.matches}</td>
                            <td>{s.tackles}</td>
                            <td>{s.key_ass}</td>
                            <td>{s.shot_goal}</td>
                            <td className="text-right pm-rating-cell">{s.rating.toFixed(2)}</td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
  );
};
