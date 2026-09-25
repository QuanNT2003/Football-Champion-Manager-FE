import React from 'react';

interface TeamItem {
  id: string | number;
  name: string;
  logo_url?: string;
  stadium?: {
    name?: string;
    capacity?: number;
  } | null;
}

interface TeamsListViewProps {
  teams: TeamItem[];
  currentClubId?: string;
}

export const TeamsListView: React.FC<TeamsListViewProps> = ({ teams, currentClubId }) => {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
        Danh Sách Câu Lạc Bộ Tham Gia ({teams.length} Đội)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {teams.map((t) => {
          const isCurrent = t.id.toString() === currentClubId?.toString();
          return (
            <div
              key={t.id}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: isCurrent ? '2px solid #15803d' : '1px solid #e2e8f0',
                background: isCurrent ? '#f0fdf4' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                }}
              >
                {t.logo_url ? (
                  <img src={t.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  '⚽'
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: isCurrent ? '#15803d' : '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px',
                  }}
                >
                  <span>Sân: {t.stadium?.name || 'Sân Vận Động'}</span>
                  <span>•</span>
                  <span>Sức chứa: {(t.stadium?.capacity || 5000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
