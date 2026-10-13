import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Globe,
  RotateCcw,
  Swords,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  competitionsApi,
  CompetitionCountry,
  CompetitionTeam,
} from '../../services/competitions.service';
import { Competition, StandingItem, GroupStandings, PlayerStat } from '../../types';

import { useTranslation } from '../../i18n';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import { TeamsListView } from './TeamsListView';
import { LeagueStatsView } from './LeagueStatsView';
import { CountrySelectModal } from './CountrySelectModal';

export const LeagueView: React.FC = () => {
  const currentClub = JSON.parse(localStorage.getItem('fc_club') || '{}');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Country logic
  const userClubCountryId = currentClub?.country_id?.toString() || '1';
  const queryCountryId = searchParams.get('countryId');
  const viewingCountryId = queryCountryId || userClubCountryId;

  // Tier logic (Tier 1..4)
  const queryTier = searchParams.get('tier');
  const [currentTier, setCurrentTier] = useState<number>(queryTier ? Number(queryTier) : 1);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'table' | 'teams' | 'stats'>('table');

  // Selected Group (for multi-group tiers like Tier 2, 3, 4)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [countries, setCountries] = useState<CompetitionCountry[]>([]);
  const [domesticComps, setDomesticComps] = useState<Competition[]>([]);
  const [currentComp, setCurrentComp] = useState<Competition | null>(null);
  const [groups, setGroups] = useState<GroupStandings[]>([]);
  const [currentTableRows, setCurrentTableRows] = useState<StandingItem[]>([]);
  const [teams, setTeams] = useState<CompetitionTeam[]>([]);
  const [topScorers, setTopScorers] = useState<PlayerStat[]>([]);
  const [topAssists, setTopAssists] = useState<PlayerStat[]>([]);

  // Country Modal
  const [showCountryModal, setShowCountryModal] = useState<boolean>(false);

  // Load countries list
  useEffect(() => {
    competitionsApi.getCountries()
      .then((res) => setCountries(Array.isArray(res) ? res : []))
      .catch((err) => console.error('Failed to load countries:', err));
  }, []);

  // Sync tier state from searchParams
  useEffect(() => {
    if (queryTier) {
      setCurrentTier(Number(queryTier));
    }
  }, [queryTier]);

  // Load domestic competitions for viewing country
  useEffect(() => {
    const loadDomesticComps = async () => {
      try {
        setLoading(true);
        const data = await competitionsApi.getAll(viewingCountryId);
        const list: Competition[] = Array.isArray(data) ? data : (data as any)?.items || [];
        const domesticList = list.filter(
          (c: any) => c.scope === 'DOMESTIC' && (c.competition_type === 'DOMESTIC_LEAGUE' || c.tier)
        );
        setDomesticComps(domesticList);

        // Find current tier competition
        const foundComp = domesticList.find((c) => c.tier === currentTier) || domesticList[0] || null;
        setCurrentComp(foundComp);
      } catch (err) {
        console.error('Failed to load domestic competitions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDomesticComps();
  }, [viewingCountryId, currentTier]);

  // Load standings, teams, stats for current competition and selected group
  useEffect(() => {
    if (!currentComp) return;

    const loadLeagueData = async () => {
      try {
        setLoading(true);

        // 1. Standings
        const res = await competitionsApi.getStandings(
          currentComp.id,
          viewingCountryId,
          undefined,
          selectedGroupId || undefined
        );

        if (res && 'standings' in res) {
          const fetchedGroups = res.groups || [];
          setGroups(fetchedGroups);

          // If there are groups and no group selected, select first group
          let effectiveGroup = selectedGroupId;
          if (fetchedGroups.length > 0 && (!selectedGroupId || !fetchedGroups.some(g => g.id === selectedGroupId))) {
            effectiveGroup = fetchedGroups[0].id;
            setSelectedGroupId(effectiveGroup);
          }

          if (fetchedGroups.length > 0 && effectiveGroup) {
            const grp = fetchedGroups.find((g) => g.id === effectiveGroup);
            setCurrentTableRows(grp ? grp.standings : res.standings);
          } else {
            setCurrentTableRows(res.standings);
          }
        } else if (Array.isArray(res)) {
          setGroups([]);
          setCurrentTableRows(res);
        }

        // 2. Teams (Lọc đúng 16 đội của riêng bảng đó nếu có selectedGroupId)
        const teamsData = await competitionsApi.getTeams(
          currentComp.id,
          viewingCountryId,
          selectedGroupId || undefined
        );
        setTeams(Array.isArray(teamsData) ? teamsData : []);

        // 3. Top Scorers & Top Assists (Lọc riêng của bảng đó)
        const [scorers, assists] = await Promise.all([
          competitionsApi.getTopScorers(currentComp.id, viewingCountryId, 10, selectedGroupId || undefined),
          competitionsApi.getTopAssists(currentComp.id, viewingCountryId, 10, selectedGroupId || undefined),
        ]);
        setTopScorers(Array.isArray(scorers) ? scorers : []);
        setTopAssists(Array.isArray(assists) ? assists : []);

      } catch (err) {
        console.error('Failed to load league standings/teams/stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeagueData();
  }, [currentComp?.id, viewingCountryId, selectedGroupId]);

  // Switch Tier
  const handleSwitchTier = (tierNum: number) => {
    setCurrentTier(tierNum);
    setSelectedGroupId(''); // Reset group khi đổi tier
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tier', tierNum.toString());
      return next;
    });
  };

  // Switch Group
  const handleSwitchGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  // Current country info
  const viewingCountry = countries.find((c) => c.id === viewingCountryId);
  const viewingCountryName = viewingCountry?.name || currentComp?.country?.name || 'Vietnam';
  const currentClubId = currentClub?.id?.toString() || '';

  return (
    <div className="standings-page" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Country banner bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={18} color="#15803d" />
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>
            {t('standings.viewing_country', 'Quốc gia:')}{' '}
            <strong style={{ color: '#0f172a' }}>{viewingCountryName}</strong>
          </span>
          {viewingCountryId !== userClubCountryId && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: '#dcfce7', color: '#166534',
                fontWeight: 600,
              }}
            >
              {t('standings.other_countries', 'Quốc Gia Khác')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewingCountryId !== userClubCountryId && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete('countryId');
                  return next;
                });
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '5px 10px' }}
            >
              <RotateCcw size={14} />
              <span>{t('standings.back_my_league', 'Về Nước Tôi')}</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCountryModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              padding: '5px 12px',
              backgroundColor: '#16a34a',
              borderColor: '#16a34a',
            }}
          >
            <Globe size={14} />
            <span>{t('standings.select_country', 'Đổi Quốc Gia')} ({countries.length || 96})</span>
          </button>
        </div>
      </div>

      {/* HEADER CARD: Khoanh đỏ 1 (Tên giải + format) & Khoanh đỏ 2 (3 Tabs) */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* KHOANH ĐỎ 1: Tên Giải Đấu + Badge Thể Thức */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              <Trophy size={24} color="#15803d" />
              <span>{currentComp?.displayName || currentComp?.name || `${viewingCountryName} League ${currentTier}`}</span>
            </h2>

            {/* Badge Thể Thức */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: '#dcfce7',
                color: '#166534',
                border: '1px solid #bbf7d0',
              }}
            >
              <Trophy size={14} />
              <span>{t('standings.format_league', 'Vòng tròn tính điểm (League)')}</span>
            </span>
          </div>

          {/* KHOANH ĐỎ 2: BỘ 3 TABS (League Table, Teams Directory, Player Statistics) */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              type="button"
              style={{
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'table' ? '#15803d' : 'transparent',
                color: activeTab === 'table' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab('table')}
            >
              {t('standings.tab_table', 'League Table')}
            </button>

            <button
              type="button"
              style={{
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'teams' ? '#15803d' : 'transparent',
                color: activeTab === 'teams' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab('teams')}
            >
              {t('standings.tab_teams', 'Teams Directory')} ({teams.length || 16})
            </button>

            <button
              type="button"
              style={{
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'stats' ? '#15803d' : 'transparent',
                color: activeTab === 'stats' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab('stats')}
            >
              {t('standings.player_stats_tab', 'Player Statistics')}
            </button>
          </div>
        </div>

        {/* KHOANH ĐỎ 3: TIER NAVIGATION (Promote / Relegate & 4 nút Tier) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', letterSpacing: '0.5px' }}>
              TIER NAVIGATION:
            </span>

            {/* Nút Thăng Hạng (Promote) */}
            <button
              type="button"
              disabled={currentTier <= 1}
              onClick={() => handleSwitchTier(currentTier - 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: currentTier <= 1 ? '#f8fafc' : '#ffffff',
                color: currentTier <= 1 ? '#94a3b8' : '#0f172a',
                cursor: currentTier <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronUp size={14} />
              <span>Promote</span>
            </button>

            {/* Nút Xuống Hạng (Relegate) */}
            <button
              type="button"
              disabled={currentTier >= 4}
              onClick={() => handleSwitchTier(currentTier + 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: currentTier >= 4 ? '#f8fafc' : '#ffffff',
                color: currentTier >= 4 ? '#94a3b8' : '#0f172a',
                cursor: currentTier >= 4 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronDown size={14} />
              <span>Relegate (Tier {currentTier + 1})</span>
            </button>
          </div>

          {/* 4 Nút Tiers lấy thẳng tên giải từ Database */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map((tNum) => {
              const compInTier = domesticComps.find((c) => c.tier === tNum);
              const isAct = currentTier === tNum;
              const label = compInTier?.displayName || compInTier?.name || `${viewingCountryName} League ${tNum}`;

              return (
                <button
                  key={tNum}
                  type="button"
                  onClick={() => handleSwitchTier(tNum)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isAct ? '#15803d' : '#f1f5f9',
                    color: isAct ? '#ffffff' : '#334155',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* KHOANH ĐỎ 4: THANH CHỌN BẢNG (Group: Main Table hoặc Bảng A, B, C...) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed #e2e8f0',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
            Group:
          </span>

          {groups.length === 0 ? (
            <button
              type="button"
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: '#15803d',
                color: '#ffffff',
              }}
            >
              Main Table ★
            </button>
          ) : (
            groups.map((grp) => {
              const isSelected = selectedGroupId === grp.id;
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => handleSwitchGroup(grp.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: isSelected ? '1px solid #15803d' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#15803d' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {grp.name} {isSelected ? '★' : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* NỘI DUNG CHÍNH THEO TỪNG TAB */}
      {loading ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#64748b', fontWeight: 600 }}>{t('standings.loading_comp', 'Đang tải dữ liệu giải đấu...')}</p>
        </div>
      ) : activeTab === 'table' ? (
        <LeagueStandingsTable
          currentTableRows={currentTableRows}
          
          currentTier={currentTier}
        />
      ) : activeTab === 'teams' ? (
        <TeamsListView
          teams={teams}
          currentClubId={currentClubId}
        />
      ) : (
        <LeagueStatsView
          topScorers={topScorers}
          topAssists={topAssists}
        />
      )}

      {/* Country Modal */}
      {showCountryModal && (
        <CountrySelectModal
          isOpen={showCountryModal}
          onClose={() => setShowCountryModal(false)}
          onSelectCountry={(c) => {
            setShowCountryModal(false);
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set('countryId', c.id);
              return next;
            });
          }}
          viewingCountryId={viewingCountryId}
          allCountries={countries}
          loading={false}
        />
      )}
    </div>
  );
};

export default LeagueView;
