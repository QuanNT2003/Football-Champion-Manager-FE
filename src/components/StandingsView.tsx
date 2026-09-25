import React, { useState, useEffect, useMemo } from 'react';
import {
  competitionsApi,
  CompetitionTeam,
  CompetitionCountry,
} from '../services/competitions.service';
import {
  Competition,
  StandingItem,
  PlayerStat,
  Club,
  GroupStandings,
  KnockoutBracketResponse,
} from '../types';
import {
  Trophy,
  Globe2,
  Flag,
  Layers,
  Swords,
  RotateCcw,
} from 'lucide-react';

// Sub-components
import { CountrySelectModal } from './standings/CountrySelectModal';
import { KnockoutBracketSection } from './standings/KnockoutBracketSection';
import { TierNavigator } from './standings/TierNavigator';
import { LeagueStandingsTable } from './standings/LeagueStandingsTable';
import { TeamsListView } from './standings/TeamsListView';
import { LeagueStatsView } from './standings/LeagueStatsView';

interface StandingsViewProps {
  club: Club | null;
  currentClubId: string;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ club, currentClubId }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [groups, setGroups] = useState<GroupStandings[]>([]);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);

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
  const userClubCountryId = club?.country_id || club?.country_detail?.id || '114';
  const userClubCountryName =
    club?.country_detail?.name ||
    (typeof club?.country === 'string' ? club?.country : (club?.country as any)?.name) ||
    'Việt Nam';
  const userClubConfedCode =
    club?.confederation?.code ||
    club?.country_detail?.confederation?.code ||
    'AFC';
  const clubCompId = club?.current_competition_id ? club.current_competition_id.toString() : '3';

  // State for country being viewed (allows browsing other 96 elite nations)
  const [viewingCountryId, setViewingCountryId] = useState<string>(userClubCountryId);
  const [viewingCountryName, setViewingCountryName] = useState<string>(userClubCountryName);
  const [viewingConfedCode, setViewingConfedCode] = useState<string>(userClubConfedCode);

  // Country Picker Modal State
  const [showCountryModal, setShowCountryModal] = useState<boolean>(false);
  const [allCountries, setAllCountries] = useState<CompetitionCountry[]>([]);
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>('');
  const [selectedConfedFilter, setSelectedConfedFilter] = useState<string>('ALL');
  const [loadingCountries, setLoadingCountries] = useState<boolean>(false);

  useEffect(() => {
    loadCompetitions(viewingCountryId);
  }, [viewingCountryId]);

  useEffect(() => {
    if (selectedCompId) {
      loadCompData(selectedCompId, viewingCountryId);
    }
  }, [selectedCompId, viewingCountryId]);

  const loadCompetitions = async (targetCountryId: string) => {
    try {
      setLoading(true);
      const data = await competitionsApi.getAll(targetCountryId);
      const list: Competition[] = Array.isArray(data) ? data : (data as any)?.items || [];
      setCompetitions(list);

      // If viewing user's home country, default to club's active competition
      if (targetCountryId === userClubCountryId && list.length > 0) {
        const foundClubComp = list.find((c) => c.id.toString() === clubCompId);
        if (foundClubComp) {
          setSelectedCompId(foundClubComp.id.toString());
          return;
        }
      }

      // Otherwise, default to Tier 1 League of that nation or the first competition
      const tier1Comp = list.find((c) => c.scope === 'DOMESTIC' && c.tier === 1);
      if (tier1Comp) {
        setSelectedCompId(tier1Comp.id.toString());
      } else if (list.length > 0) {
        setSelectedCompId(list[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompData = async (compId: string, targetCountryId: string) => {
    try {
      setLoading(true);
      setSelectedRoundName('all');

      // Fetch standings, teams, stats and knockout bracket in parallel
      const [tableData, bracketData, teamsData, scorersData, assistsData] = await Promise.all([
        competitionsApi.getStandings(compId, targetCountryId).catch(() => null),
        competitionsApi.getKnockoutBracket(compId, targetCountryId).catch(() => null),
        competitionsApi.getTeams(compId, targetCountryId).catch(() => []),
        competitionsApi.getTopScorers(compId, targetCountryId).catch(() => []),
        competitionsApi.getTopAssists(compId, targetCountryId).catch(() => []),
      ]);

      const foundComp = competitions.find((c) => c.id.toString() === compId.toString());

      // Parse standings and groups
      if (tableData && typeof tableData === 'object' && !Array.isArray(tableData)) {
        setStandings(tableData.standings || []);
        const fetchedGroups = tableData.groups || [];
        setGroups(fetchedGroups);
        const format = tableData.formatType || foundComp?.formatType || 'LEAGUE';
        setCompFormatType(format);
        setCompFormatLabel(tableData.formatLabel || foundComp?.formatLabel || 'Vòng tròn tính điểm');

        // Tự động tìm và chọn thẳng bảng đấu mà CLB của ta đang thuộc về (ví dụ Tier 4 Bảng C)
        let myGroupIdx = 0;
        if (fetchedGroups.length > 0 && currentClubId) {
          const foundIdx = fetchedGroups.findIndex((g: any) =>
            g.standings?.some((s: any) => {
              const cId = s.club?.id || s.club_id;
              return cId && cId.toString() === currentClubId.toString();
            })
          );
          if (foundIdx !== -1) {
            myGroupIdx = foundIdx;
          }
        }
        setSelectedGroupIdx(myGroupIdx);

        if (format === 'GROUP_KNOCKOUT') {
          setSubTab(fetchedGroups && fetchedGroups.length > 0 ? 'groups' : 'knockout');
        }
      } else {
        const rawStandings = Array.isArray(tableData) ? tableData : [];
        setStandings(rawStandings);
        setGroups([]);
        setSelectedGroupIdx(0);
        const format = foundComp?.formatType || 'LEAGUE';
        setCompFormatType(format);
        setCompFormatLabel(foundComp?.formatLabel || 'Vòng tròn tính điểm');
      }

      setKnockoutBracket(bracketData || null);

      // Tự động chọn vòng đấu tối ưu: ưu tiên vòng có trận của CLB mình, hoặc vòng đang diễn ra
      const roundsList = bracketData?.rounds || [];
      if (roundsList.length > 0) {
        let defaultRound = '';
        if (currentClubId) {
          const myRound = roundsList.find((r: any) =>
            r.matches?.some((m: any) =>
              (m.homeClub?.id && m.homeClub.id.toString() === currentClubId.toString()) ||
              (m.awayClub?.id && m.awayClub.id.toString() === currentClubId.toString())
            )
          );
          if (myRound) defaultRound = myRound.roundName;
        }
        if (!defaultRound) {
          const activeRound = roundsList.find((r: any) =>
            r.matches?.some((m: any) => m.homeClub?.id && m.homeClub.id !== '0')
          );
          if (activeRound) defaultRound = activeRound.roundName;
        }
        setSelectedRoundName(defaultRound || roundsList[0]?.roundName || '');
      }
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
  const currentTier = currentComp?.scope === 'DOMESTIC' && currentComp?.tier && currentComp.tier >= 1 && currentComp.tier <= 4
    ? currentComp.tier
    : null;

  // Group competitions by category for optgroup
  const domesticComps = competitions.filter((c) => c.scope === 'DOMESTIC');
  const continentalComps = competitions.filter((c) => c.scope === 'CONTINENTAL' || c.scope === 'REGIONAL');
  const internationalComps = competitions.filter((c) => c.scope === 'INTERNATIONAL');

  // Handle switching tier (Tier 1..4)
  const handleSwitchTier = (targetTier: number) => {
    const targetComp = domesticComps.find((c) => c.tier === targetTier);
    if (targetComp) {
      setSelectedCompId(targetComp.id.toString());
    }
  };

  // Open country modal and fetch countries
  const handleOpenCountryModal = async () => {
    setShowCountryModal(true);
    if (allCountries.length === 0) {
      setLoadingCountries(true);
      try {
        const list = await competitionsApi.getCountries();
        setAllCountries(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load countries:', err);
      } finally {
        setLoadingCountries(false);
      }
    }
  };

  const handleSelectCountry = (c: CompetitionCountry) => {
    setViewingCountryId(c.id);
    setViewingCountryName(c.name);
    setViewingConfedCode(c.confederation?.code || 'AFC');
    setShowCountryModal(false);
  };

  const handleResetToMyClubCountry = () => {
    setViewingCountryId(userClubCountryId);
    setViewingCountryName(userClubCountryName);
    setViewingConfedCode(userClubConfedCode);
  };

  // Filter knockout matches by selected round: chỉ hiển thị đúng 1 vòng được chọn để tránh dài màn hình
  const allKnockoutRounds = knockoutBracket?.rounds || [];
  const filteredKnockoutRounds = useMemo(() => {
    if (!allKnockoutRounds || allKnockoutRounds.length === 0) return [];
    const found = allKnockoutRounds.find((r) => r.roundName === selectedRoundName);
    return found ? [found] : [allKnockoutRounds[0]];
  }, [allKnockoutRounds, selectedRoundName]);

  // Active group data (single group display)
  const activeGroup = groups.length > 0 ? groups[selectedGroupIdx] || groups[0] : null;
  const currentTableRows = activeGroup ? activeGroup.standings : standings;

  return (
    <div className="view-container">
      {/* Club & Country Context Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)',
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
              Câu Lạc Bộ Của Bạn: <strong>{club?.name || 'Can Tho Gold Tigers'}</strong>
            </div>
            <div style={{ fontSize: '1.12rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Đang Theo Dõi:</span>
              <span style={{ color: '#fef08a' }}>{viewingCountryName}</span>
              {viewingCountryId !== userClubCountryId && (
                <span style={{ fontSize: '0.72rem', background: '#f59e0b', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Quốc Gia Khác
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '10px' }}>
            <Globe2 size={16} />
            <span>Liên Đoàn: <strong>{viewingConfedCode}</strong></span>
          </div>

          {/* Button to Open Country Selector */}
          <button
            type="button"
            onClick={handleOpenCountryModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#15803d',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            <Flag size={15} />
            <span>Chọn Quốc Gia Khác (96 Nước)</span>
          </button>

          {/* Button to Return to User Club's Home Country */}
          {viewingCountryId !== userClubCountryId && (
            <button
              type="button"
              onClick={handleResetToMyClubCountry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: '#fef08a',
                color: '#854d0e',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Quay lại hệ thống giải đấu quốc gia của câu lạc bộ bạn"
            >
              <RotateCcw size={14} />
              <span>Về Giải Của Tôi ({userClubCountryName})</span>
            </button>
          )}
        </div>
      </div>

      {/* Header & Competition Dropdown Selector */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                <Trophy size={24} color="#15803d" />
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
                      : '#dcfce7',
                  color:
                    compFormatType === 'KNOCKOUT'
                      ? '#b45309'
                      : compFormatType === 'GROUP_KNOCKOUT'
                      ? '#4338ca'
                      : '#166534',
                  border: `1px solid ${
                    compFormatType === 'KNOCKOUT'
                      ? '#fde68a'
                      : compFormatType === 'GROUP_KNOCKOUT'
                      ? '#c7d2fe'
                      : '#bbf7d0'
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
                ? 'Giai đoạn 1: Vòng Bảng -> Giai đoạn 2: Vòng Đấu Loại Trực Tiếp (Knockout)'
                : `Giải đấu đường trường tính điểm ${currentTier ? `(Tier ${currentTier})` : ''}`}
            </p>
          </div>

          {/* Controls: Competition Select + Main Tab Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              style={{
                width: 'auto',
                minWidth: '260px',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderColor: '#cbd5e1',
                padding: '8px 12px',
              }}
            >
              {domesticComps.length > 0 && (
                <optgroup label={`Hệ Thống Giải Quốc Nội (${viewingCountryName})`}>
                  {domesticComps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tier ? `[Tier ${c.tier}] ` : ''}{c.displayName || c.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {continentalComps.length > 0 && (
                <optgroup label={`Cúp Châu Lục (${viewingConfedCode})`}>
                  {continentalComps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName || c.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {internationalComps.length > 0 && (
                <optgroup label="Giải Đấu Thế Giới">
                  {internationalComps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName || c.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* TAB BUTTONS */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
              <button
                type="button"
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '7px 14px',
                  backgroundColor: activeTab === 'table' ? '#15803d' : 'transparent',
                  color: activeTab === 'table' ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTab('table')}
              >
                {compFormatType === 'KNOCKOUT' ? 'Sơ Đồ Thi Đấu' : 'Bảng Xếp Hạng'}
              </button>

              <button
                type="button"
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '7px 14px',
                  backgroundColor: activeTab === 'teams' ? '#15803d' : 'transparent',
                  color: activeTab === 'teams' ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTab('teams')}
              >
                Đội Bóng ({teams.length})
              </button>

              <button
                type="button"
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '7px 14px',
                  backgroundColor: activeTab === 'stats' ? '#15803d' : 'transparent',
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

      {/* TIER STEPPER & GROUP SELECTOR */}
      <TierNavigator
        currentTier={currentTier}
        domesticComps={domesticComps}
        onSwitchTier={handleSwitchTier}
        groups={groups}
        selectedGroupIdx={selectedGroupIdx}
        onSelectGroupIdx={setSelectedGroupIdx}
        currentClubId={currentClubId}
        activeTab={activeTab}
      />

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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1.25rem',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSubTab('groups')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: subTab === 'groups' ? '#15803d' : '#f1f5f9',
                    color: subTab === 'groups' ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Layers size={16} />
                  <span>Vòng Bảng ({groups.length} Bảng)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubTab('knockout')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: subTab === 'knockout' ? '#15803d' : '#f1f5f9',
                    color: subTab === 'knockout' ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Swords size={16} />
                  <span>Vòng Loại Trực Tiếp (Knockout)</span>
                </button>
              </div>

              {subTab === 'groups' ? (
                <LeagueStandingsTable
                  currentTableRows={currentTableRows}
                  currentClubId={currentClubId}
                  currentTier={currentTier}
                  compFormatType={compFormatType}
                  groupName={activeGroup ? activeGroup.name || `Bảng ${String.fromCharCode(65 + selectedGroupIdx)}` : undefined}
                />
              ) : (
                <KnockoutBracketSection
                  knockoutBracket={knockoutBracket}
                  selectedRoundName={selectedRoundName}
                  setSelectedRoundName={setSelectedRoundName}
                  allKnockoutRounds={allKnockoutRounds}
                  filteredKnockoutRounds={filteredKnockoutRounds}
                  currentClubId={currentClubId}
                />
              )}
            </div>
          )}

          {/* B. THỂ THỨC KNOCKOUT THUẦN TÚY (Cúp Quốc Gia) */}
          {compFormatType === 'KNOCKOUT' && (
            <KnockoutBracketSection
              knockoutBracket={knockoutBracket}
              selectedRoundName={selectedRoundName}
              setSelectedRoundName={setSelectedRoundName}
              allKnockoutRounds={allKnockoutRounds}
              filteredKnockoutRounds={filteredKnockoutRounds}
              currentClubId={currentClubId}
            />
          )}

          {/* C. THỂ THỨC LEAGUE ĐƯỜNG TRƯỜNG */}
          {compFormatType === 'LEAGUE' && (
            <LeagueStandingsTable
              currentTableRows={currentTableRows}
              currentClubId={currentClubId}
              currentTier={currentTier}
              compFormatType={compFormatType}
              groupName={activeGroup ? activeGroup.name || `Bảng ${String.fromCharCode(65 + selectedGroupIdx)}` : undefined}
            />
          )}
        </div>
      ) : activeTab === 'teams' ? (
        /* TAB 2: DANH SÁCH ĐỘI BÓNG */
        <TeamsListView teams={teams} currentClubId={currentClubId} />
      ) : (
        /* TAB 3: THỐNG KÊ CÁ NHÂN */
        <LeagueStatsView topScorers={topScorers} topAssists={topAssists} />
      )}

      {/* COUNTRY SELECTOR MODAL */}
      <CountrySelectModal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelectCountry={handleSelectCountry}
        viewingCountryId={viewingCountryId}
        allCountries={allCountries}
        loading={loadingCountries}
      />
    </div>
  );
};
