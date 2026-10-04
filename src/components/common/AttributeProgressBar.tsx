import React from 'react';

interface Props {
  name: string;
  value: number;
  isKey?: boolean;
  description?: string;
  maxValue?: number;
}

export const AttributeProgressBar: React.FC<Props> = ({
  name,
  value,
  isKey = false,
  description,
  maxValue = 100,
}) => {
  const percent = Math.min(100, Math.max(0, (value / maxValue) * 100));

  const getColor = (v: number) => {
    if (v >= 90) return '#16a34a'; // Excellent Green
    if (v >= 80) return '#0284c7'; // Great Blue
    if (v >= 70) return '#d97706'; // Good Amber
    if (v >= 50) return '#ea580c'; // Average Orange
    return '#dc2626';             // Poor Red
  };

  const color = getColor(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }} title={description}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
        <span style={{ color: isKey ? '#0f172a' : '#475569', fontWeight: isKey ? 700 : 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {name}
          {isKey && (
            <span style={{ background: '#fef08a', color: '#854d0e', fontSize: '0.62rem', fontWeight: 800, padding: '0.05rem 0.3rem', borderRadius: '4px' }}>
              KEY
            </span>
          )}
        </span>
        <span style={{ fontWeight: 800, color, fontSize: '0.86rem' }}>
          {value}
        </span>
      </div>
      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
