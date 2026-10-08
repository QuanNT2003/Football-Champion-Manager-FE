import { useTranslation } from '../../i18n';
import React from 'react';
import {
  Coins,
  Shield,
  Award,
  AlertCircle,
  HelpCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Player, PlayerDetailData } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface Props {
  player: Player;
  detail: PlayerDetailData | null;
  currentClubId?: string;
  cashBalance?: number;
  offerSuccess: string;
  offerError: string;
  loadingOffer: boolean;
  existingOffer: any;
  isLoan: boolean;
  setIsLoan: (val: boolean) => void;
  offerAmount: number;
  setOfferAmount: (val: number) => void;
  proposedWage: number;
  setProposedWage: (val: number) => void;
  contractYears: number;
  setContractYears: (val: number) => void;
  offerSubmitting: boolean;
  handleSendOffer: () => void;
  handleOpenCancelConfirm: () => void;
  cancellingOffer: boolean;
}

export const PlayerOfferTab: React.FC<Props> = ({

  player,
  detail,
  currentClubId,
  cashBalance,
  offerSuccess,
  offerError,
  loadingOffer,
  existingOffer,
  isLoan,
  setIsLoan,
  offerAmount,
  setOfferAmount,
  proposedWage,
  setProposedWage,
  contractYears,
  setContractYears,
  offerSubmitting,
  handleSendOffer,
  handleOpenCancelConfirm,
  cancellingOffer,
}) => {
  const { t } = useTranslation();
  return (
                <div style={{ padding: '0.5rem 0.25rem' }}>
                  {/* Alert thông báo kết quả */}
                  {offerSuccess && (
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        marginBottom: '1.25rem',
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        border: '1.5px solid #22c55e',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      <Award size={20} color="#16a34a" />
                      <span>{offerSuccess}</span>
                    </div>
                  )}

                  {offerError && (
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        marginBottom: '1.25rem',
                        borderRadius: '10px',
                        background: '#fef2f2',
                        border: '1.5px solid #ef4444',
                        color: '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      <AlertCircle size={20} color="#dc2626" />
                      <span>{offerError}</span>
                    </div>
                  )}

                  {/* Banner tải đề nghị trước đó */}
                  {loadingOffer && (
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="spinner" style={{ width: 14, height: 14 }} />
                      <span>{t('player_offer.checking_prev', 'Đang kiểm tra lời đề nghị trước đó của bạn cho cầu thủ này...')}</span>
                    </div>
                  )}

                  {existingOffer && (
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        marginBottom: '1.25rem',
                        borderRadius: '10px',
                        border: existingOffer.status === 'PENDING' ? '1.5px solid #f59e0b' : existingOffer.status === 'ACCEPTED' ? '1.5px solid #16a34a' : existingOffer.status === 'REJECTED' ? '1.5px solid #dc2626' : '1.5px solid #94a3b8',
                        background: existingOffer.status === 'PENDING' ? '#fffbeb' : existingOffer.status === 'ACCEPTED' ? '#f0fdf4' : existingOffer.status === 'REJECTED' ? '#fef2f2' : '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.15rem' }}>
                            {existingOffer.status === 'PENDING' ? '⏳' : existingOffer.status === 'ACCEPTED' ? '✅' : existingOffer.status === 'REJECTED' ? '❌' : 'ℹ️'}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: existingOffer.status === 'PENDING' ? '#b45309' : existingOffer.status === 'ACCEPTED' ? '#15803d' : existingOffer.status === 'REJECTED' ? '#b91c1c' : '#475569' }}>
                            {existingOffer.status === 'PENDING' ? t('player_offer.pending_msg', 'Bạn đang có một lời đề nghị chờ phản hồi') : existingOffer.status === 'ACCEPTED' ? t('player_offer.accepted_msg', 'Lời đề nghị của bạn đã được chấp thuận!') : existingOffer.status === 'REJECTED' ? t('player_offer.rejected_msg', 'Lời đề nghị trước đó đã bị từ chối') : t('player_offer.cancelled_msg', 'Lời đề nghị trước đó đã bị hủy')}
                          </strong>
                        </div>
                        <span
                          className={`badge ${
                            existingOffer.status === 'PENDING'
                              ? 'badge-warning'
                              : existingOffer.status === 'ACCEPTED'
                              ? 'badge-success'
                              : existingOffer.status === 'REJECTED'
                              ? 'badge-danger'
                              : 'badge-outline'
                          }`}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', fontWeight: 800 }}
                        >
                          {existingOffer.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.86rem', color: '#1e293b', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.85)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div>{t('player_modal.type_label', 'Hình thức:')} <strong>{existingOffer.is_loan ? t('player_modal.type_loan', 'Cho Mượn') : t('player_modal.type_buy', 'Mua Đứt')}</strong></div>
                        <div>{t('player_offer.offer_fee_label', 'Phí đề nghị:')} <strong style={{ color: '#15803d' }}>{existingOffer.is_loan ? t('player_offer.loan_zero', '€0 (Mượn)') : `€${Number(existingOffer.offer_amount || 0).toLocaleString()}`}</strong></div>
                        <div>{t('player_offer.committed_wage_label', 'Lương cam kết:')} <strong style={{ color: '#d97706' }}>€{Number(existingOffer.proposed_wage || 0).toLocaleString()} {t('player_modal.per_week', '/ tuần')}</strong></div>
                        <div>{t('staff.duration_label', 'Thời hạn:')} <strong>{t('staff.years_count', '{count} năm').replace('{count}', String(existingOffer.contract_years || 3))}</strong></div>
                      </div>

                      {existingOffer.status === 'PENDING' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          <button
                            type="button"
                            disabled={cancellingOffer}
                            onClick={handleOpenCancelConfirm}
                            className="btn btn-xs btn-danger flex-center"
                            style={{ gap: '0.35rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
                          >
                            {cancellingOffer ? t('player_offer.cancelling', 'Đang hủy...') : t('player_offer.cancel_btn', '✕ HỦY ĐỀ NGHỊ NÀY')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {/* PHẦN 1: ĐỀ NGHỊ CHO CLB */}
                    <div
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {t('player_offer.to_club_section', 'Đề Nghị Cho CLB Chủ Quản')}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          {t('player_offer.to_club_desc', 'Thỏa thuận hình thức chuyển giao và mức phí chuyển nhượng')}
                        </div>
                      </div>

                      {/* Loại chuyển nhượng: Mua đứt / Mượn */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                          {t('player_offer.method_label', 'Hình thức chuyển nhượng:')}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setIsLoan(false)}
                            style={{
                              padding: '0.65rem 1rem',
                              borderRadius: '8px',
                              border: !isLoan ? '2px solid #16a34a' : '1px solid #cbd5e1',
                              background: !isLoan ? '#f0fdf4' : '#ffffff',
                              color: !isLoan ? '#15803d' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.2s',
                            }}
                          >
                            {t('player_offer.method_buy', '🔵 Mua Đứt (Permanent)')}
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsLoan(true)}
                            style={{
                              padding: '0.65rem 1rem',
                              borderRadius: '8px',
                              border: isLoan ? '2px solid #eab308' : '1px solid #cbd5e1',
                              background: isLoan ? '#fefce8' : '#ffffff',
                              color: isLoan ? '#854d0e' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.2s',
                            }}
                          >
                            {t('player_offer.method_loan', '🟡 Mượn Cầu Thủ (Loan)')}
                          </button>
                        </div>
                      </div>

                      {/* Nếu là MUA ĐỨT: Hiển thị ô nhập giá chuyển nhượng */}
                      {!isLoan ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                              {t('player_offer.fee_label', 'Phí chuyển nhượng đề nghị (€):')}
                            </label>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {t('player_offer.valuation_label', 'Định giá:')} <strong>€{Number((player as any).asking_price || player.market_value || 2500000).toLocaleString()}</strong>
                            </span>
                          </div>

                          <div style={{ position: 'relative' }}>
                            <input
                              type="number"
                              min={0}
                              step={100000}
                              value={offerAmount || ''}
                              onChange={(e) => setOfferAmount(Math.max(0, Number(e.target.value)))}
                              className="input-text"
                              style={{
                                width: '100%',
                                padding: '0.65rem 1rem',
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                color: '#15803d',
                              }}
                            />
                            <span style={{ position: 'absolute', right: 12, top: 10, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
                              €{(offerAmount / 1000000).toFixed(2)}M
                            </span>
                          </div>

                          {/* Quick Adjust Buttons */}
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(Number((player as any).asking_price || player.market_value || 2500000))}
                            >
                              {t('player_offer.market_price_btn', 'Theo giá thị trường')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(Math.max(0, offerAmount - 500000))}
                            >
                              -€500K
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 500000)}
                            >
                              +€500K
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 1000000)}
                            >
                              +€1.0M
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 5000000)}
                            >
                              +€5.0M
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Nếu là MƯỢN: KHÔNG CÓ Ô NHẬP GIÁ */
                        <div
                          style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: '#fefce8',
                            border: '1px dashed #ca8a04',
                            color: '#713f12',
                            fontSize: '0.84rem',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong>{t('player_offer.loan_free_notice', 'ℹ️ Mượn cầu thủ không mất phí chuyển nhượng:')}</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#854d0e' }}>
                            {t('player_offer.loan_free_desc', 'CLB chủ quản đồng ý cho mượn mà không thu phí chuyển nhượng. Bạn chỉ cần thỏa thuận thời hạn mượn và chi trả lương cầu thủ ở Phần 2.')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* PHẦN 2: THỎA THUẬN HỢP ĐỒNG CẦU THỦ */}
                    <div
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {t('player_offer.contract_section', 'Thỏa Thuận Hợp Đồng Cầu Thủ')}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          {t('player_offer.contract_desc', 'Điều khoản đãi ngộ và cam kết thời gian gắn bó với CLB')}
                        </div>
                      </div>

                      {/* Thời gian hợp đồng */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                          {t('player_offer.duration_label', 'Thời gian hợp đồng:')}
                        </label>
                        {!isLoan ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
                            {[1, 2, 3, 4, 5].map((yr) => (
                              <button
                                key={yr}
                                type="button"
                                onClick={() => setContractYears(yr)}
                                style={{
                                  padding: '0.55rem 0.2rem',
                                  borderRadius: '6px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: contractYears === yr ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                  background: contractYears === yr ? '#dcfce7' : '#ffffff',
                                  color: contractYears === yr ? '#15803d' : '#475569',
                                  transition: 'all 0.15s',
                                  textAlign: 'center',
                                }}
                              >
                                {t('staff.year_n', '{n} Năm').replace('{n}', String(yr))}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => setContractYears(1)}
                              style={{
                                padding: '0.55rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: contractYears === 1 ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                                background: contractYears === 1 ? '#fef9c3' : '#ffffff',
                                color: contractYears === 1 ? '#854d0e' : '#475569',
                                transition: 'all 0.15s',
                                textAlign: 'center',
                              }}
                            >
                              {t('player_offer.duration_half_season', 'Nửa Mùa (20 ngày)')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setContractYears(2)}
                              style={{
                                padding: '0.55rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: contractYears === 2 ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                                background: contractYears === 2 ? '#fef9c3' : '#ffffff',
                                color: contractYears === 2 ? '#854d0e' : '#475569',
                                transition: 'all 0.15s',
                                textAlign: 'center',
                              }}
                            >
                              {t('player_offer.duration_full_season', 'Cả Mùa Giải (40 ngày)')}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lương cầu thủ */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                            {t('player_offer.wage_label', 'Mức lương đề nghị (€/tuần):')}
                          </label>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {t('player_offer.suggested_wage', 'Lương đề xuất:')} <strong>€{Math.round(Number((player as any).asking_price || player.market_value || 2500000) * 0.005).toLocaleString()}</strong>
                          </span>
                        </div>

                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={proposedWage || ''}
                            onChange={(e) => setProposedWage(Math.max(0, Number(e.target.value)))}
                            className="input-text"
                            style={{
                              width: '100%',
                              padding: '0.65rem 1rem',
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: '#d97706',
                            }}
                          />
                          <span style={{ position: 'absolute', right: 12, top: 10, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
                            {t('player_modal.per_week', '/ tuần')}
                          </span>
                        </div>

                        {/* Nút chỉnh lương nhanh */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(Math.round(Number((player as any).asking_price || player.market_value || 2500000) * 0.005))}
                          >
                            {t('player_offer.standard_wage_btn', 'Lương chuẩn')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(Math.max(500, proposedWage - 1000))}
                          >
                            -€1,000
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(proposedWage + 1000)}
                          >
                            +€1,000
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(proposedWage + 5000)}
                          >
                            +€5,000
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TỔNG KẾT & XÁC NHẬN GỬI ĐI */}
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1.25rem 1.5rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('player_offer.summary_cost', 'Tóm tắt chi phí giao dịch:')}</div>
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '4px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{t('bids.fee', 'Phí chuyển nhượng:')} </span>
                          <strong style={{ fontSize: '0.95rem', color: isLoan ? '#854d0e' : '#15803d' }}>
                            {isLoan ? t('player_offer.loan_zero', '€0 (Mượn)') : `€${offerAmount.toLocaleString()}`}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{t('player_offer.committed_wage_label', 'Lương cam kết:')} </span>
                          <strong style={{ fontSize: '0.95rem', color: '#d97706' }}>
                            €{proposedWage.toLocaleString()} {t('player_modal.per_week', '/ tuần')}
                          </strong>
                        </div>
                        {cashBalance !== undefined && (
                          <div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{t('player_offer.budget_label', 'Ngân sách CLB:')} </span>
                            <strong style={{ fontSize: '0.95rem', color: cashBalance >= (isLoan ? 0 : offerAmount) ? '#16a34a' : '#dc2626' }}>
                              €{cashBalance.toLocaleString()}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cảnh báo không đủ ngân sách */}
                    {!isLoan && cashBalance !== undefined && offerAmount > cashBalance && (
                      <div
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          marginBottom: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#b91c1c',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                        }}
                      >
                        <AlertCircle size={16} color="#dc2626" />
                        <span>
                          {t('player_offer.budget_error', 'Ngân sách CLB (€{cash}) không đủ để trả phí chuyển nhượng (€{fee})! Vui lòng giảm mức giá đề nghị hoặc chọn hình thức mượn.').replace('{cash}', cashBalance.toLocaleString()).replace('{fee}', offerAmount.toLocaleString())}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={offerSubmitting}
                      onClick={handleSendOffer}
                      className="btn btn-primary"
                      style={{
                        padding: '0.75rem 1.75rem',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      {offerSubmitting ? (
                        <>
                          <div className="spinner" style={{ width: 16, height: 16 }} />
                          <span>{t('player_offer.sending', 'Đang gửi đề nghị...')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>{t('player_offer.confirm_send_btn', 'Xác Nhận Gửi Lời Đề Nghị')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
  );
};
