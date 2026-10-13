import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, Globe, RotateCcw, Swords, LayoutGrid } from 'lucide-react';
import {
  competitionsApi,
  CompetitionCountry,
  CompetitionTeam,
} from '../../services/competitions.service';
import { Competition, GroupStandings, KnockoutBracketResponse, KnockoutRound, PlayerStat, StandingItem } from '../../types';

import { useTranslation } from '../../i18n';
import { KnockoutBracketSection } from './KnockoutBracketSection';
import { TeamsListView } from './TeamsListView';
import { LeagueStatsView } from './LeagueStatsView';
import { CountrySelectModal } from './CountrySelectModal';

export const GroupKnockoutView: React.FC = () => {
  const currentClub = JSON.parse(localStorage.getItem('fc_club') || '{}');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const userClubCountryId = currentClub?.country_id?.toString() || '1';
  const queryCountryId = searchParams.get('countryId');
  const viewingCountryId = queryCountryId || userClubCountryId;

  // Comp ID: 8 (C1), 9 (C2), 10 (C3), 11 (World Cup), 12 (Euro)
  const compId = searchParams.get('id') || '8';

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
        const found = compList.find((c) => c.id === compId) || null;
        setCurrentComp(found);

        // 2. Standings & Groups
        const res = await competitionsApi.getStandings(compId, viewingCountryId);
        if (res && 'groups' in res && res.groups) {
          setGroups(res.groups);
          if (res.groups.length > 0 && !selectedGroupId) {
            setSelectedGroupId(res.groups[0].id);
          }
        } else {
          setGroups([]);
        }

        // 3. Knockout bracket
        const bracket = await competitionsApi.getKnockoutBracket(compId, viewingCountryId);
        setKnockoutBracket(bracket);
        if (bracket?.rounds && bracket.rounds.length > 0) {
          setSelectedRoundName(bracket.rounds[bracket.rounds.length - 1].roundName);
        }

        // 4. Teams
        const teamsData = await competitionsApi.getTeams(compId, viewingCountryId);
        setTeams(Array.isArray(teamsData) ? teamsData : []);

        // 5. Stats
        const [scorers, assists] = await Promise.all([
          competitionsApi.getTopScorers(compId, viewingCountryId, 10),
          competitionsApi.getTopAssists(compId, viewingCountryId, 10),
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
  }, [compId, viewingCountryId]);

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
              <span>{currentComp?.displayName || currentComp?.name || 'Cúp Châu Lục CLB'}</span>
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
              <span>{t('standings.format_group_knockout', 'Vòng Bảng & Loại Trực Tiếp (Knockout)')}</span>
            </span>
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
              {t('standings.group_stage', 'Vòng Bảng')} ({groups.length || 8})
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
          {/* Group Grid: Hiển thị các bảng A..H */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
            {groups.map((grp) => (
              <div key={grp.id} className="card" style={{ padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                    {grp.name}
                  </h4>
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
                    {grp.standings.map((st, idx) => (
                      <tr
                        key={st.id}
                        style={{
                          borderBottom: '1px solid #f8fafc',
                          backgroundColor: idx < 2 ? 'rgba(22, 163, 74, 0.06)' : 'transparent',
                          fontWeight: st.club?.id === currentClubId ? 800 : 500,
                        }}
                      >
                        <td style={{ padding: '6px 4px', color: idx < 2 ? '#16a34a' : '#64748b', fontWeight: 700 }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {st.club?.logo_url ? (
                            <img src={st.club.logo_url} alt="" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                          ) : (
                            <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
                          )}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                            {st.club?.short_name || st.club?.name}
                          </span>
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: '#64748b' }}>{st.played}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: st.goal_difference > 0 ? '#16a34a' : st.goal_difference < 0 ? '#dc2626' : '#64748b' }}>
                          {st.goal_difference > 0 ? `+${st.goal_difference}` : st.goal_difference}
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                          {st.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
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
    </div>
  );
};

export default GroupKnockoutView;
