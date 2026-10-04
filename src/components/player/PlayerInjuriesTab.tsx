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
                          <strong>─Éang gß║╖p chß║Ñn th╞░╞íng: {detail.active_injury.injury_type}</strong>
                          <p>
                            Mß╗⌐c ─æß╗Ö: {detail.active_injury.severity} ΓÇó Dß╗▒ kiß║┐n nghß╗ë thi ─æß║Ñu th├¬m{' '}
                            {detail.active_injury.days_remaining} ng├áy nß╗»a.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pm-status-alert pm-status-healthy">
                        <HeartPulse size={20} />
                        <div>
                          <strong>Thß╗â trß║íng ho├án to├án khß╗Åe mß║ính</strong>
                          <p>Cß║ºu thß╗º sß║╡n s├áng 100% cho mß╗ìi trß║¡n ─æß║Ñu v├á c├íc b├ái tß║¡p huß║Ñn luyß╗çn.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="pm-sub-title">≡ƒôï Hß╗ô s╞í chß║Ñn th╞░╞íng trong sß╗▒ nghiß╗çp</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>Loß║íi chß║Ñn th╞░╞íng</th>
                          <th>Mß╗⌐c ─æß╗Ö</th>
                          <th>Sß╗æ ng├áy nghß╗ë</th>
                          <th>Thß╗¥i gian</th>
                          <th className="text-right">T├¼nh trß║íng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.injuries_tab?.history || detail.injuries_tab.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Ch╞░a c├│ hß╗ô s╞í chß║Ñn th╞░╞íng n├áo trong c╞í sß╗ƒ dß╗» liß╗çu
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
                                  ? 'Nß║╖ng'
                                  : inj.severity === 'MODERATE'
                                  ? 'Trung b├¼nh'
                                  : 'Nhß║╣'}
                              </span>
                            </td>
                            <td>{inj.days_missed} ng├áy</td>
                            <td>{inj.season}</td>
                            <td className="text-right">
                              <span
                                className={`pm-status-tag ${
                                  inj.status === 'ACTIVE' ? 'tag-active' : 'tag-recovered'
                                }`}
                              >
                                {inj.status === 'ACTIVE' ? '─Éang ─æiß╗üu trß╗ï' : '─É├ú b├¼nh phß╗Ñc'}
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
