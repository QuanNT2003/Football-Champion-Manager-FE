import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ClubNews } from '../../types';
import { getFacepackUrl } from '../../utils/formatters';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  FileText,
  CheckCircle2,
  List,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from '../../i18n';

interface ClubNewsModalProps {
  isOpen: boolean;
  newsList: ClubNews[];
  onClose: () => void;
}

export const ClubNewsModal: React.FC<ClubNewsModalProps> = ({
  isOpen,
  newsList = [],
  onClose,
}) => {
  const { t, language } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'list'>('content');

  if (!isOpen) return null;

  const total = newsList.length;
  const currentNews = total > 0 ? newsList[Math.min(activeIndex, total - 1)] : null;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < total - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setActiveIndex((prev) => prev - 1);
      setActiveTab('content');
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setActiveIndex((prev) => prev + 1);
      setActiveTab('content');
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const lowerTitle = (currentNews?.title || '').toLowerCase();
  const isLoan = lowerTitle.includes('mượn') || lowerTitle.includes('loan');
  const isTransfer =
    currentNews?.news_type === 'TRANSFER' ||
    lowerTitle.includes('chuyển nhượng') ||
    lowerTitle.includes('transfer') ||
    lowerTitle.includes('chiêu mộ') ||
    lowerTitle.includes('sign') ||
    lowerTitle.includes('tân binh');

  const modalNode = (
    <div className="player-modal-overlay" onClick={onClose}>
      <div
        className="player-modal-dialog"
        style={{ maxWidth: '1080px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar - Đồng bộ 100% với PlayerDetailModal & StaffDetailModal */}
        <div className="pm-topbar">
          <div className="pm-topbar-left">
            <button
              type="button"
              className="pm-nav-btn"
              disabled={!hasPrev || total <= 1}
              onClick={handlePrev}
              title={t('club_news.prev_tooltip', 'Thông báo trước')}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="pm-nav-btn"
              disabled={!hasNext || total <= 1}
              onClick={handleNext}
              title={t('club_news.next_tooltip', 'Thông báo tiếp theo')}
            >
              <ChevronRight size={20} />
            </button>

            <h2 className="pm-player-title">
              {currentNews ? currentNews.title : t('club_news.modal_title', 'Thông Báo Câu Lạc Bộ')}
            </h2>

            {currentNews && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: isLoan ? '#fef3c7' : isTransfer ? '#ecfdf5' : '#eff6ff',
                  border: `1.5px solid ${isLoan ? '#fde68a' : isTransfer ? '#86efac' : '#bfdbfe'}`,
                  color: isLoan ? '#b45309' : isTransfer ? '#047857' : '#1d4ed8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isLoan
                  ? t('club_news.badge_loan', '🤝 Cho Mượn')
                  : isTransfer
                  ? t('club_news.badge_transfer', '🔄 Chuyển Nhượng')
                  : t('club_news.badge_contract', '📋 Hợp Đồng')}
              </span>
            )}

            {total > 1 && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                ({activeIndex + 1} / {total})
              </span>
            )}
          </div>

          <button
            type="button"
            className="pm-close-btn"
            onClick={onClose}
            title={t('common.close', 'Đóng')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Header Card - Đồng bộ cấu trúc chuẩn pm-header-card */}
        <div className="pm-header-card">
          {/* Avatar Container */}
          <div className="pm-avatar-container">
            <div className="pm-avatar-box">
              {currentNews?.thumbnail_url ? (
                <img
                  src={getFacepackUrl(currentNews.thumbnail_url)}
                  alt=""
                  className="pm-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="pm-avatar-placeholder" style={{ fontSize: '38px' }}>
                  {isLoan ? '🤝' : isTransfer ? '⚽' : '📰'}
                </div>
              )}
            </div>
            {/* Jersey / Category Badge */}
            <div className="pm-jersey-badge" title={t('club_news.category_tooltip', 'Tin câu lạc bộ')}>
              <span className="pm-jersey-num">
                {isLoan
                  ? t('club_news.abbr_loan', 'M')
                  : isTransfer
                  ? t('club_news.abbr_transfer', 'CN')
                  : t('club_news.abbr_contract', 'HĐ')}
              </span>
            </div>
          </div>

          {/* Column 1: Core Details */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">{t('club_news.col_category', 'Chuyên mục:')}</span>
              <span className="pm-value pm-val-bold" style={{ color: '#16a34a' }}>
                {currentNews
                  ? isLoan
                    ? t('club_news.category_loan', 'Hợp đồng cho mượn cầu thủ')
                    : isTransfer
                    ? t('club_news.category_transfer', 'Thương vụ chuyển nhượng')
                    : t('club_news.category_contract', 'Thông báo hợp đồng')
                  : t('club_news.category_general', 'Tin tức & Thông báo')}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('club_news.col_time', 'Thời gian:')}</span>
              <span className="pm-value pm-val-bold">
                {currentNews ? formatDate(currentNews.published_at) : t('club_news.time_today', 'Hôm nay')}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('club_news.col_season', 'Mùa giải:')}</span>
              <span className="pm-value">
                {currentNews
                  ? t('club_news.season_val', { season: currentNews.season_id || 1 })
                  : t('club_news.season_current', 'Mùa hiện tại')}
              </span>
            </div>
          </div>

          {/* Column 2: Status & Verification */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">{t('club_news.col_verification', 'Xác thực:')}</span>
              <span
                className="pm-value pm-val-bold"
                style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                <span>{t('club_news.verified_val', 'Ban Tổ Chức & CLB')}</span>
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('club_news.col_status', 'Tình trạng:')}</span>
              <span className="pm-value pm-val-bold" style={{ color: '#0f172a' }}>
                {currentNews
                  ? t('club_news.status_published', 'Đã công bố & lưu hồ sơ')
                  : t('club_news.status_ready', 'Sẵn sàng')}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('club_news.col_inbox', 'Hộp thư:')}</span>
              <span className="pm-value pm-val-bold" style={{ color: '#334155' }}>
                {t('club_news.total_alerts', { total })}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Bar - Đồng bộ thanh Tab chuẩn của Player/Staff Modal */}
        <div className="pm-tabs-bar">
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <FileText size={15} />
            <span>{t('club_news.tab_detail', 'Nội Dung Chi Tiết')}</span>
          </button>
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <List size={15} />
            <span>{t('club_news.tab_all', { total })}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        {activeTab === 'content' ? (
          <div className="pm-body">
            {currentNews ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    padding: '20px 24px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    lineHeight: '1.8',
                    color: '#1e293b',
                    fontWeight: 500,
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                    {currentNews.content || currentNews.title}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    color: '#166534',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>
                    {t(
                      'club_news.official_notice',
                      'Thông báo chính thức đã được xác nhận vào hồ sơ giải đấu và cơ sở dữ liệu đội hình của câu lạc bộ.'
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '56px 16px', textAlign: 'center', color: '#64748b' }}>
                <Bell size={48} style={{ margin: '0 auto 14px auto', color: '#94a3b8' }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                  {t('club_news.no_news_title', 'Chưa có thông báo mới nào')}
                </p>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {t(
                    'club_news.no_news_desc',
                    'Mọi sự kiện chuyển nhượng, mượn cầu thủ và cập nhật hợp đồng của đội bóng sẽ được gửi về đây.'
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="pm-body" style={{ padding: 0 }}>
            {newsList.length === 0 ? (
              <div style={{ padding: '56px 16px', textAlign: 'center', color: '#64748b' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>
                  {t('club_news.empty_list', 'Chưa có thông báo nào trong danh sách.')}
                </p>
              </div>
            ) : (
              <table className="table-hud" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '55px', textAlign: 'center' }}>{t('club_news.th_no', 'STT')}</th>
                    <th style={{ width: '140px' }}>{t('club_news.th_category', 'Phân Loại')}</th>
                    <th>{t('club_news.th_title', 'Tiêu Đề Bản Tin')}</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>{t('club_news.th_time', 'Thời Gian')}</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>{t('club_news.th_action', 'Thao Tác')}</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.map((item, idx) => {
                    const itemLower = (item.title || '').toLowerCase();
                    const isItemLoan = itemLower.includes('mượn') || itemLower.includes('loan');
                    const isItemTransfer =
                      item.news_type === 'TRANSFER' ||
                      itemLower.includes('chuyển nhượng') ||
                      itemLower.includes('transfer') ||
                      itemLower.includes('chiêu mộ') ||
                      itemLower.includes('sign') ||
                      itemLower.includes('tân binh');
                    const isSelected = idx === activeIndex;

                    return (
                      <tr
                        key={item.id}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? '#f0fdf4' : undefined,
                        }}
                        onClick={() => {
                          setActiveIndex(idx);
                          setActiveTab('content');
                        }}
                      >
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: isSelected ? 700 : undefined }}>
                          {idx + 1}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: isItemLoan ? '#fef3c7' : isItemTransfer ? '#ecfdf5' : '#eff6ff',
                              color: isItemLoan ? '#b45309' : isItemTransfer ? '#047857' : '#1d4ed8',
                            }}
                          >
                            {isItemLoan
                              ? t('club_news.table_badge_loan', 'Cho Mượn')
                              : isItemTransfer
                              ? t('club_news.table_badge_transfer', 'Chuyển Nhượng')
                              : t('club_news.table_badge_contract', 'Hợp Đồng')}
                          </span>
                        </td>
                        <td style={{ color: '#0f172a', fontWeight: isSelected ? 700 : 500 }}>
                          {item.title}
                        </td>
                        <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                          {formatDate(item.published_at)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#16a34a',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveIndex(idx);
                              setActiveTab('content');
                            }}
                          >
                            <span>{t('club_news.btn_view', 'Xem')}</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
