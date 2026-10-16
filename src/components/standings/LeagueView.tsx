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
  const currentClubId = currentClub?.id?.toString() || '';
  const clubCompId = currentClub?.current_competition_id?.toString();
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

        // Mặc định chọn giải đấu:
        // Nếu người dùng đang xem quốc gia của CLB mình và không có queryTier trên URL:
        // Tự động tìm giải League mà CLB của người dùng đang tham gia!
        let targetTier = currentTier;
        if (!queryTier && viewingCountryId === userClubCountryId && clubCompId) {
          const myComp = domesticList.find((c) => c.id.toString() === clubCompId.toString());
          if (myComp && myComp.tier) {
            targetTier = myComp.tier;
            setCurrentTier(myComp.tier);
          }
        }

        // Find current tier competition
        const foundComp = domesticList.find((c) => c.tier === targetTier) || domesticList[0] || null;
        setCurrentComp(foundComp);
      } catch (err) {
        console.error('Failed to load domestic competitions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDomesticComps();
  }, [viewingCountryId, currentTier, clubCompId, queryTier, userClubCountryId]);

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

          // Tự động chọn Group có CLB của người dùng nếu có:
          let effectiveGroup = selectedGroupId;
          if (fetchedGroups.length > 0) {
            const myGroup = fetchedGroups.find((g: any) =>
              g.standings?.some((s: any) => {
                const cId = s.club?.id || s.club_id;
                return cId && cId.toString() === currentClubId;
              })
            );

            // Nếu chưa có group hợp lệ được chọn, hoặc nếu vừa đổi tier:
            // ƯU TIÊN CHỌN BẢNG CỦA CLB MÌNH!
            if (!effectiveGroup || !fetchedGroups.some(g => g.id === effectiveGroup)) {
              effectiveGroup = myGroup ? myGroup.id : fetchedGroups[0].id;
              setSelectedGroupId(effectiveGroup);
            }
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
  }, [currentComp?.id, viewingCountryId, selectedGroupId, currentClubId]);

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
  const myClubTier = domesticComps.find((c) => c.id.toString() === clubCompId)?.tier;
  const isMyClubInCurrentTable = currentTableRows.some((s: any) => {
    const cId = s.club?.id || s.club_id;
    return cId && cId.toString() === currentClubId;
  });

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
              <span>{t('standings.format_league_long', 'Vòng tròn tính điểm (League)')}</span>
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
              {t('standings.tier_nav')}
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
              const hasMyClub = grp.standings?.some((s: any) => {
                const cId = s.club?.id || s.club_id;
                return cId && cId.toString() === currentClubId;
              });

              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => handleSwitchGroup(grp.id)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: isSelected
                      ? '1.5px solid #15803d'
                      : hasMyClub
                      ? '1.5px solid #eab308'
                      : '1px solid #cbd5e1',
                    backgroundColor: isSelected
                      ? '#15803d'
                      : hasMyClub
                      ? '#fefce8'
                      : '#ffffff',
                    color: isSelected
                      ? '#ffffff'
                      : hasMyClub
                      ? '#854d0e'
                      : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: hasMyClub ? '0 2px 6px rgba(234, 179, 8, 0.2)' : 'none',
                  }}
                  title={hasMyClub ? 'Bảng đấu có câu lạc bộ của bạn' : undefined}
                >
                  {hasMyClub && <span>⭐</span>}
                  <span>{grp.name}</span>
                  {hasMyClub && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#fef08a',
                        color: isSelected ? '#ffffff' : '#854d0e',
                      }}
                    >
                      Bảng của bạn
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Banner xác nhận bảng đấu của CLB người dùng */}
      {activeTab === 'table' && isMyClubInCurrentTable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            marginBottom: '1rem',
            color: '#166534',
            fontSize: '0.88rem',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>⭐</span>
            <span>
              Câu lạc bộ của bạn (<strong>{currentClub?.name}</strong>) đang tranh tài tại bảng đấu này!
            </span>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              letterSpacing: '0.5px',
            }}
          >
            CLB CỦA BẠN Ở ĐÂY
          </span>
        </div>
      )}

      {/* NỘI DUNG CHÍNH THEO TỪNG TAB */}
      {loading ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#64748b', fontWeight: 600 }}>{t('standings.loading_comp', 'Đang tải dữ liệu giải đấu...')}</p>
        </div>
      ) : activeTab === 'table' ? (
        <LeagueStandingsTable
          currentTableRows={currentTableRows}
          currentClubId={currentClubId}
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
