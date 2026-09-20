import React from 'react';

export const getPosCategory = (pos: string) => {
  const u = (pos || '').toUpperCase();
  if (u.includes('GK')) return 'gk';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF', 'SW'].some(k => u.includes(k))) return 'def';
  if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'MID', 'DM', 'AM'].some(k => u.includes(k))) return 'mid';
  return 'fwd';
};

interface PositionBadgeProps {
  position: string;
  className?: string;
}

export const PositionBadge: React.FC<PositionBadgeProps> = ({ position, className = '' }) => {
  const category = getPosCategory(position);
  return (
    <span className={`pos-badge pos-${category} ${className}`}>
      {position}
    </span>
  );
};
