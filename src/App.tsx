import React, { useState, useEffect } from 'react';
import { Club, Player, TimelineData, User } from './types';
import { clubsApi, playersApi, gameWorldApi, authApi } from './services/api';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SquadView } from './components/SquadView';
import { TacticsView } from './components/TacticsView';
import { MatchCenterView } from './components/MatchCenterView';
import { StandingsView } from './components/StandingsView';
import { TransfersView } from './components/TransfersView';
import { FinancesView } from './components/FinancesView';
import { TrainingView } from './components/TrainingView';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { LoginModal } from './components/LoginModal';
import { LayoutDashboard, Users, Compass, Swords, ShoppingCart, Trophy, CreditCard, Dumbbell } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // 1. Load game world timeline
      const tl = await gameWorldApi.getTimeline('1').catch(() => null);
      if (tl) setTimeline(tl);

      // 2. Check current manager or load default club
      const token = localStorage.getItem('fc_token');
      if (token) {
        try {
          const profile = await authApi.getProfile().catch(() => null);
          if (profile) setUser(profile);
          const myClub = await clubsApi.getMyClub().catch(() => null);
          if (myClub && myClub.id) {
            setClub(myClub);
            loadClubSquad(myClub.id);
            return;
          }
        } catch (e) {
          console.warn('No claimed club yet');
        }
      }

      // Default to club 1 if no user login yet
      const defaultClub = await clubsApi.getClubById('1').catch(() => null);
      if (defaultClub) {
        setClub(defaultClub);
        loadClubSquad(defaultClub.id);
      }
    } catch (err) {
      console.error('App init error:', err);
    }
  };

  const loadClubSquad = async (clubId: string) => {
    try {
      const squad = await playersApi.getClubSquad(clubId);
      setPlayers(Array.isArray(squad) ? squad : []);
    } catch (err) {
      console.error('Failed to load squad:', err);
    }
  };

  const refreshClubData = async () => {
    if (!club) return;
    try {
      const updated = await clubsApi.getClubById(club.id);
      setClub(updated);
      loadClubSquad(club.id);
    } catch (err) {
      console.error('Failed to refresh club:', err);
    }
  };

  const handleUpgradeFacility = async (facilityId: string) => {
    if (!club) return;
    try {
      await clubsApi.upgradeFacility(club.id, facilityId);
      setGlobalNotification('Cơ sở vật chất đã bắt đầu nâng cấp thành công!');
      refreshClubData();
      setTimeout(() => setGlobalNotification(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Nâng cấp thất bại. Không đủ số dư quỹ CLB.');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Tổng Quan (Dashboard)', icon: LayoutDashboard },
    { id: 'squad', label: 'Đội Hình & Cầu Thủ', icon: Users },
    { id: 'tactics', label: 'Chiến Thuật 2D', icon: Compass },
    { id: 'matches', label: 'Trung Tâm Trận Đấu', icon: Swords },
    { id: 'transfers', label: 'Thị Trường Chuyển Nhượng', icon: ShoppingCart },
    { id: 'standings', label: 'Bảng Xếp Hạng', icon: Trophy },
    { id: 'finances', label: 'Ngân Quỹ CLB', icon: CreditCard },
    { id: 'training', label: 'Sân Tập Đội Bóng', icon: Dumbbell },
  ];

  const cash = club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 5000000;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        club={club}
        timeline={timeline}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Global Notification Banner */}
      {globalNotification && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.95), rgba(6, 214, 160, 0.95))',
          color: '#070b12',
          fontWeight: 700,
          textAlign: 'center',
          padding: '0.6rem 1rem',
          fontSize: '0.9rem'
        }}>
          ✨ {globalNotification}
        </div>
      )}

      {/* Main App Layout */}
      <div className="main-layout">
        {/* Navigation Sidebar */}
        <aside className="sidebar">
          <nav className="nav-menu">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Content Views */}
        <main className="content-area">
          {activeTab === 'dashboard' && (
            <DashboardView
              club={club}
              timeline={timeline}
              onUpgradeFacility={handleUpgradeFacility}
              onSwitchTab={(t: string) => setActiveTab(t)}
            />
          )}

          {activeTab === 'squad' && (
            <SquadView
              players={players}
              onSelectPlayer={(p) => setSelectedPlayer(p)}
              onUpdateTransferListing={() => refreshClubData()}
            />
          )}

          {activeTab === 'tactics' && club && (
            <TacticsView
              club={club}
              players={players}
            />
          )}

          {activeTab === 'matches' && club && (
            <MatchCenterView
              club={club}
              onMatchSimulated={() => refreshClubData()}
            />
          )}

          {activeTab === 'transfers' && club && (
            <TransfersView
              currentClubId={club.id}
              cashBalance={cash}
              onRefreshFinance={refreshClubData}
              onSelectPlayer={(p) => setSelectedPlayer(p)}
            />
          )}

          {activeTab === 'standings' && club && (
            <StandingsView
              currentClubId={club.id}
            />
          )}

          {activeTab === 'finances' && club && (
            <FinancesView
              currentClubId={club.id}
              onRefreshBalance={refreshClubData}
            />
          )}

          {activeTab === 'training' && club && (
            <TrainingView
              currentClubId={club.id}
            />
          )}
        </main>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          currentClubId={club?.id || '1'}
          onClose={() => setSelectedPlayer(null)}
          onPlayerUpdated={() => {
            refreshClubData();
            setSelectedPlayer(null);
          }}
        />
      )}

      {/* Login & Club Claiming Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(token, u, c) => {
          setUser(u);
          if (c) {
            setClub(c);
            loadClubSquad(c.id);
          }
        }}
      />
    </div>
  );
}

export default App;
