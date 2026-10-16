import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Globe, RotateCcw, Swords, LayoutGrid, Flag } from 'lucide-react';
import {
  competitionsApi,
  CompetitionCountry,
  CompetitionTeam,
} from '../../services/competitions.service';
import { Competition, GroupStandings, KnockoutBracketResponse, KnockoutRound, PlayerStat, StandingItem } from '../../types';

import { useTranslation } from '../../i18n';
import { useTournamentLocale } from '../../utils/tournamentLocalization';
import { KnockoutBracketSection } from './KnockoutBracketSection';
import { TeamsListView } from './TeamsListView';
import { LeagueStatsView } from './LeagueStatsView';
import { CountrySelectModal } from './CountrySelectModal';

export const GroupKnockoutView: React.FC = () => {
  const currentClub = JSON.parse(localStorage.getItem('fc_club') || '{}');
  const { t } = useTranslation();
  const { comp, group } = useTournamentLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isYouth = location.pathname.includes('/youth') || searchParams.get('type') === 'youth';
  const userClubCountryId = currentClub?.country_id?.toString() || '1';
  const queryCountryId = searchParams.get('countryId');
  const viewingCountryId = queryCountryId || userClubCountryId;

  // Comp ID: 8 (C1), 9 (C2), 10 (C3), 11 (World Cup), 12 (Euro), 13 (U21 Cup)
  const queryCompId = searchParams.get('id');
  const compId = queryCompId || (isYouth ? '13' : '8');

  const [activeTab, setActiveTab] = useState<'groups' | 'bracket' | 'teams' | 'stats'>('groups');
  const [loading, setLoading] = useState<boolean>(true);
  const [countries, setCountries] = useState<CompetitionCountry[]>([]);
  const [currentComp, setCurrentComp] = useState<Competition | null>(null);

  // Group stage
  const [groups, setGroups] = useState<GroupStandings[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Knockout stage
  const [knockoutBracket, setKnockoutBracket] = useState<KnockoutBracketResponse | null>(null);
  const [selectedRoundName, setSelectedRoundName] = useState<string>('');

  // Teams & Stats
  const [teams, setTeams] = useState<CompetitionTeam[]>([]);
  const [topScorers, setTopScorers] = useState<PlayerStat[]>([]);
  const [topAssists, setTopAssists] = useState<PlayerStat[]>([]);
  const [showCountryModal, setShowCountryModal] = useState<boolean>(false);

  // Load countries
  useEffect(() => {
    competitionsApi.getCountries()
      .then((res) => setCountries(Array.isArray(res) ? res : []))
      .catch((err) => console.error('Failed to load countries:', err));
  }, []);

  // Load Group + Knockout Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Comp detail
        const comps = await competitionsApi.getAll(viewingCountryId);
        const compList: Competition[] = Array.isArray(comps) ? comps : (comps as any)?.items || [];
        
        let effectiveCompId = queryCompId;
        if (isYouth) {
          if (!effectiveCompId || effectiveCompId === '8') {
            const youthComp = compList.find(
              (c) => c.type === 'YOUTH_CUP' || c.code === 'DOMESTIC_YOUTH_CUP_U21' || c.name?.toLowerCase().includes('u21')
            );
            effectiveCompId = youthComp ? youthComp.id.toString() : '13';
          }
        } else if (!effectiveCompId) {
          effectiveCompId = '8';
        }

        const found = compList.find((c) => c.id.toString() === effectiveCompId.toString()) || null;
        setCurrentComp(found);

        // 2. Standings & Groups
        const res = await competitionsApi.getStandings(effectiveCompId, viewingCountryId);
        if (res && 'groups' in res && res.groups) {
          setGroups(res.groups);
          if (res.groups.length > 0 && !selectedGroupId) {
            setSelectedGroupId(res.groups[0].id);
          }
        } else {
          setGroups([]);
        }

        // 3. Knockout bracket
        const bracket = await competitionsApi.getKnockoutBracket(effectiveCompId, viewingCountryId);
        setKnockoutBracket(bracket);
        if (bracket?.rounds && bracket.rounds.length > 0) {
          setSelectedRoundName(bracket.rounds[bracket.rounds.length - 1].roundName);
        }

        // 4. Teams
        const teamsData = await competitionsApi.getTeams(effectiveCompId, viewingCountryId);
        setTeams(Array.isArray(teamsData) ? teamsData : []);

        // 5. Stats
        const [scorers, assists] = await Promise.all([
          competitionsApi.getTopScorers(effectiveCompId, viewingCountryId, 10),
          competitionsApi.getTopAssists(effectiveCompId, viewingCountryId, 10),
        ]);
        setTopScorers(Array.isArray(scorers) ? scorers : []);
        setTopAssists(Array.isArray(assists) ? assists : []);

      } catch (err) {
        console.error('Failed to load group + knockout data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [compId, viewingCountryId, isYouth, queryCompId]);

  const allKnockoutRounds = useMemo(() => {
    return knockoutBracket?.rounds || [];
  }, [knockoutBracket]);

  const filteredKnockoutRounds = useMemo(() => {
    if (!selectedRoundName) return allKnockoutRounds;
    return allKnockoutRounds.filter((r) => r.roundName === selectedRoundName);
  }, [allKnockoutRounds, selectedRoundName]);

  const viewingCountry = countries.find((c) => c.id === viewingCountryId);
  const viewingCountryName = viewingCountry?.name || currentComp?.country?.name || 'Vietnam';
  const currentClubId = currentClub?.id?.toString() || '';

  return (
    <div className="standings-page" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              <Trophy size={24} color="#15803d" />
              <span>{comp(currentComp?.displayName || currentComp?.name || (isYouth ? `${viewingCountryName} U21 Cup` : 'Continental Champions League'))}</span>
            </h2>

            {/* Badge Format */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0',
              }}
            >
              <LayoutGrid size={14} />
              <span>{isYouth ? t('standings.format_youth_group_ko', 'Cúp Trẻ U21 (Vòng Bảng & Knockout 16 Đội)') : t('standings.format_group_knockout', 'Vòng Bảng & Loại Trực Tiếp (Knockout)')}</span>
            </span>

            {/* Country Selector Button for Youth Cup */}
            {isYouth && (
              <button
                type="button"
                onClick={() => setShowCountryModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  color: '#15803d',
                  border: '1.5px solid #bbf7d0',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Flag size={14} />
                <span>{viewingCountryName} (96 Quốc Gia)</span>
              </button>
            )}
          </div>

          {/* 4 Tabs */}
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
                backgroundColor: activeTab === 'groups' ? '#15803d' : 'transparent',
                color: activeTab === 'groups' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab('groups')}
            >
              {isYouth ? t('standings.group_stage_youth', 'Vòng Bảng U21') : t('standings.group_stage', 'Vòng Bảng')} ({groups.length || 8})
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
                backgroundColor: activeTab === 'bracket' ? '#15803d' : 'transparent',
                color: activeTab === 'bracket' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab('bracket')}
            >
              {t('standings.bracket', 'Vòng Knockout')}
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
              {t('standings.tab_teams', 'Đội Tham Gia')} ({teams.length})
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
              {t('standings.player_stats_tab', 'Thống Kê')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#64748b', fontWeight: 600 }}>{t('standings.loading_comp', 'Đang tải dữ liệu giải đấu...')}</p>
        </div>
      ) : activeTab === 'groups' ? (
        <div>
          {/* Banner Thể thức đi tiếp */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '0.88rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📌</span>
            <span>
              {isYouth
                ? t('standings.youth_progression_banner', 'Thể thức Cúp Trẻ U21: 32 CLB tranh tài qua 8 bảng (A - H). Đội Nhất & Nhì mỗi bảng (16 đội) sẽ giành vé vào vòng Knockout 1/8 (Round of 16).')
                : t('standings.group_progression_banner', 'Thể thức Vòng Bảng: Top 2 đội dẫn đầu mỗi bảng giành vé bước tiếp vào vòng đấu loại trực tiếp Knockout.')}
            </span>
          </div>

          {/* Group Grid: Hiển thị các bảng A..H */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
            {groups.map((grp) => {
              const hasMyClub = grp.standings?.some((st: any) => {
                const cId = st.club?.id || st.club_id;
                return cId && cId.toString() === currentClubId;
              });

              return (
                <div
                  key={grp.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    borderRadius: '14px',
                    border: hasMyClub ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    boxShadow: hasMyClub ? '0 6px 20px rgba(22, 163, 74, 0.16)' : '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: hasMyClub ? '#15803d' : '#1e293b' }}>
                        {group(grp.name)}
                      </h4>
                      {hasMyClub && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: '#16a34a',
                            color: '#fef08a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          }}
                        >
                          <span>⭐</span> BẢNG CỦA BẠN
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>4 Đội</span>
                  </div>

                  <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                        <th style={{ padding: '4px' }}>#</th>
                        <th style={{ padding: '4px' }}>CLB</th>
                        <th style={{ padding: '4px', textAlign: 'center' }}>Tr</th>
                        <th style={{ padding: '4px', textAlign: 'center' }}>+/-</th>
                        <th style={{ padding: '4px', textAlign: 'center', fontWeight: 800 }}>Đ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grp.standings.map((st, idx) => {
                        const isMyTeam = st.club?.id === currentClubId;
                        return (
                          <tr
                            key={st.id}
                            style={{
                              borderBottom: '1px solid #f8fafc',
                              backgroundColor: isMyTeam
                                ? 'rgba(34, 197, 94, 0.14)'
                                : idx < 2
                                ? 'rgba(22, 163, 74, 0.06)'
                                : 'transparent',
                              borderLeft: isMyTeam ? '4px solid #16a34a' : '4px solid transparent',
                              fontWeight: isMyTeam ? 800 : 500,
                            }}
                          >
                            <td style={{ padding: '6px 4px', color: isMyTeam ? '#15803d' : idx < 2 ? '#16a34a' : '#64748b', fontWeight: 700 }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {st.club?.logo_url ? (
                                <img src={st.club.logo_url} alt="" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                              ) : (
                                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
                              )}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', color: isMyTeam ? '#15803d' : '#0f172a' }}>
                                {st.club?.short_name || st.club?.name}
                              </span>
                              {isMyTeam && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    backgroundColor: '#15803d',
                                    color: '#ffffff',
                                  }}
                                >
                                  BẠN
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#64748b' }}>{st.played}</td>
                            <td style={{ padding: '6px 4px', textAlign: 'center', color: st.goal_difference > 0 ? '#16a34a' : st.goal_difference < 0 ? '#dc2626' : '#64748b' }}>
                              {st.goal_difference > 0 ? `+${st.goal_difference}` : st.goal_difference}
                            </td>
                            <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 800, color: isMyTeam ? '#15803d' : '#0f172a' }}>
                              {st.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Footer Chú thích Bảng */}
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                    <span>🟢 Top 1 - 2: Vào Vòng 1/8</span>
                    <span style={{ color: hasMyClub ? '#15803d' : '#94a3b8', fontWeight: hasMyClub ? 800 : 500 }}>
                      {hasMyClub ? '⭐ Bảng của bạn' : 'Đá vòng tròn 1 lượt'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'bracket' ? (
        <KnockoutBracketSection
          knockoutBracket={knockoutBracket}
          selectedRoundName={selectedRoundName}
          setSelectedRoundName={setSelectedRoundName}
          allKnockoutRounds={allKnockoutRounds}
          filteredKnockoutRounds={filteredKnockoutRounds}
          currentClubId={currentClubId}
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

      {/* Country Selection Modal */}
      {showCountryModal && (
        <CountrySelectModal
          isOpen={showCountryModal}
          onClose={() => setShowCountryModal(false)}
          allCountries={countries}
          viewingCountryId={viewingCountryId}
          loading={false}
          onSelectCountry={(c) => {
            setSearchParams({ countryId: c.id });
            setShowCountryModal(false);
          }}
        />
      )}
    </div>
  );
};

export default GroupKnockoutView;
