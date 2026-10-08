import { useTranslation } from '../i18n';
import React, { useState, useEffect } from 'react';
import { Club, StarterCountry, StarterTier, User } from '../types';
import { clubsApi } from '../services/clubs.service';
import {
  Globe,
  Trophy,
  Dices,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Users,
  Coins,
  DollarSign,
  LogOut,
  Sparkles,
  ShieldCheck,
  Award,
  Flame,
} from 'lucide-react';

interface Props {
  user: User | null;
  onClubClaimed: (club: Club) => void;
  onLogout: () => void;
}

export const ClubOnboardingScreen: React.FC<Props> = ({
  user,
  onClubClaimed,
  onLogout,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [countries, setCountries] = useState<StarterCountry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState<StarterCountry | null>(null);
  const [tiers, setTiers] = useState<StarterTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimedClub, setClaimedClub] = useState<Club | null>(null);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async (search?: string) => {
    setLoadingCountries(true);
    try {
      const data = await clubsApi.getStarterCountries(search);
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load starter countries:', err);
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCountry = async (country: StarterCountry) => {
    setSelectedCountry(country);
    setSelectedTier(null);
    setStep(2);
    setLoadingTiers(true);
    try {
      const tierData = await clubsApi.getStarterTiers(country.id);
      setTiers(Array.isArray(tierData) ? tierData : []);
      if (tierData.length > 0) {
        setSelectedTier(tierData[0].tier);
      }
    } catch (err) {
      console.error('Failed to load starter tiers:', err);
    } finally {
      setLoadingTiers(false);
    }
  };

  const handleStartClaim = async () => {
    if (!selectedCountry || !selectedTier) return;
    setClaiming(true);
    setClaimError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const result = await clubsApi.claimRandomStarterClub(selectedCountry.id, selectedTier);
      if (result && result.club) {
        setClaimedClub(result.club);
      } else {
        throw new Error(t('onboarding.no_club_info', 'Không nhận được thông tin CLB'));
      }
    } catch (err: any) {
      setClaimError(
        err?.response?.data?.message || t('onboarding.draw_error', 'Có lỗi xảy ra khi bốc thăm CLB. Vui lòng thử lại.')
      );
    } finally {
      setClaiming(false);
    }
  };

  const getTierMeta = (tierNum: number) => {
    switch (tierNum) {
      case 3:
        return {
          title: t('onboarding.tier2_title', 'Giải Hạng Nhì (Tier 3)'),
          badge: t('onboarding.tier2_badge', 'Thử Thách Nâng Cao'),
          badgeColor: '#00e5ff',
          desc: t('onboarding.tier2_desc', 'Các câu lạc bộ có truyền thống, đội hình khá dày dặn, cơ sở vật chất ổn định. Mục tiêu cạnh tranh suất lên hạng Nhất!'),
          stars: '⭐⭐⭐',
        };
      case 4:
        return {
          title: t('onboarding.tier3_title', 'Giải Hạng Ba (Tier 4)'),
          badge: t('onboarding.tier3_badge', 'Thử Thách Tiêu Chuẩn'),
          badgeColor: '#00ff87',
          desc: t('onboarding.tier3_desc', 'Môi trường cân bằng cho các HLV xây dựng lối chơi từ cơ bản, tìm kiếm nhân tài và bứt phá tiềm năng.'),
          stars: '⭐⭐',
        };

      default:
        return {
          title: t('onboarding.tier_generic_title', 'Giải Hạng {tier}').replace('{tier}', String(tierNum)),
          badge: t('onboarding.tier_generic_badge', 'Khởi Nghiệp'),
          badgeColor: '#00e5ff',
          desc: t('onboarding.tier_generic_desc', 'Câu lạc bộ giàu tiềm năng đang chờ đón bạn dẫn dắt.'),
          stars: '⭐',
        };
    }
  };

  return (
    <div className="onboarding-arena-page">
      <div className="stadium-spotlight left" />
      <div className="stadium-spotlight right" />
      <div className="hud-grid-overlay" />

      {/* Top Bar HUD */}
      <header className="onboarding-topbar-hud">
        <div className="onboarding-brand-hud">
          <span className="brand-icon-hex">⚽</span>
          <div>
            <h2>FOOTBALL CHAMPION MANAGER</h2>
            <p>{t('onboarding.career_profile')}</p>
          </div>
        </div>

        <div className="onboarding-user-hud">
          <div className="user-greeting-pill">
            <span className="dot-online" />
            <span>{t('onboarding.manager_label', 'HLV')}: <strong>{user?.username || t('onboarding.default_manager', 'TÂN HLV')}</strong></span>
          </div>
          <button className="btn-logout-hud" onClick={onLogout} title={t('onboarding.logout_tooltip', 'Đăng xuất')}>
            <LogOut size={16} />
            <span>{t('onboarding.switch_account')}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="onboarding-content-hud">
        {/* Step Stepper Header */}
        <div className="onboarding-stepper-hud">
          <div className={`stepper-node-hud ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="stepper-circle-hud">
              {step > 1 ? <CheckCircle2 size={20} /> : <Globe size={20} />}
            </div>
            <div className="stepper-label-hud">
              <span>{t('onboarding.step_1', 'BƯỚC 1')}</span>
              <strong>{t('onboarding.step_1_title', 'CHỌN QUỐC GIA')}</strong>
            </div>
          </div>

          <div className={`stepper-line-hud ${step >= 2 ? 'active' : ''}`} />

          <div className={`stepper-node-hud ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="stepper-circle-hud">
              {step > 2 ? <CheckCircle2 size={20} /> : <Trophy size={20} />}
            </div>
            <div className="stepper-label-hud">
              <span>{t('onboarding.step_2', 'BƯỚC 2')}</span>
              <strong>{t('onboarding.step_2_title', 'CHỌN HẠNG ĐẤU')}</strong>
            </div>
          </div>

          <div className={`stepper-line-hud ${step >= 3 ? 'active' : ''}`} />

          <div className={`stepper-node-hud ${step === 3 ? 'active' : ''}`}>
            <div className="stepper-circle-hud">
              <Dices size={20} />
            </div>
            <div className="stepper-label-hud">
              <span>{t('onboarding.step_3', 'BƯỚC 3')}</span>
              <strong>{t('onboarding.step_3_title', 'BỐC THĂM NHẬN CLB')}</strong>
            </div>
          </div>
        </div>

        {/* STEP 1: CHỌN QUỐC GIA */}
        {step === 1 && (
          <div className="onboarding-card-hud">
            <div className="step-header-hud">
              <div className="step-badge">
                <Flame size={14} className="text-amber" />
                <span>{t('onboarding.fifa_members', 'LIÊN ĐOÀN THÀNH VIÊN FIFA')}</span>
              </div>
              <h3>{t('onboarding.step_1_heading')}</h3>
              <p>
                {t('onboarding.step_1_desc')}
              </p>

              <div className="country-search-bar-hud">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder={t('onboarding.search_country_placeholder', 'Tìm nhanh quốc gia (ví dụ: Vietnam, England, Spain, Brazil, Japan...)')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {loadingCountries ? (
              <div className="loading-state-hud">
                <div className="spinner-hud" />
                <p>{t('onboarding.loading_countries', 'Đang tải dữ liệu 96 Liên đoàn Quốc gia và các CLB khả dụng...')}</p>
              </div>
            ) : (
              <>
                <div className="countries-grid-hud">
                  {filteredCountries.slice(0, 48).map((c) => {
                    const isSelected = selectedCountry?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`country-card-hud ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCountry(c)}
                      >
                        <div className="country-card-top">
                          <span className="country-flag-icon">{c.flag_url ? <img src={c.flag_url} alt={c.name} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} /> : '🏳️'}</span>
                          <span className="country-code-pill">{c.code}</span>
                        </div>
                        <h4 className="country-name-hud">{c.name}</h4>
                        <div className="country-stats-hud">
                          <span className="unclaimed-tag">
                            {c.unclaimed_clubs} {t('onboarding.vacant_clubs')}
                          </span>
                        </div>
                        {isSelected && <div className="card-selected-glow" />}
                      </div>
                    );
                  })}
                </div>

                {filteredCountries.length === 0 && (
                  <div className="empty-search-state-hud">
                    <p>{t('onboarding.no_country_found', 'Không tìm thấy Quốc gia nào khớp với')} "{searchQuery}"</p>
                  </div>
                )}

                <div className="onboarding-actions-hud">
                  <div className="selected-summary-hud">
                    {selectedCountry ? (
                      <span>
                        {t('onboarding.selected', 'Đã chọn')}: <strong className="text-cyan">{selectedCountry.name} ({selectedCountry.code})</strong>
                      </span>
                    ) : (
                      <span className="hint-text">{t('onboarding.please_select_country', 'Vui lòng nhấp chọn 1 Quốc gia ở trên')}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-next-step-hud"
                    disabled={!selectedCountry}
                    onClick={() => {
                      if (selectedCountry) handleSelectCountry(selectedCountry);
                    }}
                  >
                    <span>{t('onboarding.continue_tier', 'TIẾP TỤC CHỌN HẠNG ĐẤU')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: CHỌN HẠNG ĐẤU */}
        {step === 2 && (
          <div className="onboarding-card-hud">
            <div className="step-header-hud">
              <div className="selected-country-banner-hud">
                <span>{t('onboarding.selected_country_label', 'Quốc gia đã chọn:')}</span>
                <strong className="text-cyan">{selectedCountry?.name} ({selectedCountry?.code})</strong>
                <button
                  type="button"
                  className="btn-change-country-hud"
                  onClick={() => setStep(1)}
                >
                  {t('onboarding.change_country', 'Đổi Quốc Gia')}
                </button>
              </div>
              <h3>{t('onboarding.step_2_heading')}</h3>
              <p>
                {t('onboarding.fair_rule', 'Quy chuẩn công bằng: HLV mới được cấp quyền khởi nghiệp tại Tier 3 (Giải Hạng Nhì) hoặc Tier 4 (Giải Hạng Ba).')}
              </p>
            </div>

            {loadingTiers ? (
              <div className="loading-state-hud">
                <div className="spinner-hud" />
                <p>{t('onboarding.checking_tiers', 'Đang kiểm tra các Hạng đấu tại')} {selectedCountry?.name}...</p>
              </div>
            ) : (
              <div className="tiers-list-hud">
                {[3, 4].map((tNum) => {
                  const meta = getTierMeta(tNum);
                  const isSelected = selectedTier === tNum;
                  const tierDb = tiers.find((item) => item.tier === tNum);
                  const count = tierDb ? tierDb.unclaimed_count : 16;

                  return (
                    <div
                      key={tNum}
                      className={`tier-card-hud ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTier(tNum)}
                    >
                      <div className="tier-card-left-hud">
                        <div className="tier-badge-row">
                          <span className="tier-badge-pill" style={{ color: meta.badgeColor, borderColor: meta.badgeColor }}>
                            {meta.badge}
                          </span>
                          <span className="tier-stars">{meta.stars}</span>
                        </div>
                        <h4>{meta.title}</h4>
                        <p>{meta.desc}</p>
                        <div className="starter-perks-row">
                          <div className="perk-item">
                            <DollarSign size={14} className="text-emerald" />
                            <span>{t('onboarding.initial_cash')}</span>
                          </div>
                          <div className="perk-item">
                            <Coins size={14} className="text-amber" />
                            <span>{t('onboarding.initial_gold')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="tier-card-right-hud">
                        <div className="unclaimed-badge-hud">
                          <strong>{count}</strong>
                          <span>{t('onboarding.vacant_clubs_label', 'CLB CÒN TRỐNG')}</span>
                        </div>
                        <div className="tier-radio-hud">
                          <div className={`radio-circle-hud ${isSelected ? 'checked' : ''}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="onboarding-actions-hud">
              <button
                type="button"
                className="btn-prev-step-hud"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={18} />
                <span>{t('onboarding.back_step_1', 'Quay Lại Bước 1')}</span>
              </button>

              <button
                type="button"
                className="btn-next-step-hud"
                disabled={!selectedTier}
                onClick={() => setStep(3)}
              >
                <span>{t('onboarding.continue_step_3', 'TIẾP TỤC SANG BƯỚC BỐC THĂM')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BỐC THĂM & NHẬN CLB */}
        {step === 3 && (
          <div className="onboarding-card-hud">
            {!claimedClub ? (
              <div className="claim-prompt-card-hud">
                <div className="claim-icon-wrapper-hud">
                  <Dices size={56} className={claiming ? 'spin-dice-hud' : 'text-cyan'} />
                </div>
                <h3>{t('onboarding.step_3_heading')}</h3>
                <p className="claim-desc-hud">
                  {t('onboarding.selected_summary', 'HLV đã chọn khởi nghiệp tại {country} ở {tier}.').replace('{country}', selectedCountry?.name || '').replace('{tier}', getTierMeta(selectedTier || 3).title)}
                  <br />
                  {t('onboarding.step_3_desc')}
                </p>

                {claimError && (
                  <div className="claim-error-banner-hud">
                    <p>{claimError}</p>
                  </div>
                )}

                <div className="claim-summary-box-hud">
                  <div className="summary-item-hud">
                    <span>{t('onboarding.country_field', 'QUỐC GIA:')}</span>
                    <strong className="text-cyan">{selectedCountry?.name} ({selectedCountry?.code})</strong>
                  </div>
                  <div className="summary-item-hud">
                    <span>{t('onboarding.tier_field', 'HẠNG ĐẤU:')}</span>
                    <strong className="text-emerald">Tier {selectedTier} - {getTierMeta(selectedTier || 3).title}</strong>
                  </div>
                  <div className="summary-item-hud">
                    <span>{t('onboarding.rules_field', 'QUY CHUẨN:')}</span>
                    <strong className="text-amber">{t('onboarding.rules_random', 'Bốc thăm ngẫu nhiên CLB trống')}</strong>
                  </div>
                </div>

                <div className="claim-action-buttons-hud">
                  <button
                    type="button"
                    className="btn-prev-step-hud"
                    disabled={claiming}
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={18} />
                    <span>{t('onboarding.change_tier', 'Đổi Hạng Đấu')}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-claim-random-hud"
                    disabled={claiming}
                    onClick={handleStartClaim}
                  >
                    {claiming ? (
                      <>
                        <div className="spinner-hud" />
                        <span>{t('onboarding.drawing')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>{t('onboarding.draw_and_sign')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* CLAIM CELEBRATION REVEAL */
              <div className="claim-reveal-card-hud">
                <div className="reveal-badge-hud">
                  <Award size={20} />
                  <span>{t('onboarding.contract_success', 'KÝ KẾT HỢP ĐỒNG THÀNH CÔNG')}</span>
                </div>

                <h2 className="reveal-title-hud">{t('onboarding.congrats_title')}</h2>
                <p className="reveal-subtitle-hud">
                  {t('onboarding.congrats_desc')}
                </p>

                <div className="revealed-club-box-hud">
                  <div className="club-logo-hex">⚽</div>
                  <div className="club-identity-hud">
                    <h3>{claimedClub.name}</h3>
                    <div className="club-tags-hud">
                      <span className="tag-item-hud">{t('onboarding.tag_country', 'Quốc gia:')} {claimedClub.country || selectedCountry?.name}</span>
                      {claimedClub.city && <span className="tag-item-hud">{t('onboarding.tag_city', 'Thành phố:')} {claimedClub.city}</span>}
                      <span className="tag-item-hud">{t('onboarding.tag_tier', 'Hạng đấu:')} Tier {selectedTier}</span>
                    </div>
                  </div>
                </div>

                <div className="reveal-details-grid-hud">
                  <div className="reveal-detail-item-hud">
                    <Building2 size={22} className="text-cyan" />
                    <div>
                      <span>{t('onboarding.stadium_label', 'SÂN VẬN ĐỘNG')}</span>
                      <strong>{claimedClub.stadium?.name || t('onboarding.default_stadium', 'Sân Vận Động Trung Tâm')}</strong>
                      <small>{t('onboarding.capacity_label', 'Sức chứa:')} {(claimedClub.stadium?.capacity || 5000).toLocaleString()} {t('onboarding.seats', 'chỗ')}</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item-hud">
                    <Users size={22} className="text-cyan" />
                    <div>
                      <span>{t('onboarding.starting_squad')}</span>
                      <strong>{claimedClub.squadCount || 16} {t('onboarding.ready_players')}</strong>
                      <small>{t('onboarding.pro_contract_signed', 'Đã ký hợp đồng chuyên nghiệp')}</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item-hud">
                    <DollarSign size={22} className="text-emerald" />
                    <div>
                      <span>{t('onboarding.cash_budget_label', 'NGÂN SÁCH TIỀN MẶT')}</span>
                      <strong className="text-emerald">
                        €{(claimedClub.finances?.cash || 1500000).toLocaleString()} CASH
                      </strong>
                      <small>{t('onboarding.cash_budget_desc', 'Dành cho chuyển nhượng & nâng cấp')}</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item-hud">
                    <Coins size={22} className="text-amber" />
                    <div>
                      <span>{t('onboarding.gold_starter_label', 'VÀNG KHỞI NGHIỆP')}</span>
                      <strong className="text-amber">
                        {(claimedClub.finances?.gold || 200).toLocaleString()} GOLD
                      </strong>
                      <small>{t('onboarding.gold_starter_desc', 'Đổi tài nguyên đặc biệt')}</small>
                    </div>
                  </div>
                </div>

                <div className="reveal-action-hud">
                  <button
                    type="button"
                    className="btn-enter-game-hud"
                    onClick={() => onClubClaimed(claimedClub)}
                  >
                    <ShieldCheck size={22} />
                    <span>{t('onboarding.start_career_btn')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
