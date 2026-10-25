import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  ArrowLeftRight,
  Trophy,
  Building2,
  ArrowLeft,
  Loader2,
  Shield,
  Briefcase,
} from 'lucide-react';
import { clubsApi } from '../services/clubs.service';
import { authApi } from '../services/auth.service';
import {
  Club,
  ClubSquadGroupsResponse,
  ClubMatchItem,
  ClubTransfersResponse,
  ClubSeasonHistoryResponse,
  ClubStadiumResponse,
  Player,
} from '../types';
import { useTranslation } from '../i18n';
import { useTournamentLocale } from '../utils/tournamentLocalization';
import { ClubStaffView } from './ClubStaffView';
import { PlayerDetailModal } from './player';
import {
  ClubHeroBanner,
  ClubPlayersTab,
  ClubMatchesTab,
  ClubTransfersTab,
  ClubHistoryTab,
  ClubStadiumTab,
} from './club-detail';

export const ClubDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { comp, subTitle } = useTournamentLocale();

  const myClub = authApi.getCurrentClub();
  const myClubId = myClub?.id ? String(myClub.id) : undefined;

  const [club, setClub] = useState<Club | null>(null);
  const [activeTab, setActiveTab] = useState<'players' | 'staff' | 'matches' | 'transfers' | 'history' | 'stadium'>('players');
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<Player | null>(null);
  const [loadingClub, setLoadingClub] = useState(true);

  const isOwnClub = Boolean(myClubId && club && String(club.id) === String(myClubId));

  // Tab 1: Players
  const [squadGroups, setSquadGroups] = useState<ClubSquadGroupsResponse | null>(null);
  const [loadingSquad, setLoadingSquad] = useState(false);

  // Tab 2: Matches
  const [matches, setMatches] = useState<ClubMatchItem[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Tab 3: Transfers
  const [transfers, setTransfers] = useState<ClubTransfersResponse | null>(null);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  // Tab 4: Season History
  const [seasonHistory, setSeasonHistory] = useState<ClubSeasonHistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Tab 5: Stadium & Facilities
  const [stadiumInfo, setStadiumInfo] = useState<ClubStadiumResponse | null>(null);
  const [loadingStadium, setLoadingStadium] = useState(false);

  // Fetch basic club info
  useEffect(() => {
    if (!id) return;
    const fetchClub = async () => {
      try {
        setLoadingClub(true);
        const data = await clubsApi.getClubById(id);
        setClub(data);
      } catch (err) {
        console.error('Failed to load club:', err);
      } finally {
        setLoadingClub(false);
      }
    };
    fetchClub();
  }, [id]);

  // Load Squad data
  const loadSquadData = async (clubId: string) => {
    try {
      setLoadingSquad(true);
      const data = await clubsApi.getSquadGroups(clubId);
      setSquadGroups(data);
    } catch (err) {
      console.error('Failed to load squad groups:', err);
    } finally {
      setLoadingSquad(false);
    }
  };

  useEffect(() => {
    if (club?.id && activeTab === 'players' && !squadGroups) {
      loadSquadData(club.id);
    }
  }, [club?.id, activeTab, squadGroups]);

  // Load Matches data
  useEffect(() => {
    if (club?.id && activeTab === 'matches' && matches.length === 0) {
      const fetchMatches = async () => {
        try {
          setLoadingMatches(true);
          const data = await clubsApi.getMatches(club.id);
          setMatches(data || []);
        } catch (err) {
          console.error('Failed to load matches:', err);
        } finally {
          setLoadingMatches(false);
        }
      };
      fetchMatches();
    }
  }, [club?.id, activeTab, matches.length]);

  // Load Transfers data
  useEffect(() => {
    if (club?.id && activeTab === 'transfers' && !transfers) {
      const fetchTransfers = async () => {
        try {
          setLoadingTransfers(true);
          const data = await clubsApi.getTransfers(club.id);
          setTransfers(data);
        } catch (err) {
          console.error('Failed to load transfers:', err);
        } finally {
          setLoadingTransfers(false);
        }
      };
      fetchTransfers();
    }
  }, [club?.id, activeTab, transfers]);

  // Load Season History data
  useEffect(() => {
    if (club?.id && activeTab === 'history' && !seasonHistory) {
      const fetchHistory = async () => {
        try {
          setLoadingHistory(true);
          const data = await clubsApi.getSeasonHistory(club.id);
          setSeasonHistory(data);
        } catch (err) {
          console.error('Failed to load season history:', err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [club?.id, activeTab, seasonHistory]);

  // Load Stadium & Facilities data
  useEffect(() => {
    if (club?.id && activeTab === 'stadium' && !stadiumInfo) {
      const fetchStadium = async () => {
        try {
          setLoadingStadium(true);
          const data = await clubsApi.getStadium(club.id);
          setStadiumInfo(data);
        } catch (err) {
          console.error('Failed to load stadium:', err);
        } finally {
          setLoadingStadium(false);
        }
      };
      fetchStadium();
    }
  }, [club?.id, activeTab, stadiumInfo]);

  if (loadingClub) {
    return (
      <div className="view-container flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <span className="text-slate-600 font-bold text-sm tracking-wide">{t('common.loading')}...</span>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="view-container text-center py-20">
        <Shield size={56} className="mx-auto mb-4 text-slate-300" />
        <h3 className="text-xl font-extrabold text-slate-700">{t('common.error', 'Không tìm thấy CLB')}</h3>
        <button className="btn btn-secondary mt-6" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>{t('club_detail.back_btn')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="view-container max-w-7xl mx-auto pb-16 space-y-6">
      {/* =========================================================================
          TOP NAV BAR & BREADCRUMB
          ========================================================================= */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-sm btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
        >
          <ArrowLeft size={14} />
          <span>{t('club_detail.back_btn')}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
          <span>{subTitle(club.country) || 'Việt Nam'}</span>
          <span>•</span>
          <span
            style={{
              color: '#15803d',
              fontWeight: 800,
              background: '#dcfce7',
              padding: '3px 10px',
              borderRadius: '6px',
            }}
          >
            {comp(club.current_competition?.name || `Tier ${club.current_competition?.tier || 1}`)}
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: HERO CLUB HEADER (CLEAN STADIUM STYLE)
          ========================================================================= */}
      <ClubHeroBanner club={club} />

      {/* =========================================================================
          SECTION 2: 6 TABS NAVIGATION (PRO FOOTBALL TABS)
          ========================================================================= */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'players' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('players')}
          style={{
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '8px',
            ...(activeTab === 'players'
              ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#34d399',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }
              : {}),
          }}
        >
          <Users size={14} style={{ marginRight: 5, display: 'inline' }} />
          {t('club_detail.tab_players')} ({squadGroups?.totalPlayers ?? 0})
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('staff')}
          style={{
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '8px',
            ...(activeTab === 'staff'
              ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#34d399',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }
              : {}),
          }}
        >
          <Briefcase size={14} style={{ marginRight: 5, display: 'inline' }} />
          {t('club_detail.tab_staff')}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('matches')}
          style={{
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '8px',
            ...(activeTab === 'matches'
              ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#34d399',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }
              : {}),
          }}
        >
          <Calendar size={14} style={{ marginRight: 5, display: 'inline' }} />
          {t('club_detail.tab_matches')} ({matches.length})
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'transfers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transfers')}
          style={{
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '8px',
            ...(activeTab === 'transfers'
              ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#34d399',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }
              : {}),
          }}
        >
          <ArrowLeftRight size={14} style={{ marginRight: 5, display: 'inline' }} />
          {t('club_detail.tab_transfers')}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('history')}
          style={{
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '8px',
            ...(activeTab === 'history'
              ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#34d399',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }
              : {}),
          }}
        >
          <Trophy size={14} style={{ marginRight: 5, display: 'inline' }} />
          {t('club_detail.tab_season_history')}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'stadium' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('stadium')}
          style={{
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '8px',
            ...(activeTab === 'stadium'
              ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#34d399',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }
              : {}),
          }}
        >
          <Building2 size={14} style={{ marginRight: 5, display: 'inline' }} />
          {t('club_detail.tab_stadium_facilities')}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PLAYERS (SQUADVIEW STYLE)
          ========================================================================= */}
      {activeTab === 'players' && (
        <ClubPlayersTab
          squadGroups={squadGroups}
          loadingSquad={loadingSquad}
          onSelectPlayer={(p) => setSelectedPlayerModal(p)}
        />
      )}

      {/* =========================================================================
          TAB 2: COACHING STAFF (BAN HUẤN LUYỆN CLB)
          ========================================================================= */}
      {activeTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ClubStaffView
            clubId={String(club.id)}
            userClubId={myClubId}
            cashBalance={myClub?.financial_accounts?.[0]?.cash_balance ?? myClub?.finances?.cash ?? 0}
            onNavigateToMarket={isOwnClub ? () => navigate('/transfers') : undefined}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: MATCHES (MATCHCENTERVIEW FIXTURE CARDS)
          ========================================================================= */}
      {activeTab === 'matches' && (
        <ClubMatchesTab
          matches={matches}
          loadingMatches={loadingMatches}
          club={club}
        />
      )}

      {/* =========================================================================
          TAB 4: TRANSFERS
          ========================================================================= */}
      {activeTab === 'transfers' && (
        <ClubTransfersTab
          transfers={transfers}
          loadingTransfers={loadingTransfers}
        />
      )}

      {/* =========================================================================
          TAB 5: SEASON HISTORY
          ========================================================================= */}
      {activeTab === 'history' && (
        <ClubHistoryTab
          seasonHistory={seasonHistory}
          loadingHistory={loadingHistory}
        />
      )}

      {/* =========================================================================
          TAB 6: STADIUM & FACILITIES (CƠ SỞ VẬT CHẤT TỪ CSDL)
          ========================================================================= */}
      {activeTab === 'stadium' && (
        <ClubStadiumTab
          club={club}
          stadiumInfo={stadiumInfo}
        />
      )}

      {/* =========================================================================
          PLAYER DETAIL MODAL (KHI CLICK VÀO CẦU THỦ)
          ========================================================================= */}
      {selectedPlayerModal && (
        <PlayerDetailModal
          player={selectedPlayerModal}
          playersList={squadGroups?.firstTeam || []}
          currentClubId={myClubId}
          cashBalance={myClub?.financial_accounts?.[0]?.cash_balance ?? myClub?.finances?.cash ?? 0}
          onClose={() => setSelectedPlayerModal(null)}
          onSelectPlayer={(p) => setSelectedPlayerModal(p)}
          onPlayerUpdated={() => {
            if (club?.id) {
              loadSquadData(club.id);
            }
          }}
        />
      )}
    </div>
  );
};
