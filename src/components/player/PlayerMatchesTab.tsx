import React from 'react';
import { HelpCircle } from 'lucide-react';
import { PlayerDetailData } from '../../types';

interface Props {
  detail: PlayerDetailData | null;
}

export const PlayerMatchesTab: React.FC<Props> = ({ detail }) => {
  return (
              
                <div className="pm-matches-view">
                  <div className="pm-matches-header-stat">
                    <span>
                      Matches: <strong>{detail?.matches?.total ?? 0}</strong> | Missed:{' '}
                      <strong>{detail?.matches?.missed || 0} ({detail?.matches?.missed_pct || '0%'})</strong>
                    </span>
                    <HelpCircle size={14} className="pm-inline-help" />
                  </div>

                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>D</th>
                          <th>Opponent</th>
                          <th className="text-center">Result</th>
                          <th>Min</th>
                          <th>Saves/Tackles</th>
                          <th>Key/Ass</th>
                          <th>Shot/Goal</th>
                          <th className="text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.matches?.list || detail.matches.list.length === 0) ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có trận đấu nào được ghi nhận trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.matches.list.map((m, idx) => (
                          <tr key={idx}>
                            <td className="pm-dim-cell">{m.day}</td>
                            <td className="pm-bold-cell">{m.opponent}</td>
                            <td className="text-center">
                              <span
                                className={`pm-result-badge ${
                                  m.outcome === 'WIN'
                                    ? 'res-win'
                                    : m.outcome === 'LOSS'
                                    ? 'res-loss'
                                    : 'res-draw'
                                }`}
                              >
                                {m.result}
                              </span>
                            </td>
                            <td>{m.minutes}'</td>
                            <td>{m.saves_or_tackles}</td>
                            <td>{m.key_ass}</td>
                            <td>{m.shot_goal}</td>
                            <td className="text-right pm-rating-cell">{m.rating.toFixed(2)}</td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
  );
};
