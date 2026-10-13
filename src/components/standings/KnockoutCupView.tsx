import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, Globe, RotateCcw, Swords, ShieldAlert } from 'lucide-react';
import {
  competitionsApi,
  CompetitionCountry,
  CompetitionTeam,
} from '../../services/competitions.service';
import { Competition, KnockoutBracketResponse, KnockoutRound, PlayerStat } from '../../types';

import { useTranslation } from '../../i18n';
import { KnockoutBracketSection } from './KnockoutBracketSection';
import { TeamsListView } from './TeamsListView';
import { LeagueStatsView } from './LeagueStatsView';
import { CountrySelectModal } from './CountrySelectModal';

export const KnockoutCupView: React.FC = () => {
  const currentClub = JSON.parse(localStorage.getItem('fc_club') || '{}');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const userClubCountryId = currentClub?.country_id?.toString() || '1';
  const queryCountryId = searchParams.get('countryId');
  const viewingCountryId = queryCountryId || userClubCountryId;

  // Cup ID: 6 (Cup), 7 (Super Cup), 13 (Youth Cup)
  const cupId = searchParams.get('id') || '6';

  const [activeTab, setActiveTab] = useState<'bracket' | 'teams' | 'stats'>('bracket');
  const [loading, setLoading] = useState<boolean>(true);
  const [countries, setCountries] = useState<CompetitionCountry[]>([]);
  const [currentComp, setCurrentComp] = useState<Competition | null>(null);
  const [knockoutBracket, setKnockoutBracket] = useState<KnockoutBracketResponse | null>(null);
  const [selectedRoundName, setSelectedRoundName] = useState<string>('');
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

  // Load Cup Data
  useEffect(() => {
    const loadCupData = async () => {
      try {
        setLoading(true);

        // 1. Load comp detail
        const comps = await competitionsApi.getAll(viewingCountryId);
        const compList: Competition[] = Array.isArray(comps) ? comps : (comps as any)?.items || [];
        const found = compList.find((c) => c.id === cupId) || null;
        setCurrentComp(found);

        // 2. Load knockout bracket
        const bracket = await competitionsApi.getKnockoutBracket(cupId, viewingCountryId);
        setKnockoutBracket(bracket);
        if (bracket?.rounds && bracket.rounds.length > 0) {
          setSelectedRoundName(bracket.rounds[bracket.rounds.length - 1].roundName);
        }

        // 3. Load teams
        const teamsData = await competitionsApi.getTeams(cupId, viewingCountryId);
        setTeams(Array.isArray(teamsData) ? teamsData : []);

        // 4. Load stats
        const [scorers, assists] = await Promise.all([
          competitionsApi.getTopScorers(cupId, viewingCountryId, 10),
          competitionsApi.getTopAssists(cupId, viewingCountryId, 10),
        ]);
        setTopScorers(Array.isArray(scorers) ? scorers : []);
        setTopAssists(Array.isArray(assists) ? assists : []);

      } catch (err) {
        console.error('Failed to load knockout cup data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCupData();
  }, [cupId, viewingCountryId]);

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
      {/* Country Switcher Bar */}
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

      {/* HEADER CARD */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              <Trophy size={24} color="#d97706" />
              <span>{currentComp?.displayName || currentComp?.name || `${viewingCountryName} Cup`}</span>
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
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
              }}
            >
              <Swords size={14} />
              <span>{t('standings.format_knockout', 'Đấu loại trực tiếp qua các vòng đấu')}</span>
            </span>
          </div>

          {/* Bộ 3 Tabs */}
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
                backgroundColor: activeTab === 'bracket' ? '#d97706' : 'transparent',
                color: activeTab === 'bracket' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab('bracket')}
            >
              {t('standings.bracket', 'Sơ Đồ Thi Đấu')}
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
                backgroundColor: activeTab === 'teams' ? '#d97706' : 'transparent',
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
                backgroundColor: activeTab === 'stats' ? '#d97706' : 'transparent',
                color: activeTab === 'stats' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab('stats')}
            >
              {t('standings.player_stats_tab', 'Vua Phá Lưới Cúp')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#64748b', fontWeight: 600 }}>{t('standings.loading_comp', 'Đang tải dữ liệu giải cúp...')}</p>
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

export default KnockoutCupView;
