import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Club, Player, TimelineData, User } from './types';
import { clubsApi } from './services/clubs.service';
import { playersApi } from './services/players.service';
import { gameWorldApi } from './services/gameWorld.service';
import { authApi } from './services/auth.service';

import { GameLayout } from './layouts/GameLayout';
import { AuthScreen } from './components/AuthScreen';
import { ClubOnboardingScreen } from './components/ClubOnboardingScreen';
import { DashboardView } from './components/DashboardView';
import { SquadView } from './components/SquadView';
import { TacticsView } from './components/TacticsView';
import { MatchCenterView } from './components/MatchCenterView';
import { TransfersView } from './components/TransfersView';
import { FacilitiesView } from './components/FacilitiesView';
import { FinancesView } from './components/FinancesView';
import { TrainingView } from './components/TrainingView';
import { StandingsView } from './components/StandingsView';
import { Loader2 } from 'lucide-react';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
    const token = localStorage.getItem('fc_token');

    if (!token) {
      setUser(null);
      setClub(null);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Verify User Profile
      const profile = await authApi.getProfile().catch(() => null);
      if (!profile) {
        authApi.logout();
        setUser(null);
        setClub(null);
        setIsLoading(false);
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
        setIsLoading(false);
        return;
      }

      setClub(myClub);
      loadClubSquad(myClub.id);
      setIsLoading(false);
    } catch (err) {
      console.error('Error during auth verification:', err);
      authApi.logout();
      setUser(null);
      setClub(null);
      setIsLoading(false);
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
    navigate('/login');
  };

  const handleClubClaimed = (newClub: Club) => {
    setClub(newClub);
    loadClubSquad(newClub.id);
    navigate('/dashboard');
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
      setTimeout(() => setGlobalNotification(null), 3500);
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
      setTimeout(() => setGlobalNotification(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật danh sách chuyển nhượng');
    }
  };

  // Sleek Gaming HUD Loading Screen
  if (isLoading) {
    return (
      <div className="app-loading-screen-hud">
        <div className="loading-card-hud">
          <div className="loading-crest-hex">⚽</div>
          <h2>FOOTBALL CHAMPION MANAGER</h2>
          <div className="loading-spinner-row">
            <Loader2 className="spinner-icon-hud" size={24} />
            <span>Đang đồng bộ dữ liệu Match Engine & HLV...</span>
          </div>
        </div>
      </div>
    );
  }

  const cashBalance = club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 1500000;

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          user && club ? (
            <Navigate to="/dashboard" replace />
          ) : user && !club ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <AuthScreen onAuthSuccess={checkAuthState} defaultMode="login" />
          )
        }
      />
      <Route
        path="/register"
        element={
          user && club ? (
            <Navigate to="/dashboard" replace />
          ) : user && !club ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <AuthScreen onAuthSuccess={checkAuthState} defaultMode="register" />
          )
        }
      />

      {/* Onboarding Room Route */}
      <Route
        path="/onboarding"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : club ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <ClubOnboardingScreen
              user={user}
              onClubClaimed={handleClubClaimed}
              onLogout={handleLogout}
            />
          )
        }
      />

      {/* Main Game Layout & Nested Routes */}
      <Route
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : !club ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <GameLayout
              club={club}
              user={user}
              timeline={timeline}
              players={players}
              selectedPlayer={selectedPlayer}
              globalNotification={globalNotification}
              onLogout={handleLogout}
              onUpgradeFacility={handleUpgradeFacility}
              onUpdateTransferListing={handleUpdateTransferListing}
              refreshClubData={refreshClubData}
              loadClubSquad={loadClubSquad}
              setSelectedPlayer={setSelectedPlayer}
            />
          )
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <DashboardView
              club={club}
              timeline={timeline}
              onUpgradeFacility={handleUpgradeFacility}
            />
          }
        />
        <Route
          path="/squad"
          element={
            <SquadView
              players={players}
              onSelectPlayer={setSelectedPlayer}
              onUpdateTransferListing={handleUpdateTransferListing}
            />
          }
        />
        <Route
          path="/tactics"
          element={
            <TacticsView
              club={club}
              players={players}
            />
          }
        />
        <Route
          path="/matches"
          element={
            <MatchCenterView
              club={club}
              timeline={timeline}
              onMatchSimulated={refreshClubData}
            />
          }
        />
        <Route
          path="/transfers"
          element={
            <TransfersView
              currentClubId={club?.id || '1'}
              cashBalance={cashBalance}
              onRefreshFinance={refreshClubData}
              onSelectPlayer={setSelectedPlayer}
            />
          }
        />
        <Route
          path="/facilities"
          element={
            <FacilitiesView
              club={club}
              onUpgradeFacility={handleUpgradeFacility}
            />
          }
        />
        <Route
          path="/finances"
          element={
            <FinancesView
              currentClubId={club?.id || '1'}
              onRefreshBalance={refreshClubData}
            />
          }
        />
        <Route
          path="/training"
          element={
            <TrainingView
              currentClubId={club?.id || '1'}
            />
          }
        />
        <Route
          path="/standings"
          element={
            <StandingsView
              club={club}
              currentClubId={club?.id || '1'}
            />
          }
        />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route
        path="*"
        element={
          <Navigate
            to={user && club ? '/dashboard' : user ? '/onboarding' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
