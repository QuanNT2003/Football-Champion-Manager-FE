import React, { useState, useEffect } from 'react';
import { competitionsApi, CompetitionTeam } from '../services/competitions.service';
import {
  Competition,
  StandingItem,
  PlayerStat,
  Club,
  GroupStandings,
  KnockoutBracketResponse,
  KnockoutRound,
  KnockoutMatch,
} from '../types';
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
  Layers,
  Swords,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface StandingsViewProps {
  club: Club | null;
  currentClubId: string;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ club, currentClubId }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [groups, setGroups] = useState<GroupStandings[]>([]);
  const [knockoutBracket, setKnockoutBracket] = useState<KnockoutBracketResponse | null>(null);
  const [selectedRoundName, setSelectedRoundName] = useState<string>('all');
  const [compFormatType, setCompFormatType] = useState<'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT'>('LEAGUE');
  const [compFormatLabel, setCompFormatLabel] = useState<string>('Vòng tròn tính điểm');
  const [subTab, setSubTab] = useState<'groups' | 'knockout'>('groups');

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
      setSelectedRoundName('all');

      // Fetch standings, teams, stats and knockout bracket in parallel
      const [tableData, bracketData, teamsData, scorersData, assistsData] = await Promise.all([
        competitionsApi.getStandings(compId, countryId).catch(() => null),
        competitionsApi.getKnockoutBracket(compId, countryId).catch(() => null),
        competitionsApi.getTeams(compId, countryId).catch(() => []),
        competitionsApi.getTopScorers(compId, countryId).catch(() => []),
        competitionsApi.getTopAssists(compId, countryId).catch(() => []),
      ]);

      const foundComp = competitions.find((c) => c.id.toString() === compId.toString());

      // Parse standings and groups
      if (tableData && typeof tableData === 'object' && !Array.isArray(tableData)) {
        setStandings(tableData.standings || []);
        setGroups(tableData.groups || []);
        const format = tableData.formatType || foundComp?.formatType || 'LEAGUE';
        setCompFormatType(format);
        setCompFormatLabel(tableData.formatLabel || foundComp?.formatLabel || 'Vòng tròn tính điểm');

        if (format === 'GROUP_KNOCKOUT') {
          setSubTab(tableData.groups && tableData.groups.length > 0 ? 'groups' : 'knockout');
        }
      } else {
        const rawStandings = Array.isArray(tableData) ? tableData : [];
        setStandings(rawStandings);
        setGroups([]);
        const format = foundComp?.formatType || 'LEAGUE';
        setCompFormatType(format);
        setCompFormatLabel(foundComp?.formatLabel || 'Vòng tròn tính điểm');
      }

      setKnockoutBracket(bracketData || null);
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

  // Filter knockout matches by selected round
  const allKnockoutRounds = knockoutBracket?.rounds || [];
  const filteredKnockoutRounds =
    selectedRoundName === 'all'
      ? allKnockoutRounds
      : allKnockoutRounds.filter((r) => r.roundName === selectedRoundName);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                <Trophy size={24} color="#0284c7" />
                <span>{currentComp?.displayName || currentComp?.name || 'Hệ Thống Giải Đấu'}</span>
              </h2>

              {/* Format Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor:
                    compFormatType === 'KNOCKOUT'
                      ? '#fef3c7'
                      : compFormatType === 'GROUP_KNOCKOUT'
                      ? '#e0e7ff'
                      : '#e0f2fe',
                  color:
                    compFormatType === 'KNOCKOUT'
                      ? '#b45309'
                      : compFormatType === 'GROUP_KNOCKOUT'
                      ? '#4338ca'
                      : '#0369a1',
                  border: `1px solid ${
                    compFormatType === 'KNOCKOUT'
                      ? '#fde68a'
                      : compFormatType === 'GROUP_KNOCKOUT'
                      ? '#c7d2fe'
                      : '#bae6fd'
                  }`,
                }}
              >
                {compFormatType === 'KNOCKOUT' ? (
                  <Swords size={14} />
                ) : compFormatType === 'GROUP_KNOCKOUT' ? (
                  <Layers size={14} />
                ) : (
                  <Trophy size={14} />
                )}
                <span>{compFormatLabel}</span>
              </span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0' }}>
              {compFormatType === 'KNOCKOUT'
                ? 'Đấu loại trực tiếp qua các vòng đấu phân cặp'
                : compFormatType === 'GROUP_KNOCKOUT'
                ? 'Giai đoạn 1: 8 Bảng đấu (32 đội) - Giai đoạn 2: Vòng loại trực tiếp Knockout'
                : `Giải vô địch quốc gia đường trường (${countryName})`}
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
                {compFormatType === 'KNOCKOUT' ? 'Nhánh Đấu Cúp' : 'Bảng Xếp Hạng & Lịch'}
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
        /* TAB 1: HIỂN THỊ THEO THỂ THỨC */
        <div>
          {/* A. THỂ THỨC GROUP_KNOCKOUT (Cúp C1, C2, C3 Châu Lục) */}
          {compFormatType === 'GROUP_KNOCKOUT' && (
            <div>
              {/* Sub Tabs: 8 Bảng Đấu VS Nhánh Đấu Knockout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSubTab('groups')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: subTab === 'groups' ? '#0284c7' : '#f1f5f9',
                      color: subTab === 'groups' ? '#ffffff' : '#475569',
                      boxShadow: subTab === 'groups' ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
                    }}
                  >
                    <Layers size={16} />
                    <span>Vòng Bảng (8 Bảng Đấu)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubTab('knockout')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: subTab === 'knockout' ? '#0284c7' : '#f1f5f9',
                      color: subTab === 'knockout' ? '#ffffff' : '#475569',
                      boxShadow: subTab === 'knockout' ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
                    }}
                  >
                    <Swords size={16} />
                    <span>Vòng Loại Trực Tiếp (Knockout)</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {subTab === 'groups'
                    ? 'Top 2 đội mỗi bảng (16 đội) giành quyền vào Vòng 1/8 Knockout'
                    : 'Các vòng đấu 2 lượt đi-về, Chung kết 1 trận duy nhất'}
                </div>
              </div>

              {/* View: 8 Bảng đấu dạng Grid */}
              {subTab === 'groups' ? (
                <div>
                  {groups.length === 0 ? (
                    <div className="card text-center" style={{ padding: '3.5rem' }}>
                      <p style={{ color: '#64748b' }}>Chưa có dữ liệu bảng đấu cho giải đấu này.</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '16px',
                      }}
                    >
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="card"
                          style={{
                            padding: 0,
                            overflow: 'hidden',
                            borderRadius: '14px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div
                            style={{
                              background: 'linear-gradient(90deg, #0369a1 0%, #0284c7 100%)',
                              color: '#ffffff',
                              padding: '10px 14px',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{group.name}</span>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                              Top 2 Đi Tiếp
                            </span>
                          </div>

                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                <th style={{ padding: '6px 8px', width: '36px', textAlign: 'center' }}>#</th>
                                <th style={{ padding: '6px 10px', textAlign: 'left' }}>Câu Lạc Bộ</th>
                                <th style={{ padding: '6px 6px', textAlign: 'center', width: '35px' }}>Tr</th>
                                <th style={{ padding: '6px 6px', textAlign: 'center', width: '40px' }}>HS</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', width: '45px', fontWeight: 800, color: '#0284c7' }}>ĐIỂM</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.standings.map((s, idx) => {
                                const isAdvancing = idx < 2;
                                const isCurrent = s.club?.id && s.club.id.toString() === currentClubId?.toString();
                                return (
                                  <tr
                                    key={s.id || idx}
                                    style={{
                                      borderBottom: '1px solid #f1f5f9',
                                      background: isCurrent ? '#f0f9ff' : isAdvancing ? '#f0fdf4' : 'transparent',
                                      fontWeight: isCurrent ? 700 : 500,
                                    }}
                                  >
                                    <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                                      <span
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '6px',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          background: isAdvancing ? '#bbf7d0' : '#f1f5f9',
                                          color: isAdvancing ? '#15803d' : '#64748b',
                                        }}
                                      >
                                        {idx + 1}
                                      </span>
                                    </td>
                                    <td style={{ padding: '8px 10px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>⚽</span>
                                        <span style={{ color: isCurrent ? '#0284c7' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                          {s.club?.name || 'CLB'}
                                        </span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '8px 4px', color: '#64748b' }}>{s.played}</td>
                                    <td style={{ textAlign: 'center', padding: '8px 4px', color: s.goal_difference > 0 ? '#16a34a' : s.goal_difference < 0 ? '#dc2626' : '#64748b' }}>
                                      {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '8px 8px', fontWeight: 800, color: isAdvancing ? '#15803d' : '#0f172a' }}>
                                      {s.points}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* View Knockout Rounds of Continental Cup */
                <KnockoutMatchesView
                  rounds={filteredKnockoutRounds}
                  allRounds={allKnockoutRounds}
                  selectedRoundName={selectedRoundName}
                  onSelectRound={setSelectedRoundName}
                  currentClubId={currentClubId}
                />
              )}
            </div>
          )}

          {/* B. THỂ THỨC KNOCKOUT THUẦN (Cúp Quốc Gia) */}
          {compFormatType === 'KNOCKOUT' && (
            <KnockoutMatchesView
              rounds={filteredKnockoutRounds}
              allRounds={allKnockoutRounds}
              selectedRoundName={selectedRoundName}
              onSelectRound={setSelectedRoundName}
              currentClubId={currentClubId}
            />
          )}

          {/* C. THỂ THỨC LEAGUE ĐƯỜNG TRƯỜNG (Giải VĐQG Tier 1 - 5) */}
          {compFormatType === 'LEAGUE' && (
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

                      // Qualification logic for Tier 1
                      let posBg = '#f1f5f9';
                      let posColor = '#475569';
                      let badgeTooltip = '';
                      if (pos <= 3) {
                        posBg = '#dbeafe';
                        posColor = '#1e40af';
                        badgeTooltip = 'Cúp C1 Châu Lục';
                      } else if (pos <= 5) {
                        posBg = '#e0e7ff';
                        posColor = '#4338ca';
                        badgeTooltip = 'Cúp C2 Châu Lục';
                      } else if (pos <= 7) {
                        posBg = '#fef3c7';
                        posColor = '#92400e';
                        badgeTooltip = 'Cúp C3 Châu Lục';
                      } else if (pos > standings.length - 2 && standings.length > 5) {
                        posBg = '#fee2e2';
                        posColor = '#dc2626';
                        badgeTooltip = 'Rớt Hạng';
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
                              title={badgeTooltip}
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
                                  {row.club?.name || 'Câu lạc bộ'}
                                </span>
                                {isCurrent && (
                                  <span
                                    style={{
                                      marginLeft: '8px',
                                      background: '#0284c7',
                                      color: '#ffffff',
                                      fontSize: '0.68rem',
                                      padding: '2px 6px',
                                      borderRadius: '6px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    BẠN
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td style={{ textAlign: 'center', padding: '12px 8px' }}>{row.played}</td>
                          <td style={{ textAlign: 'center', padding: '12px 8px', color: '#059669', fontWeight: 600 }}>{wins}</td>
                          <td style={{ textAlign: 'center', padding: '12px 8px', color: '#64748b' }}>{draws}</td>
                          <td style={{ textAlign: 'center', padding: '12px 8px', color: '#dc2626' }}>{losses}</td>
                          <td style={{ textAlign: 'center', padding: '12px 8px', color: '#64748b' }}>{gf}</td>
                          <td style={{ textAlign: 'center', padding: '12px 8px', color: '#64748b' }}>{ga}</td>
                          <td style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600, color: gd > 0 ? '#16a34a' : gd < 0 ? '#dc2626' : '#64748b' }}>
                            {gd > 0 ? `+${gd}` : gd}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 800, color: '#0284c7', fontSize: '1.05rem' }}>
                            {pts}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Legend for League Qualifications */}
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  fontSize: '0.78rem',
                  color: '#64748b',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#dbeafe', border: '1px solid #93c5fd' }}></span>
                  <span>Top 1-3: Vé Cúp C1 Châu Lục</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e0e7ff', border: '1px solid #a5b4fc' }}></span>
                  <span>Top 4-5: Vé Cúp C2 Châu Lục</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fef3c7', border: '1px solid #fde68a' }}></span>
                  <span>Top 6-7: Vé Cúp C3 Châu Lục</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fee2e2', border: '1px solid #fca5a5' }}></span>
                  <span>Hạng 17-18: Xuống hạng Tier 2</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'teams' ? (
        /* TAB 2: DANH SÁCH ĐỘI */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {teams.length === 0 ? (
              <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '3.5rem' }}>
                <p style={{ color: '#64748b' }}>Không có thông tin đội bóng tham dự.</p>
              </div>
            ) : (
              teams.map((team) => {
                const isCurrent = team.id.toString() === currentClubId?.toString();
                return (
                  <div
                    key={team.id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: isCurrent ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative',
                      background: isCurrent ? '#f0f9ff' : '#ffffff',
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

interface KnockoutMatchesViewProps {
  rounds: KnockoutRound[];
  allRounds: KnockoutRound[];
  selectedRoundName: string;
  onSelectRound: (round: string) => void;
  currentClubId: string;
}

const KnockoutMatchesView: React.FC<KnockoutMatchesViewProps> = ({
  rounds,
  allRounds,
  selectedRoundName,
  onSelectRound,
  currentClubId,
}) => {
  if (allRounds.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '3.5rem' }}>
        <Swords size={36} color="#cbd5e1" style={{ marginBottom: '8px', display: 'inline-block' }} />
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>
          Chưa có cặp đấu loại trực tiếp (Knockout) nào được sinh cho mùa giải này.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Round Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => onSelectRound('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: selectedRoundName === 'all' ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
            background: selectedRoundName === 'all' ? '#0284c7' : '#ffffff',
            color: selectedRoundName === 'all' ? '#ffffff' : '#475569',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Tất Cả Vòng Đấu
        </button>

        {allRounds.map((r, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectRound(r.roundName)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: selectedRoundName === r.roundName ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
              background: selectedRoundName === r.roundName ? '#0284c7' : '#ffffff',
              color: selectedRoundName === r.roundName ? '#ffffff' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {r.roundName} ({r.matches.length} trận)
          </button>
        ))}
      </div>

      {/* Rounds Container */}
      {rounds.map((round, rIdx) => (
        <div
          key={rIdx}
          className="card"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Round Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              borderBottom: '1.5px solid #f1f5f9',
              paddingBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                {rIdx + 1}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {round.roundName}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="#0284c7" />
                <span>Ngày giải đấu: <strong>Day {round.seasonDay}</strong></span>
              </div>
              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                {round.matches.length} cặp đấu
              </span>
            </div>
          </div>

          {/* Matches Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '12px',
            }}
          >
            {round.matches.map((match) => {
              const isHomeCurrent = match.homeClub?.id === currentClubId?.toString();
              const isAwayCurrent = match.awayClub?.id === currentClubId?.toString();
              const isMyMatch = isHomeCurrent || isAwayCurrent;
              const isCompleted = match.status === 'COMPLETED';

              const isHomeWinner = match.winnerClubId && match.winnerClubId === match.homeClub?.id;
              const isAwayWinner = match.winnerClubId && match.winnerClubId === match.awayClub?.id;

              return (
                <div
                  key={match.id}
                  style={{
                    border: isMyMatch ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    background: isMyMatch ? '#f0f9ff' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Top Bar: Match Info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: '#64748b',
                      borderBottom: '1px solid #f8fafc',
                      paddingBottom: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>{match.kickoffTime || '20:00'}</span>
                    </div>

                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        background: isCompleted ? '#dcfce7' : '#f1f5f9',
                        color: isCompleted ? '#15803d' : '#64748b',
                      }}
                    >
                      {isCompleted ? 'Đã Kết Thúc' : 'Sắp Diễn Ra'}
                    </span>
                  </div>

                  {/* Team Home */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      background: isHomeWinner ? '#f0fdf4' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>⚽</span>
                      <span
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: isHomeWinner || isHomeCurrent ? 700 : 500,
                          color: isHomeWinner ? '#15803d' : isHomeCurrent ? '#0284c7' : '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {match.homeClub?.name || 'Đội Nhà'}
                      </span>
                      {isHomeCurrent && (
                        <span style={{ fontSize: '0.65rem', background: '#0284c7', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>
                          BẠN
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isHomeWinner && <CheckCircle2 size={14} color="#16a34a" />}
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: isHomeWinner ? '#16a34a' : '#0f172a',
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {match.homeScore !== null ? match.homeScore : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Team Away */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      background: isAwayWinner ? '#f0fdf4' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>⚽</span>
                      <span
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: isAwayWinner || isAwayCurrent ? 700 : 500,
                          color: isAwayWinner ? '#15803d' : isAwayCurrent ? '#0284c7' : '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {match.awayClub?.name || 'Đội Khách'}
                      </span>
                      {isAwayCurrent && (
                        <span style={{ fontSize: '0.65rem', background: '#0284c7', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>
                          BẠN
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isAwayWinner && <CheckCircle2 size={14} color="#16a34a" />}
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: isAwayWinner ? '#16a34a' : '#0f172a',
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {match.awayScore !== null ? match.awayScore : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Penalty shootouts note if applicable */}
                  {match.homePenaltyScore !== null && match.awayPenaltyScore !== null && (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        color: '#64748b',
                        background: '#f8fafc',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      Penalty: <strong>{match.homePenaltyScore}</strong> - <strong>{match.awayPenaltyScore}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
