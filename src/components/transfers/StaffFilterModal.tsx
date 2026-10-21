import { useTranslation } from '../../i18n';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Search,
  Briefcase,
  Award,
  Globe,
  Dumbbell,
  Trash2,
  Compass,
  HeartPulse,
  Brain,
  Zap,
} from 'lucide-react';
import { FilterOptionsResponse } from '../../services/transfers.service';

export interface StaffFilterValues {
  role?: string;
  license?: string;
  tacticalStyle?: string;
  formationId?: string;
  nationalityId?: string;
  minAge?: number;
  maxAge?: number;
  minOvr?: number;
  maxOvr?: number;
  attributes: Record<string, number>; // { [attrId]: minValue }
}

interface StaffFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOptionsResponse | null;
  currentValues: StaffFilterValues;
  onApply: (values: StaffFilterValues) => void;
  onReset: () => void;
}

// Fallback staff attributes if backend attributes list is empty
const DEFAULT_STAFF_ATTRIBUTES = [
  // COACHING
  { id: '1', code: 'attacking', name: 'Huấn luyện Tấn công', category: 'COACHING' },
  { id: '2', code: 'defending', name: 'Huấn luyện Phòng ngự', category: 'COACHING' },
  { id: '3', code: 'tactical', name: 'Huấn luyện Chiến thuật', category: 'COACHING' },
  { id: '4', code: 'technical', name: 'Huấn luyện Kỹ thuật', category: 'COACHING' },
  { id: '5', code: 'fitness', name: 'Huấn luyện Thể lực', category: 'COACHING' },
  { id: '6', code: 'gk_stopping', name: 'Huấn luyện Thủ môn', category: 'COACHING' },
  { id: '7', code: 'youth_dev', name: 'Phát triển Trẻ', category: 'COACHING' },
  // MENTAL
  { id: '8', code: 'man_management', name: 'Quản lý Nhân sự', category: 'MENTAL' },
  { id: '9', code: 'motivating', name: 'Truyền Lửa & Động lực', category: 'MENTAL' },
  { id: '10', code: 'discipline', name: 'Kỷ luật & Tác phong', category: 'MENTAL' },
  { id: '11', code: 'determination', name: 'Quyết tâm & Ý chí', category: 'MENTAL' },
  { id: '12', code: 'adaptability', name: 'Thích ứng Môi trường', category: 'MENTAL' },
  // SCOUTING
  { id: '13', code: 'judge_ability', name: 'Đánh giá Năng lực', category: 'SCOUTING' },
  { id: '14', code: 'judge_potential', name: 'Đánh giá Tiềm năng', category: 'SCOUTING' },
  { id: '15', code: 'tac_knowledge', name: 'Kiến thức Chiến thuật Trinh sát', category: 'SCOUTING' },
  { id: '16', code: 'scout_network', name: 'Mạng lưới Tuyển trạch', category: 'SCOUTING' },
  // MEDICAL
  { id: '17', code: 'physiotherapy', name: 'Vật lý Trị liệu', category: 'MEDICAL' },
  { id: '18', code: 'sports_science', name: 'Khoa học Thể thao', category: 'MEDICAL' },
  { id: '19', code: 'injury_prevent', name: 'Phòng ngừa Chấn thương', category: 'MEDICAL' },
  { id: '20', code: 'rehabilitation', name: 'Phục hồi Chấn thương', category: 'MEDICAL' },
];

export const StaffFilterModal: React.FC<StaffFilterModalProps> = ({
  isOpen,
  onClose,
  filterOptions,
  currentValues,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();

  // Local Filter States
  const [role, setRole] = useState<string>(currentValues.role || '');
  const [license, setLicense] = useState<string>(currentValues.license || '');
  const [tacticalStyle, setTacticalStyle] = useState<string>(currentValues.tacticalStyle || '');
  const [formationId, setFormationId] = useState<string>(currentValues.formationId || '');
  const [nationalityId, setNationalityId] = useState<string>(currentValues.nationalityId || '');
  const [minAge, setMinAge] = useState<number | undefined>(currentValues.minAge);
  const [maxAge, setMaxAge] = useState<number | undefined>(currentValues.maxAge);
  const [minOvr, setMinOvr] = useState<number | undefined>(currentValues.minOvr);
  const [maxOvr, setMaxOvr] = useState<number | undefined>(currentValues.maxOvr);
  const [attributes, setAttributes] = useState<Record<string, number>>({ ...currentValues.attributes });

  // Country Search State
  const [countrySearchText, setCountrySearchText] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Sync state khi modal mở
  useEffect(() => {
    if (isOpen) {
      setRole(currentValues.role || '');
      setLicense(currentValues.license || '');
      setTacticalStyle(currentValues.tacticalStyle || '');
      setFormationId(currentValues.formationId || '');
      setNationalityId(currentValues.nationalityId || '');
      setMinAge(currentValues.minAge);
      setMaxAge(currentValues.maxAge);
      setMinOvr(currentValues.minOvr);
      setMaxOvr(currentValues.maxOvr);
      setAttributes({ ...currentValues.attributes });
      setCountrySearchText('');
      setIsCountryDropdownOpen(false);
    }
  }, [isOpen, currentValues]);

  // Click outside listener for country dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node) &&
        countryInputRef.current &&
        !countryInputRef.current.contains(e.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allAttributes = useMemo(() => {
    return filterOptions?.staffAttributes && filterOptions.staffAttributes.length > 0
      ? filterOptions.staffAttributes
      : DEFAULT_STAFF_ATTRIBUTES;
  }, [filterOptions]);

  const countries = useMemo(() => filterOptions?.countries || [], [filterOptions]);
  const formations = useMemo(() => filterOptions?.formations || [], [filterOptions]);

  // Selected Country Object
  const selectedCountry = useMemo(() => {
    if (!nationalityId) return null;
    return countries.find((c) => String(c.id) === String(nationalityId)) || null;
  }, [nationalityId, countries]);

  // Filtered Countries for Search
  const filteredCountries = useMemo(() => {
    if (!countrySearchText.trim()) return countries.slice(0, 30);
    const q = countrySearchText.toLowerCase();
    return countries
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 30);
  }, [countries, countrySearchText]);

  // Get localized staff attribute name
  const getAttrName = (code: string, fallbackName: string): string => {
    const key = code ? code.toLowerCase() : '';
    return key ? t(`staff.attr_${key}`, fallbackName) : fallbackName;
  };

  // Tính số lượng bộ lọc đang kích hoạt
  const activeCount = useMemo(() => {
    let count = 0;
    if (role && role !== 'ALL') count++;
    if (license && license !== 'ALL') count++;
    if (tacticalStyle && tacticalStyle !== 'ALL') count++;
    if (formationId) count++;
    if (nationalityId) count++;
    if (minAge !== undefined || maxAge !== undefined) count++;
    if (minOvr !== undefined || maxOvr !== undefined) count++;
    for (const val of Object.values(attributes)) {
      if (val > 0) count++;
    }
    return count;
  }, [role, license, tacticalStyle, formationId, nationalityId, minAge, maxAge, minOvr, maxOvr, attributes]);

  if (!isOpen) return null;

  const handleAttrChange = (attrId: string, val: number) => {
    const next = { ...attributes };
    if (val <= 0) {
      delete next[attrId];
    } else {
      next[attrId] = Math.min(99, Math.max(1, val));
    }
    setAttributes(next);
  };

  const handleAddAttribute = (attrId: string) => {
    if (!attrId) return;
    setAttributes((prev) => ({
      ...prev,
      [attrId]: prev[attrId] || 70,
    }));
  };

  const handleRemoveAttribute = (attrId: string) => {
    const next = { ...attributes };
    delete next[attrId];
    setAttributes(next);
  };

  const handleReset = () => {
    setRole('');
    setLicense('');
    setTacticalStyle('');
    setFormationId('');
    setNationalityId('');
    setMinAge(undefined);
    setMaxAge(undefined);
    setMinOvr(undefined);
    setMaxOvr(undefined);
    setAttributes({});
    setCountrySearchText('');
    onReset();
  };

  const handleApply = () => {
    onApply({
      role: role || undefined,
      license: license || undefined,
      tacticalStyle: tacticalStyle || undefined,
      formationId: formationId || undefined,
      nationalityId: nationalityId || undefined,
      minAge,
      maxAge,
      minOvr,
      maxOvr,
      attributes,
    });
    onClose();
  };

  // Group attributes by category for dropdown
  const groupedAttributes = {
    COACHING: allAttributes.filter((a) => a.category === 'COACHING'),
    MENTAL: allAttributes.filter((a) => a.category === 'MENTAL'),
    SCOUTING: allAttributes.filter((a) => a.category === 'SCOUTING'),
    MEDICAL: allAttributes.filter((a) => a.category === 'MEDICAL'),
  };

  const selectedAttrIds = Object.keys(attributes);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        margin: 0,
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          width: '95%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          fontFamily: 'var(--font-body, -apple-system, sans-serif)',
          animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 1. Header Modal - Daylight Stadium Theme */}
        <div
          style={{
            padding: '1.15rem 1.75rem',
            background: '#ffffff',
            borderBottom: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)',
              }}
            >
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <span>{t('staff_filter.title', 'Bộ Lọc Ban Huấn Luyện & Nhân Sự')}</span>
                {activeCount > 0 && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      color: '#b45309',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                    }}
                  >
                    {t('skill_modal.active_count', '{count} đang chọn').replace('{count}', String(activeCount))}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                {t(
                  'staff_filter.subtitle',
                  'Thiết lập tiêu chuẩn tuyển mộ theo vai trò, bằng cấp, triết lý, tuổi, OVR và các kỹ năng chuyên môn FM'
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer"
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = '#fca5a5';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* 2. Body Cuộn Duy Nhất */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.4rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: '#f8fafc',
          }}
        >
          {/* SECTION 1: NHÓM CHUYÊN MÔN, VAI TRÒ & BẰNG CẤP */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                color: '#0f172a',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                }}
              >
                <Briefcase size={16} />
              </div>
              <span>{t('staff_filter.section_role_license', '1. Nhóm Chuyên Môn, Vai Trò & Bằng Cấp Huấn Luyện')}</span>
            </div>

            {/* Category Pills (4 Nhóm Chuyên Môn) */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.45rem' }}>
                {t('staff_filter.category_label', 'Nhóm chuyên môn:')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { value: '', label: t('staff.role_all', 'Tất cả phân loại'), color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
                  { value: 'COACH', label: `⚽ ${t('staff.type_coach', 'Huấn Luyện Viên (Coach)')}`, color: '#15803d', bg: '#dcfce7', border: '#86efac' },
                  { value: 'SCOUT', label: `🔍 ${t('staff.type_scout', 'Tuyển Trạch Viên (Scout)')}`, color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
                  { value: 'PHYSIO', label: `🩺 ${t('staff.type_physio', 'Bác Sĩ / Trị Liệu (Physio)')}`, color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
                  { value: 'DIRECTOR', label: `💼 ${t('staff.type_director', 'Giám Đốc (Director)')}`, color: '#7c3aed', bg: '#f3e8ff', border: '#d8b4fe' },
                ].map((cat) => {
                  const isSelected = role === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setRole(cat.value)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: isSelected ? `2px solid ${cat.color}` : '1px solid #cbd5e1',
                        background: isSelected ? cat.bg : '#ffffff',
                        color: isSelected ? cat.color : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vai trò cụ thể & Bằng cấp */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {/* Dropdown vai trò cụ thể */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('staff_filter.role_label', 'Vai trò cụ thể:')}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="">{t('staff.role_all', 'Tất cả vai trò & phân loại')}</option>
                  <optgroup label={t('staff.optgroup_coaching', 'Ban Huấn Luyện Đội Một (First Team)')}>
                    <option value="HEAD_COACH">{t('staff.head_coach', 'HLV Trưởng')}</option>
                    <option value="ASSISTANT_COACH">{t('staff.assistant_coach', 'Trợ Lý HLV')}</option>
                    <option value="FITNESS_COACH">{t('staff.fitness_coach', 'HLV Thể Lực')}</option>
                    <option value="GOALKEEPING_COACH">{t('staff.gk_coach', 'HLV Thủ Môn')}</option>
                  </optgroup>
                  <optgroup label={t('staff.optgroup_youth_team', 'Đội Trẻ U21 & Học Viện (Youth Team)')}>
                    <option value="HEAD_COACH_YOUTH">{t('staff.head_coach_youth', 'HLV Trưởng Đội Trẻ U21')}</option>
                    <option value="ASSISTANT_COACH_YOUTH">{t('staff.assistant_coach_youth', 'Trợ Lý HLV Đội Trẻ U21')}</option>
                    <option value="YOUTH_DIRECTOR">{t('staff.youth_director', 'Giám Đốc Đào Tạo Trẻ')}</option>
                  </optgroup>
                  <optgroup label={t('staff.optgroup_scouting', 'Tuyển Trạch (Scouting)')}>
                    <option value="HEAD_SCOUT">{t('staff.head_scout', 'Trưởng Ban Tuyển Trạch')}</option>
                    <option value="SCOUT">{t('staff.scout', 'Tuyển Trạch Viên')}</option>
                  </optgroup>
                  <optgroup label={t('staff.optgroup_medical', 'Y Tế & Thể Trạng (Medical)')}>
                    <option value="CHIEF_PHYSIO">{t('staff.chief_physio', 'Trưởng Ban Y Tế')}</option>
                    <option value="PHYSIO">{t('staff.physio', 'Bác Sĩ / Trị Liệu')}</option>
                  </optgroup>
                  <optgroup label={t('staff.optgroup_director', 'Ban Giám Đốc (Board & Directors)')}>
                    <option value="TECHNICAL_DIRECTOR">{t('staff.technical_director', 'Giám Đốc Kỹ Thuật')}</option>
                    <option value="SCOUT_DIRECTOR">{t('staff.scout_director', 'Giám Đốc Tuyển Trạch')}</option>
                    <option value="PHYSIO_DIRECTOR">{t('staff.physio_director', 'Giám Đốc Y Tế')}</option>
                    <option value="FINANCIAL_DIRECTOR">{t('staff.financial_director', 'Giám Đốc Tài Chính')}</option>
                  </optgroup>
                </select>
              </div>

              {/* Bằng cấp huấn luyện */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('staff_filter.license_label', 'Bằng cấp huấn luyện:')}
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { code: '', label: t('staff_filter.all_licenses', 'Tất cả'), color: '#475569', bg: '#f1f5f9' },
                    { code: 'PRO', label: 'PRO', color: '#b45309', bg: '#fef3c7' },
                    { code: 'A', label: 'A', color: '#15803d', bg: '#dcfce7' },
                    { code: 'B', label: 'B', color: '#1d4ed8', bg: '#dbeafe' },
                    { code: 'C', label: 'C', color: '#475569', bg: '#f1f5f9' },
                  ].map((lic) => {
                    const isSelected = license === lic.code;
                    return (
                      <button
                        key={lic.code}
                        type="button"
                        onClick={() => setLicense(lic.code)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                          border: isSelected ? `2px solid ${lic.color}` : '1px solid #cbd5e1',
                          background: isSelected ? lic.bg : '#ffffff',
                          color: isSelected ? lic.color : '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {lic.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TRIẾT LÝ, SƠ ĐỒ & THÔNG SỐ CƠ BẢN */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                color: '#0f172a',
                marginBottom: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                }}
              >
                <Award size={16} />
              </div>
              <span>{t('staff_filter.section_style_info', '2. Triết Lý, Sơ Đồ & Thông Số Cơ Bản')}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              {/* Triết lý chiến thuật */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('staff_filter.style_label', 'Triết lý chiến thuật:')}
                </label>
                <select
                  value={tacticalStyle}
                  onChange={(e) => setTacticalStyle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="">{t('staff_filter.all_styles', 'Tất cả triết lý')}</option>
                  <option value="BALANCED">{t('staff.style_balanced', 'Cân Bằng')}</option>
                  <option value="TIKI_TAKA">{t('staff.style_tiki_taka', 'Tiki-Taka Hiện Đại')}</option>
                  <option value="GEGENPRESSING">{t('staff.style_gegenpressing', 'Gegenpressing')}</option>
                  <option value="COUNTER_ATTACK">{t('staff.style_counter_attack', 'Phản công nhanh')}</option>
                  <option value="CATENACCIO">{t('staff.style_catenaccio', 'Phòng ngự Catenaccio')}</option>
                  <option value="WING_PLAY">{t('staff.style_wing_play', 'Tấn Công Biên')}</option>
                  <option value="ATTACKING">{t('staff.style_attacking', 'Tấn công dồn ép')}</option>
                  <option value="DEFENSIVE">{t('staff.style_defensive', 'Phòng ngự chặt chẽ')}</option>
                  <option value="DIRECT">{t('staff.style_direct_counter', 'Tấn Công Trực Diện')}</option>
                </select>
              </div>

              {/* Sơ đồ ưa thích */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('staff_filter.formation_label', 'Sơ đồ ưa thích:')}
                </label>
                <select
                  value={formationId}
                  onChange={(e) => setFormationId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="">{t('staff_filter.all_formations', 'Tất cả sơ đồ')}</option>
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quốc Gia (Searchable Input) */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('staff_filter.nationality_label', 'Quốc tịch / Quốc gia:')}
                </label>

                {selectedCountry ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {selectedCountry.flag_url && (
                        <img
                          src={selectedCountry.flag_url}
                          alt={selectedCountry.name}
                          style={{ width: 22, height: 16, objectFit: 'cover', borderRadius: '3px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                        />
                      )}
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {selectedCountry.name} ({selectedCountry.code})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNationalityId('');
                        setCountrySearchText('');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={t('skill_modal.clear_country', 'Xóa chọn quốc gia')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                      <input
                        ref={countryInputRef}
                        type="text"
                        placeholder={t('skill_modal.search_country_placeholder', 'Nhập tìm quốc gia...')}
                        value={countrySearchText}
                        onChange={(e) => {
                          setCountrySearchText(e.target.value);
                          setIsCountryDropdownOpen(true);
                        }}
                        onFocus={() => setIsCountryDropdownOpen(true)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem 0.5rem 2.1rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: '#fff',
                          outline: 'none',
                          color: '#0f172a',
                        }}
                      />
                    </div>

                    {isCountryDropdownOpen && (
                      <div
                        ref={countryDropdownRef}
                        style={{
                          position: 'absolute',
                          top: '105%',
                          left: 0,
                          right: 0,
                          maxHeight: '210px',
                          overflowY: 'auto',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          zIndex: 100,
                        }}
                      >
                        {filteredCountries.length === 0 ? (
                          <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>
                            {t('skill_modal.no_countries_found', 'Không tìm thấy quốc gia phù hợp')}
                          </div>
                        ) : (
                          filteredCountries.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setNationalityId(String(c.id));
                                setIsCountryDropdownOpen(false);
                                setCountrySearchText('');
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.83rem',
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                            >
                              {c.flag_url && (
                                <img
                                  src={c.flag_url}
                                  alt={c.name}
                                  style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: '2px' }}
                                />
                              )}
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>{c.name}</span>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 'auto' }}>{c.code}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chỉ số OVR (Min - Max) */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('staff_filter.ovr_label', 'Chỉ số OVR (Tổng thể):')}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min={40}
                    max={99}
                    placeholder={`${t('common.min', 'Tối thiểu')} (50)`}
                    value={minOvr ?? ''}
                    onChange={(e) => setMinOvr(e.target.value ? Number(e.target.value) : undefined)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                      fontWeight: 700,
                    }}
                  />
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
                  <input
                    type="number"
                    min={40}
                    max={99}
                    placeholder={`${t('common.max', 'Tối đa')} (99)`}
                    value={maxOvr ?? ''}
                    onChange={(e) => setMaxOvr(e.target.value ? Number(e.target.value) : undefined)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* Tuổi (Min - Max) */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('staff_filter.age_label', 'Độ tuổi (Năm):')}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min={25}
                    max={75}
                    placeholder={`${t('common.min', 'Tối thiểu')} (30)`}
                    value={minAge ?? ''}
                    onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : undefined)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                      fontWeight: 700,
                    }}
                  />
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
                  <input
                    type="number"
                    min={25}
                    max={75}
                    placeholder={`${t('common.max', 'Tối đa')} (75)`}
                    value={maxAge ?? ''}
                    onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : undefined)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: YÊU CẦU CHỈ SỐ KỸ NĂNG CHUYÊN MÔN */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '6px',
                    background: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7',
                  }}
                >
                  <Zap size={16} />
                </div>
                <span>{t('staff_filter.section_attributes', '3. Yêu Cầu Chỉ Số Kỹ Năng Chuyên Môn (Attributes)')}</span>
                {selectedAttrIds.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                    }}
                  >
                    {t('skill_modal.selected_skills_count', '{count} kỹ năng').replace('{count}', String(selectedAttrIds.length))}
                  </span>
                )}
              </div>

              {/* Dropdown Chọn Thêm Kỹ Năng */}
              <div style={{ minWidth: 260, maxWidth: 360, width: '100%' }}>
                <select
                  value=""
                  onChange={(e) => handleAddAttribute(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px dashed #0284c7',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="" disabled>
                    ➕ {t('staff_filter.select_skill_to_add', 'Chọn kỹ năng nhân sự để thêm vào bộ lọc...')}
                  </option>

                  <optgroup label={`🏋️‍♂️ ${t('staff.skills_coaching', 'Huấn Luyện (Coaching)')}`}>
                    {groupedAttributes.COACHING.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code, a.name)} {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label={`🧠 ${t('staff.skills_mental', 'Tác Phong & Tinh Thần (Mental)')}`}>
                    {groupedAttributes.MENTAL.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code, a.name)} {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label={`🔍 ${t('staff.skills_scouting', 'Tuyển Trạch & Đánh Giá (Scouting)')}`}>
                    {groupedAttributes.SCOUTING.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code, a.name)} {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label={`🩺 ${t('staff.skills_medical', 'Y Tế & Thể Trạng (Medical)')}`}>
                    {groupedAttributes.MEDICAL.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code, a.name)} {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Danh sách các kỹ năng đã chọn */}
            {selectedAttrIds.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.83rem',
                }}
              >
                {t(
                  'staff_filter.no_skill_selected_hint',
                  'Chưa có chỉ số nào được chọn. Hãy chọn một kỹ năng từ menu trên để đặt yêu cầu điểm số tối thiểu (ví dụ: Huấn luyện Tấn công ≥ 75, Quản lý Nhân sự ≥ 80).'
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '0.75rem' }}>
                {selectedAttrIds.map((attrId) => {
                  const attrObj = allAttributes.find((a) => String(a.id) === String(attrId));
                  const currentVal = attributes[attrId] || 70;
                  const code = attrObj?.code || 'SKILL';
                  const name = attrObj ? getAttrName(attrObj.code, attrObj.name) : code;
                  const category = attrObj?.category || 'COACHING';

                  const categoryColor =
                    category === 'COACHING'
                      ? '#16a34a'
                      : category === 'MENTAL'
                      ? '#0284c7'
                      : category === 'SCOUTING'
                      ? '#7c3aed'
                      : '#dc2626';

                  const categoryBg =
                    category === 'COACHING'
                      ? '#f0fdf4'
                      : category === 'MENTAL'
                      ? '#f0f9ff'
                      : category === 'SCOUTING'
                      ? '#f5f3ff'
                      : '#fef2f2';

                  return (
                    <div
                      key={attrId}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                              color: categoryColor,
                              background: categoryBg,
                              border: `1px solid ${categoryColor}44`,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {category}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{name}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(attrId)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '3px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.background = '#fee2e2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title={t('skill_modal.remove_skill_tooltip', 'Xóa chỉ số này')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Slider + Number Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <input
                          type="range"
                          min={1}
                          max={99}
                          value={currentVal}
                          onChange={(e) => handleAttrChange(attrId, Number(e.target.value))}
                          style={{
                            flex: 1,
                            accentColor: categoryColor,
                            cursor: 'pointer',
                          }}
                        />

                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={currentVal}
                          onChange={(e) => handleAttrChange(attrId, Number(e.target.value))}
                          style={{
                            width: '56px',
                            padding: '0.25rem 0.35rem',
                            borderRadius: '6px',
                            border: `1.5px solid ${categoryColor}66`,
                            fontWeight: 800,
                            fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            color: categoryColor,
                            background: categoryBg,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer Modal */}
        <div
          style={{
            padding: '1rem 1.75rem',
            background: '#ffffff',
            borderTop: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <RotateCcw size={15} />
            <span>{t('skill_modal.reset_all', 'Đặt lại tất cả')}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              {t('common.cancel', 'Hủy')}
            </button>

            <button
              type="button"
              onClick={handleApply}
              style={{
                padding: '0.55rem 1.35rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(2, 132, 199, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.3)';
              }}
            >
              <Check size={16} />
              <span>{t('skill_modal.apply_filters_btn', 'Áp Dụng Bộ Lọc')}</span>
              {activeCount > 0 && (
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                  }}
                >
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
