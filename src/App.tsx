import React, { useState, useEffect, useCallback } from 'react';
import { Club, Player, TimelineData, User } from './types';
import { clubsApi } from './services/clubs.service';
import { playersApi } from './services/players.service';
import { gameWorldApi } from './services/gameWorld.service';
import { authApi } from './services/auth.service';
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
import { AuthScreen } from './components/AuthScreen';
import { ClubOnboardingScreen } from './components/ClubOnboardingScreen';
import {
  LayoutDashboard,
  Users,
  Compass,
  Swords,
  ShoppingCart,
  Trophy,
  CreditCard,
  Dumbbell,
  Loader2,
} from 'lucide-react';

type AppState = 'LOADING' | 'AUTH' | 'ONBOARDING' | 'GAME';

export function App() {
  const [appState, setAppState] = useState<AppState>('LOADING');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  const loadClubSquad = async (clubId: string) => {
    try {
      const squad = await playersApi.getClubSquad(clubId);
      setPlayers(Array.isArray(squad) ? squad : []);
    } catch (err) {
      console.error('Failed to load squad:', err);
    }
  };

  const checkAuthState = useCallback(async () => {
    setAppState('LOADING');
    const token = localStorage.getItem('fc_token');

    if (!token) {
      setUser(null);
      setClub(null);
      setAppState('AUTH');
      return;
    }

    try {
      // 1. Verify User Profile
      const profile = await authApi.getProfile().catch(() => null);
      if (!profile) {
        authApi.logout();
        setUser(null);
        setClub(null);
        setAppState('AUTH');
        return;
      }
      setUser(profile);

      // 2. Load Timeline
      gameWorldApi.getTimeline('1').then((tl) => {
        if (tl) setTimeline(tl);
      }).catch(() => null);

      // 3. Check if user owns a club
      const myClub = await clubsApi.getMyClub().catch(() => null);
      if (!myClub || !myClub.id) {
        setClub(null);
        setAppState('ONBOARDING');
        return;
      }

      setClub(myClub);
      loadClubSquad(myClub.id);
      setAppState('GAME');
    } catch (err) {
      console.error('Error during auth verification:', err);
      authApi.logout();
      setAppState('AUTH');
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setClub(null);
    setPlayers([]);
    setAppState('AUTH');
  };

  const handleClubClaimed = (newClub: Club) => {
    setClub(newClub);
    loadClubSquad(newClub.id);
    setAppState('GAME');
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
      alert(err.response?.data?.message || 'Nâng cấp thất bại, kiểm tra số dư');
    }
  };

  const handleUpdateTransferListing = async (
    playerId: string,
    isTransfer: boolean,
    isLoan: boolean,
    price?: number
  ) => {
    try {
      await playersApi.updateTransferListing(playerId, isTransfer, isLoan, price);
      setGlobalNotification('Cập nhật trạng thái thị trường chuyển nhượng thành công!');
      if (club) loadClubSquad(club.id);
      setTimeout(() => setGlobalNotification(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật danh sách chuyển nhượng');
    }
  };

  // 1. STATE: LOADING SCREEN
  if (appState === 'LOADING') {
    return (
      <div className="app-loading-screen">
        <div className="loading-card">
          <div className="loading-logo">⚽</div>
          <h2>Football Champion Manager</h2>
          <div className="loading-spinner-row">
            <Loader2 className="spinner-icon" size={24} />
            <span>Đang xác thực thông tin Huấn Luyện Viên...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. STATE: AUTH SCREEN (Strict access control)
  if (appState === 'AUTH') {
    return <AuthScreen onAuthSuccess={checkAuthState} />;
  }

  // 3. STATE: ONBOARDING SCREEN (Logged in, but no club yet)
  if (appState === 'ONBOARDING') {
    return (
      <ClubOnboardingScreen
        user={user}
        onClubClaimed={handleClubClaimed}
        onLogout={handleLogout}
      />
    );
  }

  const cashBalance = club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 1500000;

  // 4. STATE: MAIN GAME DASHBOARD
  return (
    <div className="app-container">
      {globalNotification && (
        <div className="notification-banner">
          {globalNotification}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        club={club}
        timeline={timeline}
        user={user}
        onOpenLogin={() => {}}
        onLogout={handleLogout}
      />

      {/* Navigation Sub-bar */}
      <nav className="sub-nav">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Tổng Quan</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'squad' ? 'active' : ''}`}
          onClick={() => setActiveTab('squad')}
        >
          <Users size={18} />
          <span>Đội Hình ({players.length})</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'tactics' ? 'active' : ''}`}
          onClick={() => setActiveTab('tactics')}
        >
          <Compass size={18} />
          <span>Chiến Thuật</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <Swords size={18} />
          <span>Lịch Thi Đấu</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          <ShoppingCart size={18} />
          <span>Chuyển Nhượng</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          <CreditCard size={18} />
          <span>Cơ Sở Vật Chất</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'finances' ? 'active' : ''}`}
          onClick={() => setActiveTab('finances')}
        >
          <Trophy size={18} />
          <span>Tài Chính & Shop</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          <Dumbbell size={18} />
          <span>Huấn Luyện</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          <Trophy size={18} />
          <span>Bảng Xếp Hạng</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            club={club}
            timeline={timeline}
            onUpgradeFacility={handleUpgradeFacility}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'squad' && (
          <SquadView
            players={players}
            onSelectPlayer={setSelectedPlayer}
            onUpdateTransferListing={handleUpdateTransferListing}
          />
        )}

        {activeTab === 'tactics' && (
          <TacticsView
            club={club}
            players={players}
          />
        )}

        {activeTab === 'matches' && (
          <MatchCenterView
            club={club}
            timeline={timeline}
            onMatchSimulated={refreshClubData}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsView
            club={club}
            currentClubId={club?.id || '1'}
          />
        )}

        {activeTab === 'transfers' && (
          <TransfersView
            currentClubId={club?.id || '1'}
            cashBalance={Number(cashBalance)}
            onRefreshFinance={refreshClubData}
            onSelectPlayer={setSelectedPlayer}
          />
        )}

        {activeTab === 'facilities' && club && (
          <div className="view-container">
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Cơ Sở Vật Chất & Nâng Cấp SVĐ</h2>
              <div className="facilities-grid">
                {(club.facilities || []).map((f) => (
                  <div key={f.id} className="facility-card">
                    <div>
                      <h4 style={{ color: '#0284c7' }}>{f.name}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Cấp độ hiện tại: {f.current_level}</p>
                      <p style={{ color: '#059669', fontSize: '0.85rem' }}>Trạng thái: {f.status}</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUpgradeFacility(f.id)}
                    >
                      Nâng cấp (+1 Cấp)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <FinancesView
            currentClubId={club?.id || '1'}
            onRefreshBalance={refreshClubData}
          />
        )}

        {activeTab === 'training' && (
          <TrainingView
            currentClubId={club?.id || '1'}
          />
        )}
      </main>

      {/* Modals */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          currentClubId={club?.id || '1'}
          onClose={() => setSelectedPlayer(null)}
          onPlayerUpdated={() => {
            if (club) loadClubSquad(club.id);
          }}
        />
      )}
    </div>
  );
}

export default App;
