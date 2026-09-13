import React, { useState, useEffect } from 'react';
import { Club, StarterCountry, StarterTier, User } from '../types';
import { clubsApi, authApi } from '../services/api';
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

  // Load starter countries on mount
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
    const val = e.target.value;
    setSearchQuery(val);
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
      // Small suspense delay for high-stakes random draw feel
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
          badgeColor: '#0284c7',
          desc: 'Các câu lạc bộ có truyền thống, đội hình khá dày dặn, cơ sở vật chất ổn định. Mục tiêu cạnh tranh suất lên hạng Nhất!',
          stars: '⭐⭐⭐',
        };
      case 4:
        return {
          title: 'Giải Hạng Ba (Tier 4)',
          badge: 'Thử Thách Tiêu Chuẩn',
          badgeColor: '#0ea5e9',
          desc: 'Môi trường cân bằng cho các HLV xây dựng lối chơi từ cơ bản, tìm kiếm nhân tài và bứt phá tiềm năng.',
          stars: '⭐⭐',
        };
      case 5:
        return {
          title: 'Giải Hạng Tư (Tier 5)',
          badge: 'Khởi Nghiệp Đích Thực',
          badgeColor: '#38bdf8',
          desc: 'Hành trình từ giải đấu nền tảng đi lên. Thể hiện tài thao lược của HLV để kiến tạo đế chế bóng đá từ hai bàn tay trắng.',
          stars: '⭐',
        };
      default:
        return {
          title: `Giải Hạng ${tierNum}`,
          badge: 'Khởi Nghiệp',
          badgeColor: '#0284c7',
          desc: 'Câu lạc bộ giàu tiềm năng đang chờ đón bạn dẫn dắt.',
          stars: '⭐',
        };
    }
  };

  return (
    <div className="onboarding-page">
      {/* Top Bar */}
      <header className="onboarding-topbar">
        <div className="onboarding-brand">
          <span className="onboarding-brand-icon">⚽</span>
          <div>
            <h2>Football Champion Manager</h2>
            <p>Hồ Sơ Nhậm Chức Huấn Luyện Viên</p>
          </div>
        </div>

        <div className="onboarding-user-info">
          <span className="user-greeting">
            Xin chào, <strong>{user?.username || 'Huấn Luyện Viên'}</strong>!
          </span>
          <button className="onboarding-logout-btn" onClick={onLogout} title="Đăng xuất">
            <LogOut size={16} />
            <span>Đổi tài khoản</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="onboarding-content">
        {/* Step Stepper Header */}
        <div className="onboarding-stepper">
          <div className={`stepper-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="stepper-circle">
              {step > 1 ? <CheckCircle2 size={20} /> : <Globe size={20} />}
            </div>
            <div className="stepper-label">
              <span>Bước 1</span>
              <strong>Chọn Quốc Gia</strong>
            </div>
          </div>

          <div className={`stepper-line ${step >= 2 ? 'active' : ''}`} />

          <div className={`stepper-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="stepper-circle">
              {step > 2 ? <CheckCircle2 size={20} /> : <Trophy size={20} />}
            </div>
            <div className="stepper-label">
              <span>Bước 2</span>
              <strong>Chọn Hạng Đấu</strong>
            </div>
          </div>

          <div className={`stepper-line ${step >= 3 ? 'active' : ''}`} />

          <div className={`stepper-node ${step === 3 ? 'active' : ''}`}>
            <div className="stepper-circle">
              <Dices size={20} />
            </div>
            <div className="stepper-label">
              <span>Bước 3</span>
              <strong>Bốc Thăm Nhận CLB</strong>
            </div>
          </div>
        </div>

        {/* STEP 1: CHỌN QUỐC GIA */}
        {step === 1 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h3>Bước 1: Chọn Quốc Gia Để Bắt Đầu Sự Nghiệp</h3>
              <p>
                Hệ thống hỗ trợ 205 Liên đoàn Bóng đá Quốc gia. Bạn sẽ khởi nghiệp tại giải đấu quốc nội của đất nước này.
              </p>
              
              <div className="country-search-bar">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm quốc gia (ví dụ: Vietnam, England, Spain, Brazil, Japan...)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {loadingCountries ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Đang tải danh sách Quốc gia và các CLB khả dụng...</p>
              </div>
            ) : (
              <>
                <div className="countries-grid">
                  {filteredCountries.slice(0, 48).map((c) => {
                    const isSelected = selectedCountry?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`country-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCountry(c)}
                      >
                        <div className="country-card-header">
                          <span className="country-flag-icon">🏳️</span>
                          <span className="country-code-badge">{c.code}</span>
                        </div>
                        <h4 className="country-name">{c.name}</h4>
                        <div className="country-stats">
                          <span className="available-tag">
                            {c.unclaimed_clubs} CLB trống (Tier 3-5)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredCountries.length === 0 && (
                  <div className="empty-search-state">
                    <p>Không tìm thấy Quốc gia nào khớp với "{searchQuery}"</p>
                  </div>
                )}

                <div className="onboarding-actions">
                  <div className="selected-summary">
                    {selectedCountry ? (
                      <span>
                        Đang chọn: <strong>{selectedCountry.name} ({selectedCountry.code})</strong>
                      </span>
                    ) : (
                      <span className="hint-text">Vui lòng nhấp chọn 1 Quốc gia ở trên</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-next-step"
                    disabled={!selectedCountry}
                    onClick={() => {
                      if (selectedCountry) handleSelectCountry(selectedCountry);
                    }}
                  >
                    <span>Tiếp Tục Chọn Hạng Đấu</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: CHỌN HẠNG ĐẤU */}
        {step === 2 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <div className="selected-country-banner">
                <span>Quốc gia đã chọn:</span>
                <strong>{selectedCountry?.name} ({selectedCountry?.code})</strong>
                <button
                  type="button"
                  className="btn-change-country"
                  onClick={() => setStep(1)}
                >
                  Đổi Quốc gia
                </button>
              </div>
              <h3>Bước 2: Chọn Hạng Đấu Khởi Nghiệp</h3>
              <p>
                Quy định giải đấu: HLV mới được phép lựa chọn khởi nghiệp tại <strong>Tier 3</strong>, <strong>Tier 4</strong> hoặc <strong>Tier 5</strong>.
              </p>
            </div>

            {loadingTiers ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Đang kiểm tra các Hạng đấu tại {selectedCountry?.name}...</p>
              </div>
            ) : (
              <div className="tiers-list">
                {[3, 4, 5].map((tNum) => {
                  const meta = getTierMeta(tNum);
                  const isSelected = selectedTier === tNum;
                  const tierDb = tiers.find((item) => item.tier === tNum);
                  const count = tierDb ? tierDb.unclaimed_count : 16;

                  return (
                    <div
                      key={tNum}
                      className={`tier-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTier(tNum)}
                    >
                      <div className="tier-card-left">
                        <div className="tier-badge-pill" style={{ backgroundColor: meta.badgeColor }}>
                          Tier {tNum}
                        </div>
                        <span className="tier-difficulty">{meta.stars} {meta.badge}</span>
                        <h4>{meta.title}</h4>
                        <p>{meta.desc}</p>
                        
                        <div className="tier-perks">
                          <div className="perk-item">
                            <DollarSign size={14} color="#059669" />
                            <span>Ngân sách ban đầu: €1,500,000 CASH</span>
                          </div>
                          <div className="perk-item">
                            <Coins size={14} color="#d97706" />
                            <span>Thưởng tân thủ: 200 GOLD</span>
                          </div>
                        </div>
                      </div>

                      <div className="tier-card-right">
                        <div className="unclaimed-badge">
                          <strong>{count}</strong>
                          <span>CLB còn trống</span>
                        </div>
                        <div className="tier-radio">
                          <div className={`radio-circle ${isSelected ? 'checked' : ''}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="onboarding-actions">
              <button
                type="button"
                className="btn-prev-step"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={18} />
                <span>Quay Lại Bước 1</span>
              </button>

              <button
                type="button"
                className="btn-next-step"
                disabled={!selectedTier}
                onClick={() => setStep(3)}
              >
                <span>Tiếp Tục Sang Bước Bốc Thăm</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BỐC THĂM & NHẬN CLB */}
        {step === 3 && (
          <div className="onboarding-step-view">
            {!claimedClub ? (
              <div className="claim-prompt-card">
                <div className="claim-icon-wrapper">
                  <Dices size={48} className={claiming ? 'spin-dice' : ''} />
                </div>
                <h3>Bốc Thăm Phân Bổ Câu Lạc Bộ Ngẫu Nhiên</h3>
                <p className="claim-desc">
                  Bạn đã chọn khởi nghiệp tại <strong>{selectedCountry?.name}</strong> ở <strong>{getTierMeta(selectedTier || 3).title}</strong>.
                  <br />
                  Hệ thống sẽ tiến hành bốc thăm phân bổ ngẫu nhiên 1 câu lạc bộ chưa có chủ và trao quyền quản lý trọn đời cho bạn!
                </p>

                {claimError && (
                  <div className="claim-error-banner">
                    <p>{claimError}</p>
                  </div>
                )}

                <div className="claim-summary-box">
                  <div className="summary-item">
                    <span>Quốc Gia:</span>
                    <strong>{selectedCountry?.name} ({selectedCountry?.code})</strong>
                  </div>
                  <div className="summary-item">
                    <span>Hạng Đấu:</span>
                    <strong>Tier {selectedTier} - {getTierMeta(selectedTier || 3).title}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Cơ chế:</span>
                    <strong>Random gán 1 CLB trống</strong>
                  </div>
                </div>

                <div className="claim-action-buttons">
                  <button
                    type="button"
                    className="btn-prev-step"
                    disabled={claiming}
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={18} />
                    <span>Đổi Hạng Đấu</span>
                  </button>

                  <button
                    type="button"
                    className="btn-claim-random"
                    disabled={claiming}
                    onClick={handleStartClaim}
                  >
                    {claiming ? (
                      <>
                        <div className="spinner" />
                        <span>Đang bốc thăm ngẫu nhiên CLB...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Ký Hợp Đồng & Bốc Thăm Ngẫu Nhiên</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* CLAIM CELEBRATION REVEAL */
              <div className="claim-reveal-card">
                <div className="reveal-badge">
                  <Award size={20} />
                  <span>KÝ KẾT HỢP ĐỒNG THÀNH CÔNG</span>
                </div>

                <h2 className="reveal-title">🎉 Chúc Mừng Tân HLV Trưởng! 🎉</h2>
                <p className="reveal-subtitle">
                  Bạn đã chính thức trở thành nhà quản lý tối cao của câu lạc bộ:
                </p>

                <div className="revealed-club-box">
                  <div className="club-logo-circle">⚽</div>
                  <div className="club-identity">
                    <h3>{claimedClub.name}</h3>
                    <div className="club-tags">
                      <span className="tag-item">Quốc gia: {claimedClub.country || selectedCountry?.name}</span>
                      {claimedClub.city && <span className="tag-item">Thành phố: {claimedClub.city}</span>}
                      <span className="tag-item">Hạng: Tier {selectedTier}</span>
                    </div>
                  </div>
                </div>

                <div className="reveal-details-grid">
                  <div className="reveal-detail-item">
                    <Building2 size={20} color="#0284c7" />
                    <div>
                      <span>Sân Vận Động</span>
                      <strong>{claimedClub.stadium?.name || 'Sân vận động Trung tâm'}</strong>
                      <small>Sức chứa: {(claimedClub.stadium?.capacity || 15000).toLocaleString()} chỗ</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item">
                    <Users size={20} color="#0284c7" />
                    <div>
                      <span>Đội Hình Khởi Đầu</span>
                      <strong>{claimedClub.squadCount || 16} Cầu Thủ Sẵn Sàng</strong>
                      <small>Đã ký hợp đồng chuyên nghiệp</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item">
                    <DollarSign size={20} color="#059669" />
                    <div>
                      <span>Ngân Sách Tiền Mặt</span>
                      <strong style={{ color: '#059669' }}>
                        €{(claimedClub.finances?.cash || 1500000).toLocaleString()} CASH
                      </strong>
                      <small>Sử dụng mua sắm & nâng cấp SVĐ</small>
                    </div>
                  </div>

                  <div className="reveal-detail-item">
                    <Coins size={20} color="#d97706" />
                    <div>
                      <span>Vàng Khởi Nghiệp</span>
                      <strong style={{ color: '#d97706' }}>
                        {(claimedClub.finances?.gold || 200).toLocaleString()} GOLD
                      </strong>
                      <small>Đổi tài nguyên đặc biệt</small>
                    </div>
                  </div>
                </div>

                <div className="reveal-action">
                  <button
                    type="button"
                    className="btn-enter-game"
                    onClick={() => onClubClaimed(claimedClub)}
                  >
                    <ShieldCheck size={20} />
                    <span>Bắt Đầu Sự Nghiệp Quản Lý CLB Ngay ⚽</span>
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
