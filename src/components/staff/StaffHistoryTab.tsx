import { useTranslation } from '../../i18n';
import React from 'react';
import { Calendar, Shield } from 'lucide-react';
import { StaffDetailResponse } from '../../services/transfers.service';

interface Props {
  detail: StaffDetailResponse | null;
  formatMoney: (val: number) => string;
}

export const StaffHistoryTab: React.FC<Props> = ({ detail, formatMoney }) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return t('staff.current_role');
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const { t } = useTranslation();
  return (
    <div>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
        {t('staff.history_title')}
      </h4>

      {detail?.contractHistory && detail.contractHistory.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {detail.contractHistory.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '8px',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Shield size={20} color="#64748b" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    {item.club?.name || t('staff.history_free_club', 'CLB Tự do')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} />
                    <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.92rem' }}>
                  {formatMoney(item.salary)} {t('staff.per_week', '/ tuần')}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    background: item.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                    color: item.status === 'ACTIVE' ? '#16a34a' : '#64748b',
                  }}
                >
                  {item.status === 'ACTIVE' ? t('staff.status_active', 'Đang hiệu lực') : t('staff.status_ended', 'Đã kết thúc')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.88rem' }}>
          {t('staff.no_history', 'Chưa có ghi nhận lịch sử công tác trước đây')}
        </div>
      )}
    </div>
  );
};
