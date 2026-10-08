import React from 'react';
import { Outlet } from 'react-router-dom';
import { Club, Player, TimelineData, User } from '../types';
import { Navbar } from '../components/Navbar';
import { LeftDockRail } from '../components/LeftDockRail';
import { PlayerDetailModal } from '../components/PlayerDetailModal';

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
    <div className="app-container master-cockpit-layout">
      {/* 1. Left Vertical Dock Rail (Menu những phần thuộc về Câu Lạc Bộ của mình) */}
      <LeftDockRail squadCount={players.length} />

      {/* Main Right Area (Header + Centered 60-70% Content) */}
      <div className="cockpit-viewport">
        {/* Global Notification Banner */}
        {globalNotification && (
          <div className="notification-banner">
            <span className="notification-icon">⚽</span>
            <span>{globalNotification}</span>
          </div>
        )}

        {/* 2. Top Header HUD (Thanh Header thuộc về những gì BÊN NGOÀI câu lạc bộ) */}
        <Navbar
          club={club}
          timeline={timeline}
          user={user}
          onOpenLogin={() => {}}
          onLogout={onLogout}
        />

        {/* 3. Center Content Area (Chiếm khoảng 60-70% màn hình nằm ở giữa) */}
        <main className="main-content center-content-wrapper">
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
      </div>

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
