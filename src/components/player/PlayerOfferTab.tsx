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
  return (
                <div style={{ padding: '0.5rem 0.25rem' }}>
                  {/* Alert th├┤ng b├ío kß║┐t quß║ú */}
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

                  {/* Banner tß║úi ─æß╗ü nghß╗ï tr╞░ß╗¢c ─æ├│ */}
                  {loadingOffer && (
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="spinner" style={{ width: 14, height: 14 }} />
                      <span>─Éang kiß╗âm tra lß╗¥i ─æß╗ü nghß╗ï tr╞░ß╗¢c ─æ├│ cß╗ºa bß║ín cho cß║ºu thß╗º n├áy...</span>
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
                            {existingOffer.status === 'PENDING' ? 'ΓÅ│' : existingOffer.status === 'ACCEPTED' ? 'Γ£à' : existingOffer.status === 'REJECTED' ? 'Γ¥î' : 'Γä╣∩╕Å'}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: existingOffer.status === 'PENDING' ? '#b45309' : existingOffer.status === 'ACCEPTED' ? '#15803d' : existingOffer.status === 'REJECTED' ? '#b91c1c' : '#475569' }}>
                            {existingOffer.status === 'PENDING' ? 'Bß║ín ─æang c├│ mß╗Öt lß╗¥i ─æß╗ü nghß╗ï chß╗¥ phß║ún hß╗ôi' : existingOffer.status === 'ACCEPTED' ? 'Lß╗¥i ─æß╗ü nghß╗ï cß╗ºa bß║ín ─æ├ú ─æ╞░ß╗úc chß║Ñp thuß║¡n!' : existingOffer.status === 'REJECTED' ? 'Lß╗¥i ─æß╗ü nghß╗ï tr╞░ß╗¢c ─æ├│ ─æ├ú bß╗ï tß╗½ chß╗æi' : 'Lß╗¥i ─æß╗ü nghß╗ï tr╞░ß╗¢c ─æ├│ ─æ├ú bß╗ï hß╗ºy'}
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
                        <div>H├¼nh thß╗⌐c: <strong>{existingOffer.is_loan ? 'Cho M╞░ß╗ún' : 'Mua ─Éß╗⌐t'}</strong></div>
                        <div>Ph├¡ ─æß╗ü nghß╗ï: <strong style={{ color: '#15803d' }}>{existingOffer.is_loan ? 'Γé¼0 (M╞░ß╗ún)' : `Γé¼${Number(existingOffer.offer_amount || 0).toLocaleString()}`}</strong></div>
                        <div>L╞░╞íng cam kß║┐t: <strong style={{ color: '#d97706' }}>Γé¼{Number(existingOffer.proposed_wage || 0).toLocaleString()} / tuß║ºn</strong></div>
                        <div>Thß╗¥i hß║ín: <strong>{existingOffer.contract_years || 3} n─âm</strong></div>
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
                            {cancellingOffer ? '─Éang hß╗ºy...' : 'Γ£ò Hß╗ªY ─Éß╗Ç NGHß╗è N├ÇY'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {/* PHß║ªN 1: ─Éß╗Ç NGHß╗è CHO CLB */}
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
                          ≡ƒÅó Phß║ºn 1: ─Éß╗ü Nghß╗ï Cho CLB Chß╗º Quß║ún
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Thß╗Åa thuß║¡n h├¼nh thß╗⌐c chuyß╗ân giao v├á mß╗⌐c ph├¡ chuyß╗ân nh╞░ß╗úng
                        </div>
                      </div>

                      {/* Loß║íi chuyß╗ân nh╞░ß╗úng: Mua ─æß╗⌐t / M╞░ß╗ún */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                          H├¼nh thß╗⌐c chuyß╗ân nh╞░ß╗úng:
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
                            ≡ƒö╡ Mua ─Éß╗⌐t (Permanent)
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
                            ≡ƒƒí M╞░ß╗ún Cß║ºu Thß╗º (Loan)
                          </button>
                        </div>
                      </div>

                      {/* Nß║┐u l├á MUA ─Éß╗¿T: Hiß╗ân thß╗ï ├┤ nhß║¡p gi├í chuyß╗ân nh╞░ß╗úng */}
                      {!isLoan ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                              Ph├¡ chuyß╗ân nh╞░ß╗úng ─æß╗ü nghß╗ï (Γé¼):
                            </label>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              ─Éß╗ïnh gi├í: <strong>Γé¼{Number((player as any).asking_price || player.market_value || 2500000).toLocaleString()}</strong>
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
                              Γé¼{(offerAmount / 1000000).toFixed(2)}M
                            </span>
                          </div>

                          {/* Quick Adjust Buttons */}
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(Number((player as any).asking_price || player.market_value || 2500000))}
                            >
                              Theo gi├í thß╗ï tr╞░ß╗¥ng
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(Math.max(0, offerAmount - 500000))}
                            >
                              -Γé¼500K
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 500000)}
                            >
                              +Γé¼500K
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 1000000)}
                            >
                              +Γé¼1.0M
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 5000000)}
                            >
                              +Γé¼5.0M
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Nß║┐u l├á M╞»ß╗óN: KH├öNG C├ô ├ö NHß║¼P GI├ü */
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
                          <strong>Γä╣∩╕Å M╞░ß╗ún cß║ºu thß╗º kh├┤ng mß║Ñt ph├¡ chuyß╗ân nh╞░ß╗úng:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#854d0e' }}>
                            CLB chß╗º quß║ún ─æß╗ông ├╜ cho m╞░ß╗ún m├á kh├┤ng thu ph├¡ chuyß╗ân nh╞░ß╗úng. Bß║ín chß╗ë cß║ºn thß╗Åa thuß║¡n thß╗¥i hß║ín m╞░ß╗ún v├á chi trß║ú l╞░╞íng cß║ºu thß╗º ß╗ƒ Phß║ºn 2.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* PHß║ªN 2: THß╗ÄA THUß║¼N Hß╗óP ─Éß╗ÆNG Cß║ªU THß╗ª */}
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
                          Γ£ì∩╕Å Phß║ºn 2: Thß╗Åa Thuß║¡n Hß╗úp ─Éß╗ông Cß║ºu Thß╗º
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          ─Éiß╗üu khoß║ún ─æ├úi ngß╗Ö v├á cam kß║┐t thß╗¥i gian gß║»n b├│ vß╗¢i CLB
                        </div>
                      </div>

                      {/* Thß╗¥i gian hß╗úp ─æß╗ông */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                          Thß╗¥i gian hß╗úp ─æß╗ông:
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
                                {yr} N─âm
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
                              Nß╗¡a M├╣a (20 ng├áy)
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
                              Cß║ú M├╣a Giß║úi (40 ng├áy)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* L╞░╞íng cß║ºu thß╗º */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                            Mß╗⌐c l╞░╞íng ─æß╗ü nghß╗ï (Γé¼/tuß║ºn):
                          </label>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            L╞░╞íng ─æß╗ü xuß║Ñt: <strong>Γé¼{Math.round(Number((player as any).asking_price || player.market_value || 2500000) * 0.005).toLocaleString()}</strong>
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
                            / tuß║ºn
                          </span>
                        </div>

                        {/* N├║t chß╗ënh l╞░╞íng nhanh */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(Math.round(Number((player as any).asking_price || player.market_value || 2500000) * 0.005))}
                          >
                            L╞░╞íng chuß║⌐n
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(Math.max(500, proposedWage - 1000))}
                          >
                            -Γé¼1,000
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(proposedWage + 1000)}
                          >
                            +Γé¼1,000
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(proposedWage + 5000)}
                          >
                            +Γé¼5,000
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tß╗öNG Kß║╛T & X├üC NHß║¼N Gß╗¼I ─ÉI */}
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
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>T├│m tß║»t chi ph├¡ giao dß╗ïch:</div>
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '4px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ph├¡ chuyß╗ân nh╞░ß╗úng: </span>
                          <strong style={{ fontSize: '0.95rem', color: isLoan ? '#854d0e' : '#15803d' }}>
                            {isLoan ? 'Γé¼0 (M╞░ß╗ún)' : `Γé¼${offerAmount.toLocaleString()}`}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>L╞░╞íng cam kß║┐t: </span>
                          <strong style={{ fontSize: '0.95rem', color: '#d97706' }}>
                            Γé¼{proposedWage.toLocaleString()} / tuß║ºn
                          </strong>
                        </div>
                        {cashBalance !== undefined && (
                          <div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ng├ón s├ích CLB: </span>
                            <strong style={{ fontSize: '0.95rem', color: cashBalance >= (isLoan ? 0 : offerAmount) ? '#16a34a' : '#dc2626' }}>
                              Γé¼{cashBalance.toLocaleString()}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cß║únh b├ío kh├┤ng ─æß╗º ng├ón s├ích */}
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
                          Ng├ón s├ích CLB (Γé¼{cashBalance.toLocaleString()}) kh├┤ng ─æß╗º ─æß╗â trß║ú ph├¡ chuyß╗ân nh╞░ß╗úng (Γé¼{offerAmount.toLocaleString()})! Vui l├▓ng giß║úm mß╗⌐c gi├í ─æß╗ü nghß╗ï hoß║╖c chß╗ìn h├¼nh thß╗⌐c m╞░ß╗ún.
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
                          <span>─Éang gß╗¡i ─æß╗ü nghß╗ï...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>X├íc Nhß║¡n Gß╗¡i Lß╗¥i ─Éß╗ü Nghß╗ï</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
  );
};
