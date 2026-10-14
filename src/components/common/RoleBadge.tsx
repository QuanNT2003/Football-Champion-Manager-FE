import React from 'react';
import { useTranslation } from '../../i18n';

interface Props {
  role: string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<Props> = ({ role, size = 'md' }) => {
  const { t } = useTranslation();

  const getRoleConfig = (r: string) => {
    switch (r) {
      case 'HEAD_COACH':
        return { label: t('staff.head_coach', 'HLV Trưởng'), color: '#16a34a', bg: '#dcfce7' };
      case 'ASSISTANT_COACH':
        return { label: t('staff.assistant_coach', 'Trợ Lý HLV'), color: '#0284c7', bg: '#e0f2fe' };
      case 'HEAD_COACH_YOUTH':
        return { label: t('staff.head_coach_youth', 'HLV Trưởng Đội Trẻ U21'), color: '#059669', bg: '#d1fae5' };
      case 'ASSISTANT_COACH_YOUTH':
        return { label: t('staff.assistant_coach_youth', 'Trợ Lý HLV Đội Trẻ U21'), color: '#0891b2', bg: '#cffafe' };
      case 'YOUTH_COACH':
        return { label: t('staff.youth_coach', 'HLV Tuyến Trẻ'), color: '#0d9488', bg: '#ccfbf1' };
      case 'FITNESS_COACH':
        return { label: t('staff.fitness_coach', 'HLV Thể Lực'), color: '#ea580c', bg: '#ffedd5' };
      case 'GOALKEEPING_COACH':
        return { label: t('staff.gk_coach', 'HLV Thủ Môn'), color: '#7c3aed', bg: '#ede9fe' };
      case 'SCOUT':
        return { label: t('staff.scout_short', 'Tuyển Trạch Viên'), color: '#4f46e5', bg: '#e0e7ff' };
      case 'PHYSIO':
        return { label: t('staff.physio_short', 'Bác Sĩ / Trị Liệu'), color: '#db2777', bg: '#fce7f3' };
      case 'YOUTH_DIRECTOR':
        return { label: t('staff.youth_director', 'GĐ Đào Tạo Trẻ'), color: '#0d9488', bg: '#ccfbf1' };
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
        padding: size === 'sm' ? '0.12rem 0.4rem' : '0.2rem 0.55rem',
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
