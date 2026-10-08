import React from 'react';
import { useTranslation } from '../../i18n/I18nContext';


interface Props {
  license: string;
  size?: 'sm' | 'md';
}

export const LicenseBadge: React.FC<Props> = ({ license, size = 'md' }) => {
  const { t } = useTranslation();
  const getBadgeStyle = (lic: string) => {
    switch (lic) {
      case 'PRO':
        return { text: 'UEFA PRO', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' };
      case 'A':
        return { text: t('license.a', 'BẰNG A'), bg: 'linear-gradient(135deg, #10b981, #059669)' };
      case 'B':
        return { text: t('license.b', 'BẰNG B'), bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' };
      case 'C':
        return { text: t('license.c', 'BẰNG C'), bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' };
      default:
        return { text: lic, bg: '#94a3b8' };
    }
  };

  const { text, bg } = getBadgeStyle(license);

  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: '#ffffff',
        fontSize: size === 'sm' ? '0.62rem' : '0.7rem',
        fontWeight: 900,
        padding: size === 'sm' ? '0.1rem 0.35rem' : '0.15rem 0.45rem',
        borderRadius: '5px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        letterSpacing: '0.02em',
      }}
    >
      {text}
    </span>
  );
};
