import React, { useState } from 'react';
import { getPosCategory } from './PositionBadge';
import { getFacepackUrl } from '../../utils/image';

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
  const [imgError, setImgError] = useState(false);
  const category = getPosCategory(position);
  const initial = (name || 'P').charAt(0).toUpperCase();
  const fullPhotoUrl = getFacepackUrl(photoUrl);

  if (fullPhotoUrl && fullPhotoUrl !== '/assets/players/default.png' && !imgError) {
    return (
      <img
        src={fullPhotoUrl}
        alt={name}
        className={`player-avatar-sm avatar-pos-${category} ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`player-avatar-sm avatar-pos-${category} ${className}`}>
      {initial}
    </div>
  );
};
