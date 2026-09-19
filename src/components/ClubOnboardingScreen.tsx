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
        throw new Error('Không nhận được thông tin CLB');
      }
    } catch (err: any) {
      setClaimError(
        err?.response?.data?.message || 'Có lỗi xảy ra khi bốc thăm CLB. Vui lòng thử lại.'
      );
    } finally {
      setClaiming(false);
    }
  };

  const getTierMeta = (tierNum: number) => {
    switch (tierNum) {
      case 3:
        return {
          title: 'Giải Hạng Nhì (Tier 3)',
          badge: 'Thử Thách Nâng Cao',
          badgeColor: '#00e5ff',
          desc: 'Các câu lạc bộ có truyền thống, đội hình khá dày dặn, cơ sở vật chất ổn định. Mục tiêu cạnh tranh suất lên hạng Nhất!',
          stars: '⭐⭐⭐',
        };
      case 4:
        return {
          title: 'Giải Hạng Ba (Tier 4)',
          badge: 'Thử Thách Tiêu Chuẩn',
          badgeColor: '#00ff87',
          desc: 'Môi trường cân bằng cho các HLV xây dựng lối chơi từ cơ bản, tìm kiếm nhân tài và bứt phá tiềm năng.',
          stars: '⭐⭐',
        };
      case 5:
        return {
          title: 'Giải Hạng Tư (Tier 5)',
          badge: 'Khởi Nghiệp Đích Thực',
          badgeColor: '#ffd700',
          desc: 'Hành trình từ giải đấu nền tảng đi lên. Thể hiện tài thao lược của HLV để kiến tạo đế chế bóng đá từ hai bàn tay trắng.',
          stars: '⭐',
        };
      default:
        return {
          title: `Giải Hạng ${tierNum}`,
          badge: 'Khởi Nghiệp',
          badgeColor: '#00e5ff',
          desc: 'Câu lạc bộ giàu tiềm năng đang chờ đón bạn dẫn dắt.',
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
            <p>HỒ SƠ KHỞI NGHIỆP HUẤN LUYỆN VIÊN TRƯỞNG</p>
          </div>
        </div>

        <div className="onboarding-user-hud">
          <div className="user-greeting-pill">
            <span className="dot-online" />
            <span>HLV: <strong>{user?.username || 'TÂN HLV'}</strong></span>
          </div>
          <button className="btn-logout-hud" onClick={onLogout} title="Đăng xuất">
            <LogOut size={16} />
            <span>Đổi Tài Khoản</span>
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
              <span>BƯỚC 1</span>
              <strong>CHỌN QUỐC GIA</strong>
            </div>
          </div>

          <div className={`stepper-line-hud ${step >= 2 ? 'active' : ''}`} />

          <div className={`stepper-node-hud ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="stepper-circle-hud">
              {step > 2 ? <CheckCircle2 size={20} /> : <Trophy size={20} />}
            </div>
            <div className="stepper-label-hud">
              <span>BƯỚC 2</span>
              <strong>CHỌN HẠNG ĐẤU</strong>
            </div>
          </div>

          <div className={`stepper-line-hud ${step >= 3 ? 'active' : ''}`} />

          <div className={`stepper-node-hud ${step === 3 ? 'active' : ''}`}>
            <div className="stepper-circle-hud">
              <Dices size={20} />
            </div>
            <div className="stepper-label-hud">
              <span>BƯỚC 3</span>
              <strong>BỐC THĂM NHẬN CLB</strong>
            </div>
          </div>
        </div>

        {/* STEP 1: CHỌN QUỐC GIA */}
        {step === 1 && (
          <div className="onboarding-card-hud">
            <div className="step-header-hud">
              <div className="step-badge">
                <Flame size={14} className="text-amber" />
                <span>LIÊN ĐOÀN THÀNH VIÊN FIFA</span>
              </div>
              <h3>BƯỚC 1: LỰA CHỌN QUỐC GIA ĐỂ BẮT ĐẦU SỰ NGHIỆP</h3>
              <p>
                Hệ sinh thái hỗ trợ 112 Liên đoàn bóng đá quốc gia. Bạn sẽ khởi nghiệp tại giải đấu quốc nội của đất nước này.
              </p>

              <div className="country-search-bar-hud">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm nhanh quốc gia (ví dụ: Vietnam, England, Spain, Brazil, Japan...)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {loadingCountries ? (
              <div className="loading-state-hud">
                <div className="spinner-hud" />
                <p>Đang tải dữ liệu 112 Liên đoàn Quốc gia và các CLB khả dụng...</p>
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
                            {c.unclaimed_clubs} CLB TRỐNG
                          </span>
                        </div>
                        {isSelected && <div className="card-selected-glow" />}
                      </div>
                    );
                  })}
                </div>

                {filteredCountries.length === 0 && (
                  <div className="empty-search-state-hud">
                    <p>Không tìm thấy Quốc gia nào khớp với "{searchQuery}"</p>
                  </div>
                )}

                <div className="onboarding-actions-hud">
                  <div className="selected-summary-hud">
                    {selectedCountry ? (
                      <span>
                        Đã chọn: <strong className="text-cyan">{selectedCountry.name} ({selectedCountry.code})</strong>
                      </span>
                    ) : (
                      <span className="hint-text">Vui lòng nhấp chọn 1 Quốc gia ở trên</span>
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
                    <span>TIẾP TỤC CHỌN HẠNG ĐẤU</span>
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
                <span>Quốc gia đã chọn:</span>
                <strong className="text-cyan">{selectedCountry?.name} ({selectedCountry?.code})</strong>
                <button
                  type="button"
                  className="btn-change-country-hud"
                  onClick={() => setStep(1)}
                >
                  Đổi Quốc Gia
                </button>
              </div>
              <h3>BƯỚC 2: CHỌN HẠNG ĐẤU KHỞI NGHIỆP</h3>
              <p>
                Quy chuẩn công bằng: HLV mới được cấp quyền khởi nghiệp tại <strong>Tier 3</strong>, <strong>Tier 4</strong> hoặc <strong>Tier 5</strong>.
              </p>
            </div>

            {loadingTiers ? (
              <div className="loading-state-hud">
                <div className="spinner-hud" />
                <p>Đang kiểm tra các Hạng đấu tại {selectedCountry?.name}...</p>
              </div>
            ) : (
              <div className="tiers-list-hud">
                {[3, 4, 5].map((tNum) => {
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
                            <span>Ngân sách ban đầu: €1,500,000 CASH</span>
                          </div>
                          <div className="perk-item">
                            <Coins size={14} className="text-amber" />
                            <span>Thưởng tân thủ: 200 GOLD</span>
                          </div>
                        </div>
                      </div>

                      <div className="tier-card-right-hud">
                        <div className="unclaimed-badge-hud">
                          <strong>{count}</strong>
                          <span>CLB CÒN TRỐNG</span>
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
                <span>Quay Lại Bước 1</span>
              </button>

              <button
                type="button"
                className="btn-next-step-hud"
                disabled={!selectedTier}
                onClick={() => setStep(3)}
              >
                <span>TIẾP TỤC SANG BƯỚC BỐC THĂM</span>
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
                <h3>LỄ BỐC THĂM PHÂN BỔ CÂU LẠC BỘ TRỰC TIẾP</h3>
                <p className="claim-desc-hud">
                  HLV đã chọn khởi nghiệp tại <strong className="text-cyan">{selectedCountry?.name}</strong> ở <strong className="text-emerald">{getTierMeta(selectedTier || 3).title}</strong>.
                  <br />
                  Hệ thống Match Server sẽ bốc thăm phân bổ ngẫu nhiên 1 CLB chuyên nghiệp chưa có chủ và trao quyền quản lý tối cao cho bạn!
                </p>

                {claimError && (
                  <div className="claim-error-banner-hud">
                    <p>{claimError}</p>
                  </div>
                )}

                <div className="claim-summary-box-hud">
                  <div className="summary-item-hud">
                    <span>QUỐC GIA:</span>
                    <strong className="text-cyan">{selectedCountry?.name} ({selectedCountry?.code})</strong>
                  </div>
                  <div className="summary-item-hud">
                    <span>HẠNG ĐẤU:</span>
                    <strong className="text-emerald">Tier {selectedTier} - {getTierMeta(selectedTier || 3).title}</strong>
                  </div>
                  <div className="summary-item-hud">
                    <span>QUY CHUẨN:</span>
                    <strong className="text-amber">Bốc thăm ngẫu nhiên CLB trống</strong>
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
                    <span>Đổi Hạng Đấu</span>
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
                        <span>Đang bốc thăm CLB ngẫu nhiên...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>BỐC THĂM & KÝ HỢP ĐỒNG QUẢN LÝ</span>
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
                  <span>KÝ KẾT HỢP ĐỒNG THÀNH CÔNG</span>
                </div>

                <h2 className="reveal-title-hud">🎉 CHÚC MỪNG TÂN HUẤN LUYỆN VIÊN TRƯỞNG! 🎉</h2>
                <p className="reveal-subtitle-hud">
                  Bạn đã chính thức trở thành nhà quản lý tối cao của câu lạc bộ:
                </p>

                <div className="revealed-club-box-hud">
                  <div className="club-logo-hex">⚽</div>
                  <div className="club-identity-hud">
                    <h3>{claimedClub.name}</h3>
                    <div className="club-tags-hud">
                      <span className="tag-item-hud">Quốc gia: {claimedClub.country || selectedCountry?.name}</span>
                      {claimedClub.city && <span className="tag-item-hud">Thành phố: {claimedClub.city}</span>}
                      <span className="tag-item-hud">Hạng đấu: Tier {selectedTier}</span>
                    </div>
                  </div>
                </div>

                <div className="reveal-details-grid-hud">
                  <div className="reveal-detail-item-hud">
                    <Building2 size={22} className="text-cyan" />
                    <div>
                      <span>SÂN VẬN ĐỘNG</span>
                      <strong>{claimedClub.stadium?.name || 'Sân Vận Động Trung Tâm'}</strong>
                      <small>Sức chứa: {(claimedClub.stadium?.capacity || 15000).toLocaleString()} chỗ</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item-hud">
                    <Users size={22} className="text-cyan" />
                    <div>
                      <span>ĐỘI HÌNH KHỞI ĐẦU</span>
                      <strong>{claimedClub.squadCount || 16} Cầu Thủ Sẵn Sàng</strong>
                      <small>Đã ký hợp đồng chuyên nghiệp</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item-hud">
                    <DollarSign size={22} className="text-emerald" />
                    <div>
                      <span>NGÂN SÁCH TIỀN MẶT</span>
                      <strong className="text-emerald">
                        €{(claimedClub.finances?.cash || 1500000).toLocaleString()} CASH
                      </strong>
                      <small>Dành cho chuyển nhượng & nâng cấp</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item-hud">
                    <Coins size={22} className="text-amber" />
                    <div>
                      <span>VÀNG KHỞI NGHIỆP</span>
                      <strong className="text-amber">
                        {(claimedClub.finances?.gold || 200).toLocaleString()} GOLD
                      </strong>
                      <small>Đổi tài nguyên đặc biệt</small>
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
                    <span>BẮT ĐẦU SỰ NGHIỆP QUẢN LÝ CLB NGAY ⚽</span>
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
