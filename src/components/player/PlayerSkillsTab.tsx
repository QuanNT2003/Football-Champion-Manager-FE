import React from 'react';
import { Plus } from 'lucide-react';
import { PlayerDetailData } from '../../types';

interface Props {
  detail: PlayerDetailData | null;
  pPosCode: string;
  skillCategory: 'KEY' | 'ALL' | 'PHYSICAL' | 'TECHNICAL' | 'MENTAL' | 'GOALKEEPING';
  setSkillCategory: (cat: 'KEY' | 'ALL' | 'PHYSICAL' | 'TECHNICAL' | 'MENTAL' | 'GOALKEEPING') => void;
  compared: boolean;
  setCompared: (val: boolean) => void;
  displayedSkills: { left: any[]; right: any[]; total: number; label: string };
}

export const PlayerSkillsTab: React.FC<Props> = ({
  detail,
  pPosCode,
  skillCategory,
  setSkillCategory,
  compared,
  setCompared,
  displayedSkills,
}) => {
  return (
                <div className="pm-skills-view">
                  {/* Category Filter Sub-nav */}
                  <div className="pm-skills-subnav">
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'KEY' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('KEY')}
                      title="10 Chß╗ë sß╗æ cß╗æt l├╡i theo vß╗ï tr├¡ thi ─æß║Ñu (Hß╗ç sß╗æ x3 OVR)"
                    >
                      Γ¡É Cß╗æt l├╡i vß╗ï tr├¡ (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'PHYSICAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('PHYSICAL')}
                      title="Chß╗ë sß╗æ thß╗â chß║Ñt & sß╗⌐c mß║ính"
                    >
                      ≡ƒÅâ Thß╗â chß║Ñt (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'TECHNICAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('TECHNICAL')}
                      title="Chß╗ë sß╗æ kß╗╣ thuß║¡t xß╗¡ l├╜ b├│ng"
                    >
                      ΓÜ╜ Kß╗╣ thuß║¡t (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'MENTAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('MENTAL')}
                      title="Chß╗ë sß╗æ t├óm l├╜ & nh├ún quan chiß║┐n thuß║¡t"
                    >
                      ≡ƒºá T├óm l├╜ (10)
                    </button>
                    {(pPosCode === 'GK' || (detail?.skills?.categories?.goalkeeping?.some((g: any) => g.value > 0))) && (
                      <button
                        className={`pm-subnav-btn ${skillCategory === 'GOALKEEPING' ? 'active' : ''}`}
                        onClick={() => setSkillCategory('GOALKEEPING')}
                        title="Chß╗ë sß╗æ chuy├¬n m├┤n thß╗º m├┤n"
                      >
                        ≡ƒºñ Thß╗º m├┤n (10)
                      </button>
                    )}
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'ALL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('ALL')}
                      title="To├án bß╗Ö 40 chß╗ë sß╗æ trong CSDL"
                    >
                      ≡ƒôï Tß║Ñt cß║ú (40)
                    </button>
                  </div>

                  {/* 2-Column Skills Grid */}
                  <div className="pm-skills-grid">
                    {/* Left Column Skills */}
                    <div className="pm-skills-col">
                      {displayedSkills.left.map((sk: any) => (
                        <div key={sk.id || sk.code} className="pm-skill-item" title={sk.description || `${sk.name} (${sk.code})`}>
                          <span className="pm-skill-name">
                            {sk.is_key && <span className="pm-key-star" title="Chß╗ë sß╗æ cß╗æt l├╡i vß╗ï tr├¡">Γ¡É </span>}
                            <strong className="pm-skill-code">[{sk.code}]</strong> {sk.name}
                          </span>
                          <div className="pm-skill-bar-wrap">
                            <div className="pm-skill-bar-track">
                              <div
                                className="pm-skill-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(5, sk.value))}%` }}
                              >
                                <span className="pm-skill-num">{sk.value}</span>
                              </div>
                            </div>
                            {sk.potential_value && sk.potential_value > sk.value ? (
                              <span className="pm-growth-tag">(+{sk.potential_value - sk.value})</span>
                            ) : sk.growth ? (
                              <span className="pm-growth-tag">({sk.growth})</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column Skills */}
                    <div className="pm-skills-col">
                      {displayedSkills.right.map((sk: any) => (
                        <div key={sk.id || sk.code} className="pm-skill-item" title={sk.description || `${sk.name} (${sk.code})`}>
                          <span className="pm-skill-name">
                            {sk.is_key && <span className="pm-key-star" title="Chß╗ë sß╗æ cß╗æt l├╡i vß╗ï tr├¡">Γ¡É </span>}
                            <strong className="pm-skill-code">[{sk.code}]</strong> {sk.name}
                          </span>
                          <div className="pm-skill-bar-wrap">
                            <div className="pm-skill-bar-track">
                              <div
                                className="pm-skill-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(5, sk.value))}%` }}
                              >
                                <span className="pm-skill-num">{sk.value}</span>
                              </div>
                            </div>
                            {sk.potential_value && sk.potential_value > sk.value ? (
                              <span className="pm-growth-tag">(+{sk.potential_value - sk.value})</span>
                            ) : sk.growth ? (
                              <span className="pm-growth-tag">({sk.growth})</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pm-skills-total-row">
                    <span className="pm-total-label">Tß╗òng ─æiß╗âm {displayedSkills.label}:</span>
                    <span className="pm-total-val">{displayedSkills.total}</span>
                    <span className="pm-calc-icon">≡ƒº«</span>
                  </div>

                  {/* Skills Bottom Row: Progress Chart & Comparison Tool */}
                  <div className="pm-skills-bottom-row">
                    {/* Quality Progress Chart */}
                    <div className="pm-progress-chart-box">
                      <h4 className="pm-sub-title">Average Quality Progress</h4>
                      <div className="pm-svg-chart">
                        {/* Render simple, clean SVG line chart */}
                        {(() => {
                          const pts = detail?.skills?.quality_progress || [];
                          if (pts.length < 2) {
                            return (
                              <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                                Ch╞░a c├│ dß╗» liß╗çu lß╗ïch sß╗¡ t─âng tr╞░ß╗ƒng trong CSDL
                              </div>
                            );
                          }
                          const minQ = Math.min(...pts.map((p) => p.quality)) - 0.5;
                          const maxQ = Math.max(...pts.map((p) => p.quality)) + 0.5;
                          const width = 320;
                          const height = 110;
                          const padX = 25;
                          const padY = 20;

                          const getX = (idx: number) =>
                            padX + (idx / Math.max(1, pts.length - 1)) * (width - 2 * padX);
                          const getY = (q: number) =>
                            height - padY - ((q - minQ) / Math.max(0.1, maxQ - minQ)) * (height - 2 * padY);

                          const polylinePts = pts
                            .map((p, idx) => `${getX(idx)},${getY(p.quality)}`)
                            .join(' ');

                          return (
                            <svg viewBox={`0 0 ${width} ${height}`} className="pm-chart-svg">
                              {/* Grid lines */}
                              <line
                                x1={padX}
                                y1={height - padY}
                                x2={width - padX}
                                y2={height - padY}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                              />
                              <line
                                x1={padX}
                                y1={padY}
                                x2={width - padX}
                                y2={padY}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                              />

                              {/* Progress curve line */}
                              <polyline
                                fill="none"
                                stroke="#15803d"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={polylinePts}
                              />

                              {/* Points & Labels */}
                              {pts.map((p, idx) => {
                                const x = getX(idx);
                                const y = getY(p.quality);
                                return (
                                  <g key={idx}>
                                    <circle cx={x} cy={y} r="4" fill="#15803d" />
                                    <text
                                      x={x}
                                      y={height - 4}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#64748b"
                                    >
                                      {p.age}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Comparison Tool */}
                    <div className="pm-compare-box">
                      <h4 className="pm-sub-title">Player Comparison Tool</h4>
                      <button
                        className={`pm-compare-btn ${compared ? 'added' : ''}`}
                        onClick={() => setCompared(!compared)}
                      >
                        <Plus size={16} />
                        <span>{compared ? '─É├ú th├¬m (1/3)' : 'Add this Player (0/3)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
  );
};
