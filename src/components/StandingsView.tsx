import React, { useState, useEffect } from 'react';
import { competitionsApi, CompetitionTeam } from '../services/competitions.service';
import { Competition, Standing, PlayerStat, Club } from '../types';
import {
  Trophy,
  Award,
  TrendingUp,
  Target,
  Activity,
  Shield,
  Building2,
  UserCheck,
  Star,
  Globe2,
  Flag,
  Sparkles,
} from 'lucide-react';

interface StandingsViewProps {
  club: Club | null;
  currentClubId: string;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ club, currentClubId }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [standings, setStandings] = useState<any[]>([]);
  const [teams, setTeams] = useState<CompetitionTeam[]>([]);
  const [topScorers, setTopScorers] = useState<PlayerStat[]>([]);
  const [topAssists, setTopAssists] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'teams' | 'stats'>('table');

  // Club geographical context
  const countryId = club?.country_id || club?.country_detail?.id || '114';
  const countryName =
    club?.country_detail?.name ||
    (typeof club?.country === 'string' ? club?.country : (club?.country as any)?.name) ||
    'Việt Nam';
  const confedCode =
    club?.confederation?.code ||
    club?.country_detail?.confederation?.code ||
    'AFC';
  const clubCompId = club?.current_competition_id ? club.current_competition_id.toString() : '3';

  useEffect(() => {
    loadCompetitions();
  }, [countryId]);

  useEffect(() => {
    if (selectedCompId) {
      loadCompData(selectedCompId);
    }
  }, [selectedCompId, countryId]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const data = await competitionsApi.getAll(countryId);
      const list: Competition[] = Array.isArray(data) ? data : (data as any)?.items || [];
      setCompetitions(list);

      // Default to club's active competition if available in list
      if (list.length > 0) {
        const foundClubComp = list.find((c) => c.id.toString() === clubCompId);
        if (foundClubComp) {
          setSelectedCompId(foundClubComp.id.toString());
        } else {
          setSelectedCompId(list[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompData = async (compId: string) => {
    try {
      setLoading(true);
      const [tableData, teamsData, scorersData, assistsData] = await Promise.all([
        competitionsApi.getStandings(compId, countryId).catch(() => null),
        competitionsApi.getTeams(compId, countryId).catch(() => []),
        competitionsApi.getTopScorers(compId, countryId).catch(() => []),
        competitionsApi.getTopAssists(compId, countryId).catch(() => []),
      ]);

      const rawStandings = Array.isArray(tableData)
        ? tableData
        : (tableData as any)?.standings || [];
      setStandings(rawStandings);

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setTopScorers(Array.isArray(scorersData) ? scorersData : (scorersData as any)?.items || []);
      setTopAssists(Array.isArray(assistsData) ? assistsData : (assistsData as any)?.items || []);
    } catch (err) {
      console.error('Failed to load competition data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentComp = competitions.find((c) => c.id.toString() === selectedCompId.toString());

  // Group competitions by category for optgroup
  const domesticComps = competitions.filter((c) => c.scope === 'DOMESTIC');
  const continentalComps = competitions.filter((c) => c.scope === 'CONTINENTAL' || c.scope === 'REGIONAL');
  const internationalComps = competitions.filter((c) => c.scope === 'INTERNATIONAL');

  return (
    <div className="view-container">
      {/* Club Context Information Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            ⚽
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Câu Lạc Bộ Chủ Quản Của Bạn
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {club?.name || 'Can Tho Gold Tigers'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', background: 'rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '10px' }}>
            <Flag size={16} />
            <span>Quốc Gia: <strong>{countryName}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', background: 'rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '10px' }}>
            <Globe2 size={16} />
            <span>Châu Lục: <strong>{confedCode}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', background: '#fef08a', color: '#854d0e', padding: '6px 12px', borderRadius: '10px', fontWeight: 700 }}>
            <Sparkles size={16} />
            <span>Giải Đấu Hiện Tại: {currentComp?.displayName || currentComp?.name || 'Tier 3 - Giải Hạng Nhì'}</span>
          </div>
        </div>
      </div>

      {/* Header & Competition Dropdown Selector */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              <Trophy size={24} color="#0284c7" />
              <span>Hệ Thống Giải Đấu & Bảng Xếp Hạng</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Giải quốc nội theo quốc gia ({countryName}) & Cúp châu lục theo liên đoàn ({confedCode})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Grouped Select */}
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="select"
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1.5px solid #bae6fd',
                background: '#ffffff',
                fontWeight: 700,
                color: '#0369a1',
                fontSize: '0.92rem',
                minWidth: '320px',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
              }}
            >
              {domesticComps.length > 0 && (
                <optgroup label={`🇻🇳 Giải Đấu Quốc Nội (${countryName})`}>
                  {domesticComps.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.displayName || comp.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {continentalComps.length > 0 && (
                <optgroup label={`🌏 Cúp Châu Lục (${confedCode})`}>
                  {continentalComps.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.displayName || comp.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {internationalComps.length > 0 && (
                <optgroup label="🏆 Đấu Trường Quốc Tế">
                  {internationalComps.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.displayName || comp.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'table' ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '7px 14px',
                  backgroundColor: activeTab === 'table' ? '#0284c7' : 'transparent',
                  color: activeTab === 'table' ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTab('table')}
              >
                Bảng Xếp Hạng
              </button>

              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'teams' ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '7px 14px',
                  backgroundColor: activeTab === 'teams' ? '#0284c7' : 'transparent',
                  color: activeTab === 'teams' ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={() => setActiveTab('teams')}
              >
                <span>Đội Tham Gia</span>
                {teams.length > 0 && (
                  <span
                    style={{
                      background: activeTab === 'teams' ? '#ffffff' : '#e0f2fe',
                      color: activeTab === 'teams' ? '#0284c7' : '#0369a1',
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {teams.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '7px 14px',
                  backgroundColor: activeTab === 'stats' ? '#0284c7' : 'transparent',
                  color: activeTab === 'stats' ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTab('stats')}
              >
                Thống Kê Cá Nhân
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="card text-center" style={{ padding: '3.5rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: '#64748b', fontWeight: 600 }}>Đang tải dữ liệu giải đấu...</p>
        </div>
      ) : activeTab === 'table' ? (
        /* TAB 1: BẢNG XẾP HẠNG */
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ width: '55px', textAlign: 'center', padding: '12px 8px' }}>Hạng</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Câu Lạc Bộ</th>
                <th style={{ textAlign: 'center', width: '60px' }}>Trận</th>
                <th style={{ textAlign: 'center', width: '55px', color: '#059669' }}>Thắng</th>
                <th style={{ textAlign: 'center', width: '55px', color: '#64748b' }}>Hòa</th>
                <th style={{ textAlign: 'center', width: '55px', color: '#dc2626' }}>Thua</th>
                <th style={{ textAlign: 'center', width: '60px' }}>BT</th>
                <th style={{ textAlign: 'center', width: '60px' }}>BB</th>
                <th style={{ textAlign: 'center', width: '60px' }}>HS</th>
                <th style={{ textAlign: 'center', width: '70px', fontWeight: 800, color: '#0284c7' }}>ĐIỂM</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                    <Trophy size={36} color="#cbd5e1" style={{ marginBottom: '8px', display: 'inline-block' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>Chưa có dữ liệu bảng xếp hạng cho giải đấu này.</p>
                  </td>
                </tr>
              ) : (
                standings.map((row, idx) => {
                  const clubId = row.club?.id || row.club_id;
                  const isCurrent = clubId && clubId.toString() === currentClubId?.toString();
                  const pos = row.position || idx + 1;
                  const wins = row.wins ?? row.won ?? 0;
                  const draws = row.draws ?? row.drawn ?? 0;
                  const losses = row.losses ?? row.lost ?? 0;
                  const gf = row.goals_for ?? 0;
                  const ga = row.goals_against ?? 0;
                  const gd = row.goal_difference ?? gf - ga;
                  const pts = row.points ?? 0;

                  let posBg = '#f1f5f9';
                  let posColor = '#475569';
                  if (pos <= 4) {
                    posBg = '#dbeafe';
                    posColor = '#0284c7';
                  } else if (pos > standings.length - 3 && standings.length > 5) {
                    posBg = '#fee2e2';
                    posColor = '#dc2626';
                  }

                  return (
                    <tr
                      key={row.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isCurrent ? '#f0f9ff' : 'transparent',
                        fontWeight: isCurrent ? 700 : 500,
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            background: posBg,
                            color: posColor,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                          }}
                        >
                          {pos}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.2rem' }}>⚽</span>
                          <div>
                            <span style={{ color: isCurrent ? '#0284c7' : '#0f172a' }}>
                              {row.club?.name || `CLB #${clubId || idx + 1}`}
                            </span>
                            {isCurrent && (
                              <span
                                style={{
                                  marginLeft: '8px',
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  fontSize: '0.68rem',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontWeight: 700,
                                }}
                              >
                                ĐỘI BẠN
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>{row.played ?? 0}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 600 }}>{wins}</td>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{draws}</td>
                      <td style={{ textAlign: 'center', color: '#dc2626' }}>{losses}</td>
                      <td style={{ textAlign: 'center' }}>{gf}</td>
                      <td style={{ textAlign: 'center' }}>{ga}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: gd > 0 ? '#059669' : gd < 0 ? '#dc2626' : '#64748b' }}>
                        {gd > 0 ? `+${gd}` : gd}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, color: '#0284c7' }}>
                        {pts}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Table Legend */}
          <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '2rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, background: '#0284c7', borderRadius: '3px' }}></span>
              Nhóm Tranh Cúp / Suất Thăng Hạng
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, background: '#dc2626', borderRadius: '3px' }}></span>
              Nhóm Nguy Hiểm Xuống Hạng
            </span>
          </div>
        </div>
      ) : activeTab === 'teams' ? (
        /* TAB 2: ĐỘI BÓNG THAM GIA */
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#475569', fontSize: '0.92rem', fontWeight: 600 }}>
              Có <strong>{teams.length}</strong> câu lạc bộ tham dự giải <strong>{currentComp?.displayName || currentComp?.name || ''}</strong>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {teams.length === 0 ? (
              <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '3.5rem' }}>
                <Shield size={36} color="#cbd5e1" style={{ marginBottom: '8px', display: 'inline-block' }} />
                <p style={{ color: '#64748b' }}>Chưa có danh sách đội bóng tham gia giải này.</p>
              </div>
            ) : (
              teams.map((team) => {
                const isCurrent = team.id.toString() === currentClubId?.toString();
                return (
                  <div
                    key={team.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: isCurrent ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      padding: '1.25rem',
                      boxShadow: isCurrent ? '0 4px 16px rgba(2, 132, 199, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      position: 'relative',
                    }}
                  >
                    {isCurrent && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#0284c7',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 700,
                        }}
                      >
                        CLB CỦA BẠN
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: '#f0f9ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          border: '1px solid #bae6fd',
                        }}
                      >
                        ⚽
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          {team.name}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {team.city ? `${team.city}, ` : ''}{team.country || ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={14} color="#0284c7" />
                        <span>Sân: <strong>{team.stadium?.name || 'Sân vận động Quốc gia'}</strong> ({team.stadium?.capacity?.toLocaleString() || '15,000'} chỗ)</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={14} color="#059669" />
                        <span>HLV: <strong>{team.manager?.username || 'Trí tuệ nhân tạo (AI)'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={14} color="#d97706" />
                        <span>Danh tiếng: <strong>{team.reputation?.toLocaleString() || 5000} PTS</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* TAB 3: THỐNG KÊ CÁ NHÂN */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Top Scorers */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              <Award color="#d97706" size={22} />
              <span>Vua Phá Lưới (Top Scorers)</span>
            </h3>

            {topScorers.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>Chưa có dữ liệu bàn thắng nào.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topScorers.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: idx === 0 ? '#fefce8' : '#f8fafc',
                      borderRadius: '12px',
                      border: idx === 0 ? '1px solid #fef08a' : '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 800, color: idx === 0 ? '#ca8a04' : '#64748b', width: '20px' }}>
                        #{idx + 1}
                      </span>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a' }}>
                          {item.player?.name || item.player?.common_name || `${item.player?.first_name || ''} ${item.player?.last_name || ''}`.trim() || 'Cầu thủ'}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {item.club?.name || 'CLB'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 800, fontSize: '1rem' }}>
                      <Target size={16} />
                      <span>{item.goals || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Assists */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              <TrendingUp color="#0284c7" size={22} />
              <span>Vua Kiến Tạo (Top Assists)</span>
            </h3>

            {topAssists.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>Chưa có dữ liệu kiến tạo nào.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topAssists.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: idx === 0 ? '#f0f9ff' : '#f8fafc',
                      borderRadius: '12px',
                      border: idx === 0 ? '1px solid #bae6fd' : '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 800, color: idx === 0 ? '#0284c7' : '#64748b', width: '20px' }}>
                        #{idx + 1}
                      </span>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a' }}>
                          {item.player?.name || item.player?.common_name || `${item.player?.first_name || ''} ${item.player?.last_name || ''}`.trim() || 'Cầu thủ'}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {item.club?.name || 'CLB'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 800, fontSize: '1rem' }}>
                      <Activity size={16} />
                      <span>{item.assists || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
