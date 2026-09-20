import React from 'react';
import { getPosCategory } from './PositionBadge';

interface PlayerAvatarProps {
  name: string;
  position?: string;
  photoUrl?: string;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  position = 'MID',
  photoUrl,
  className = ''
}) => {
  const category = getPosCategory(position);
  const initial = (name || 'P').charAt(0).toUpperCase();

  if (photoUrl && photoUrl !== '/assets/players/default.png') {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`player-avatar-sm avatar-pos-${category} ${className}`}
      />
    );
  }

  return (
    <div className={`player-avatar-sm avatar-pos-${category} ${className}`}>
      {initial}
    </div>
  );
};
