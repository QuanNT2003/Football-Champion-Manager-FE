import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileCheck, X, Calendar, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { formatCurrency } from '../../utils/formatters';

export interface RenewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  name: string;
  currentWage: number;
  currentEndSeason: number;
  isLoading?: boolean;
  onConfirm: (data: { additionalSeasons: number; proposedWage: number }) => Promise<void>;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  isOpen,
  onClose,
  title,
  name,
  currentWage,
  currentEndSeason,
  isLoading = false,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [additionalSeasons, setAdditionalSeasons] = useState<number>(2);
  const [proposedWage, setProposedWage] = useState<number>(currentWage || 5000);

  useEffect(() => {
    if (isOpen) {
      setProposedWage(currentWage || 5000);
      setAdditionalSeasons(2);
    }
  }, [isOpen, currentWage]);

  if (!isOpen) return null;

  const newEndSeason = currentEndSeason + additionalSeasons;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || proposedWage <= 0) return;
    await onConfirm({ additionalSeasons, proposedWage });
  };

  const modalNode = (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'pmModalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {title || t('contract.renew_modal_title', 'Gia Hạn Hợp Đồng')}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: '2px' }}>
                {name}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: '4px',
              borderRadius: '6px',
              opacity: 0.85,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Current vs New Contract Duration Preview */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
              {t('contract.duration_preview', 'Thời Gian Hợp Đồng')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ textAlign: 'center', flex: 1, background: '#ffffff', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('contract.current_end', 'Hết hạn hiện tại')}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                  {t('contract.season_num', 'Mùa {num}').replace('{num}', String(currentEndSeason))}
                </div>
              </div>

              <ArrowRight size={18} color="#94a3b8" />

              <div style={{ textAlign: 'center', flex: 1, background: '#ecfdf5', padding: '0.6rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.75rem', color: '#047857' }}>{t('contract.new_end', 'Hết hạn mới')}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>
                  {t('contract.season_num', 'Mùa {num}').replace('{num}', String(newEndSeason))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Additional Seasons Selector */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              <Calendar size={16} color="#059669" />
              {t('contract.select_additional_seasons', 'Số mùa gia hạn thêm:')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map((s) => {
                const isSelected = additionalSeasons === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAdditionalSeasons(s)}
                    style={{
                      padding: '0.6rem 0.2rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                      background: isSelected ? '#dcfce7' : '#ffffff',
                      color: isSelected ? '#065f46' : '#475569',
                    }}
                  >
                    +{s} {t('contract.season_unit', 'mùa')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Proposed Weekly Wage */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                <DollarSign size={16} color="#d97706" />
                {t('contract.proposed_weekly_wage', 'Mức lương tuần mới đề xuất:')}
              </label>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {t('contract.current_wage_prefix', 'Hiện tại:')} <strong>{formatCurrency(currentWage)} / {t('common.week', 'tuần')}</strong>
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min={100}
                step={500}
                value={proposedWage || ''}
                onChange={(e) => setProposedWage(Math.max(100, Number(e.target.value)))}
                className="input-text"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#d97706',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                }}
                required
              />
              <span style={{ position: 'absolute', right: 12, top: 12, fontSize: '0.88rem', color: '#94a3b8', fontWeight: 700 }}>
                € / {t('common.week', 'tuần')}
              </span>
            </div>

            {/* Quick Adjustment Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => setProposedWage(currentWage)}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                {t('contract.keep_wage', 'Giữ nguyên')}
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => setProposedWage(Math.round(currentWage * 1.1))}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                +10%
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => setProposedWage(Math.round(currentWage * 1.2))}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                +20%
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => setProposedWage(Math.max(500, proposedWage - 1000))}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                -€1,000
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => setProposedWage(proposedWage + 1000)}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                +€1,000
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
              style={{ minWidth: '100px' }}
            >
              {t('common.cancel', 'Hủy bỏ')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || proposedWage <= 0}
              style={{
                minWidth: '160px',
                background: '#059669',
                borderColor: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: 700,
              }}
            >
              {isLoading ? (
                <span>{t('common.processing', 'Đang xử lý...')}</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{t('contract.confirm_renew_btn', 'Xác Nhận Gia Hạn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
