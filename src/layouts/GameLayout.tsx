import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Club, Player, TimelineData, User } from '../types';
import { Navbar } from '../components/Navbar';
import { PlayerDetailModal } from '../components/PlayerDetailModal';
import {
  LayoutDashboard,
  Users,
  Compass,
  Swords,
  ShoppingCart,
  Building2,
  Trophy,
  Dumbbell,
  BarChart3,
} from 'lucide-react';

interface Props {
  club: Club | null;
  user: User | null;
  timeline: TimelineData | null;
  players: Player[];
  selectedPlayer: Player | null;
  globalNotification: string | null;
  onLogout: () => void;
  onUpgradeFacility: (facilityId: string) => Promise<void> | void;
  onUpdateTransferListing: (playerId: string, isTransfer: boolean, isLoan: boolean, price?: number) => Promise<void> | void;
  refreshClubData: () => Promise<void> | void;
  loadClubSquad: (clubId: string) => Promise<void> | void;
  setSelectedPlayer: (player: Player | null) => void;
}

export const GameLayout: React.FC<Props> = ({
  club,
  user,
  timeline,
  players,
  selectedPlayer,
  globalNotification,
  onLogout,
  onUpgradeFacility,
  onUpdateTransferListing,
  refreshClubData,
  loadClubSquad,
  setSelectedPlayer,
}) => {
  return (
    <div className="app-container">
      {globalNotification && (
        <div className="notification-banner">
          <span className="notification-icon">⚡</span>
          <span>{globalNotification}</span>
        </div>
      )}

      {/* Main Gaming Navbar */}
      <Navbar
        club={club}
        timeline={timeline}
        user={user}
        onOpenLogin={() => {}}
        onLogout={onLogout}
      />

      {/* Navigation Sub-bar with React Router NavLinks */}
      <nav className="sub-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Tổng Quan</span>
        </NavLink>

        <NavLink
          to="/squad"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Đội Hình ({players.length})</span>
        </NavLink>

        <NavLink
          to="/tactics"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Compass size={18} />
          <span>Chiến Thuật</span>
        </NavLink>

        <NavLink
          to="/matches"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Swords size={18} />
          <span>Lịch Thi Đấu</span>
        </NavLink>

        <NavLink
          to="/transfers"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <ShoppingCart size={18} />
          <span>Chuyển Nhượng</span>
        </NavLink>

        <NavLink
          to="/facilities"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Building2 size={18} />
          <span>Cơ Sở Vật Chất</span>
        </NavLink>

        <NavLink
          to="/finances"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Trophy size={18} />
          <span>Tài Chính & Shop</span>
        </NavLink>

        <NavLink
          to="/training"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Dumbbell size={18} />
          <span>Huấn Luyện</span>
        </NavLink>

        <NavLink
          to="/standings"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Bảng Xếp Hạng</span>
        </NavLink>
      </nav>

      {/* Main Routed Content Area */}
      <main className="main-content">
        <Outlet
          context={{
            club,
            user,
            timeline,
            players,
            onUpgradeFacility,
            onUpdateTransferListing,
            refreshClubData,
            loadClubSquad,
            setSelectedPlayer,
          }}
        />
      </main>

      {/* Modals */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          playersList={players}
          currentClubId={club?.id || '1'}
          onClose={() => setSelectedPlayer(null)}
          onSelectPlayer={(p) => setSelectedPlayer(p)}
          onPlayerUpdated={() => {
            if (club) loadClubSquad(club.id);
          }}
        />
      )}
    </div>
  );
};
