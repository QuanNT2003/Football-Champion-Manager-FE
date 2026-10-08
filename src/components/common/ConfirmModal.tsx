import React from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning' | 'primary';
  icon?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'primary',
  icon,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: '#fee2e2',
          iconColor: '#dc2626',
          confirmBtnBg: '#dc2626',
          confirmBtnBorder: '#dc2626',
          confirmBtnColor: '#ffffff',
          defaultIcon: <AlertTriangle size={24} color="#dc2626" />,
        };
      case 'success':
        return {
          iconBg: '#dcfce7',
          iconColor: '#16a34a',
          confirmBtnBg: '#16a34a',
          confirmBtnBorder: '#16a34a',
          confirmBtnColor: '#ffffff',
          defaultIcon: <CheckCircle2 size={24} color="#16a34a" />,
        };
      case 'warning':
        return {
          iconBg: '#fef3c7',
          iconColor: '#d97706',
          confirmBtnBg: '#d97706',
          confirmBtnBorder: '#d97706',
          confirmBtnColor: '#ffffff',
          defaultIcon: <AlertCircle size={24} color="#d97706" />,
        };
      case 'primary':
      default:
        return {
          iconBg: '#dcfce7',
          iconColor: '#15803d',
          confirmBtnBg: '#16a34a',
          confirmBtnBorder: '#16a34a',
          confirmBtnColor: '#ffffff',
          defaultIcon: <HelpCircle size={24} color="#15803d" />,
        };
    }
  };

  const vStyles = getVariantStyles();

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: vStyles.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon || vStyles.defaultIcon}
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.12rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s',
            }}
            title={t('common.close', 'Đóng')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '0.75rem 1.25rem 1.25rem',
            fontSize: '0.9rem',
            color: '#475569',
            lineHeight: 1.55,
          }}
        >
          {message}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{
              padding: '0.55rem 1.15rem',
              fontWeight: 700,
              borderRadius: '8px',
              fontSize: '0.88rem',
              background: '#ffffff',
              borderColor: '#cbd5e1',
              color: '#475569',
            }}
          >
            {cancelText || t('common.cancel', 'Hủy Bỏ')}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="btn btn-sm flex-center"
            style={{
              padding: '0.55rem 1.35rem',
              fontWeight: 800,
              borderRadius: '8px',
              fontSize: '0.88rem',
              background: vStyles.confirmBtnBg,
              borderColor: vStyles.confirmBtnBorder,
              color: vStyles.confirmBtnColor,
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            }}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                <span>{t('common.processing', 'Đang xử lý...')}</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
