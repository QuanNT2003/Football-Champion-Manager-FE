import React from 'react';

interface Props {
  role: string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<Props> = ({ role, size = 'md' }) => {
  const getRoleConfig = (r: string) => {
    switch (r) {
      case 'HEAD_COACH':
        return { label: 'HLV Trưởng', color: '#16a34a', bg: '#dcfce7' };
      case 'ASSISTANT_COACH':
        return { label: 'Trợ Lý HLV', color: '#0284c7', bg: '#e0f2fe' };
      case 'FITNESS_COACH':
        return { label: 'HLV Thể Lực', color: '#ea580c', bg: '#ffedd5' };
      case 'GOALKEEPING_COACH':
        return { label: 'HLV Thủ Môn', color: '#7c3aed', bg: '#ede9fe' };
      case 'SCOUT':
        return { label: 'Tuyển Trạch Viên', color: '#4f46e5', bg: '#e0e7ff' };
      case 'PHYSIO':
        return { label: 'Bác Sĩ / Trị Liệu', color: '#db2777', bg: '#fce7f3' };
      case 'YOUTH_DIRECTOR':
        return { label: 'GĐ Đào Tạo Trẻ', color: '#059669', bg: '#d1fae5' };
      default:
        return { label: r, color: '#475569', bg: '#f1f5f9' };
    }
  };

  const { label, color, bg } = getRoleConfig(role);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.1rem 0.35rem' : '0.18rem 0.5rem',
        borderRadius: '6px',
        fontSize: size === 'sm' ? '0.68rem' : '0.75rem',
        fontWeight: 800,
        color,
        background: bg,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};
