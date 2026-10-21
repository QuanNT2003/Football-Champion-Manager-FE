import { useTranslation } from '../../i18n';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Search,
  Shield,
  Zap,
  Target,
  Brain,
  Activity,
  Trash2,
  Plus,
  Globe,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { FilterOptionsResponse } from '../../services/transfers.service';

export interface SkillFilterValues {
  status?: 'ALL' | 'FREE' | 'LOAN' | 'TRANSFER';
  position?: string;
  minAge?: number;
  maxAge?: number;
  minPrice?: number;
  maxPrice?: number;
  nationalityId?: string;
  minOvr?: number;
  maxOvr?: number;
  attributes: Record<string, number>; // { [attrId]: minValue }
}

interface PlayerSkillFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOptionsResponse | null;
  currentValues: SkillFilterValues;
  onApply: (values: SkillFilterValues) => void;
  onReset: () => void;
}

const ATTRIBUTE_EN_NAMES: Record<string, string> = {
  // PHYSICAL
  PAC: 'Pace',
  ACC: 'Acceleration',
  STA: 'Stamina',
  STR: 'Strength',
  AGI: 'Agility',
  BAL: 'Balance',
  JUM: 'Jumping Reach',
  NAT: 'Natural Fitness',
  PWR: 'Shot Power',
  RES: 'Durability',
  // TECHNICAL
  FIN: 'Finishing',
  DRI: 'Dribbling',
  PAS: 'Passing',
  TEC: 'Technique',
  FIR: 'First Touch',
  HEA: 'Heading',
  TAC: 'Tackling',
  MAR: 'Marking',
  CRO: 'Crossing',
  LSH: 'Long Shots',
  // MENTAL
  DEC: 'Decisions',
  VIS: 'Vision',
  CMP: 'Composure',
  COM: 'Composure',
  POS: 'Positioning',
  ANT: 'Anticipation',
  BRA: 'Bravery',
  DET: 'Determination',
  FLA: 'Flair',
  LEA: 'Leadership',
  TEA: 'Teamwork',
  WOR: 'Work Rate',
  CON: 'Concentration',
  OTB: 'Off The Ball',
  // GOALKEEPING
  REF: 'Reflexes',
  HAN: 'Handling',
  ONE: 'One on Ones',
  OOO: 'One on Ones',
  AER: 'Aerial Reach',
  CMD: 'Command of Area',
  KIC: 'Kicking',
  THR: 'Throwing',
  PUN: 'Punching',
  RUS: 'Rushing Out',
};

const DEFAULT_ATTRIBUTES = [
  { id: '1', code: 'PAC', name: 'Pace', category: 'PHYSICAL' },
  { id: '2', code: 'ACC', name: 'Acceleration', category: 'PHYSICAL' },
  { id: '3', code: 'STA', name: 'Stamina', category: 'PHYSICAL' },
  { id: '4', code: 'STR', name: 'Strength', category: 'PHYSICAL' },
  { id: '5', code: 'AGI', name: 'Agility', category: 'PHYSICAL' },
  { id: '6', code: 'BAL', name: 'Balance', category: 'PHYSICAL' },
  { id: '7', code: 'JUM', name: 'Jumping Reach', category: 'PHYSICAL' },
  { id: '8', code: 'NAT', name: 'Natural Fitness', category: 'PHYSICAL' },
  { id: '9', code: 'PWR', name: 'Shot Power', category: 'PHYSICAL' },
  { id: '10', code: 'RES', name: 'Durability', category: 'PHYSICAL' },
  { id: '11', code: 'FIN', name: 'Finishing', category: 'TECHNICAL' },
  { id: '12', code: 'DRI', name: 'Dribbling', category: 'TECHNICAL' },
  { id: '13', code: 'PAS', name: 'Passing', category: 'TECHNICAL' },
  { id: '14', code: 'TEC', name: 'Technique', category: 'TECHNICAL' },
  { id: '15', code: 'FIR', name: 'First Touch', category: 'TECHNICAL' },
  { id: '16', code: 'HEA', name: 'Heading', category: 'TECHNICAL' },
  { id: '17', code: 'TAC', name: 'Tackling', category: 'TECHNICAL' },
  { id: '18', code: 'MAR', name: 'Marking', category: 'TECHNICAL' },
  { id: '19', code: 'CRO', name: 'Crossing', category: 'TECHNICAL' },
  { id: '20', code: 'LSH', name: 'Long Shots', category: 'TECHNICAL' },
  { id: '21', code: 'DEC', name: 'Decisions', category: 'MENTAL' },
  { id: '22', code: 'VIS', name: 'Vision', category: 'MENTAL' },
  { id: '23', code: 'CMP', name: 'Composure', category: 'MENTAL' },
  { id: '24', code: 'ANT', name: 'Anticipation', category: 'MENTAL' },
  { id: '25', code: 'OTB', name: 'Off The Ball', category: 'MENTAL' },
  { id: '26', code: 'POS', name: 'Positioning', category: 'MENTAL' },
  { id: '27', code: 'WOR', name: 'Work Rate', category: 'MENTAL' },
  { id: '28', code: 'DET', name: 'Determination', category: 'MENTAL' },
  { id: '29', code: 'CON', name: 'Concentration', category: 'MENTAL' },
  { id: '30', code: 'LEA', name: 'Leadership', category: 'MENTAL' },
  { id: '31', code: 'REF', name: 'Reflexes', category: 'GOALKEEPING' },
  { id: '32', code: 'HAN', name: 'Handling', category: 'GOALKEEPING' },
  { id: '33', code: 'AER', name: 'Aerial Reach', category: 'GOALKEEPING' },
  { id: '34', code: 'CMD', name: 'Command Of Area', category: 'GOALKEEPING' },
  { id: '35', code: 'OOO', name: 'One On Ones', category: 'GOALKEEPING' },
  { id: '36', code: 'KIC', name: 'Kicking', category: 'GOALKEEPING' },
  { id: '37', code: 'THR', name: 'Throwing', category: 'GOALKEEPING' },
  { id: '38', code: 'PUN', name: 'Punching', category: 'GOALKEEPING' },
  { id: '39', code: 'RUS', name: 'Rushing Out', category: 'GOALKEEPING' },
  { id: '40', code: 'COM', name: 'Communication', category: 'GOALKEEPING' },
];

export const PlayerSkillFilterModal: React.FC<PlayerSkillFilterModalProps> = ({
  isOpen,
  onClose,
  filterOptions,
  currentValues,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();

  // Filter States
  const [status, setStatus] = useState<'ALL' | 'FREE' | 'LOAN' | 'TRANSFER'>(currentValues.status || 'ALL');
  const [position, setPosition] = useState<string>(currentValues.position || '');
  const [minAge, setMinAge] = useState<number | undefined>(currentValues.minAge);
  const [maxAge, setMaxAge] = useState<number | undefined>(currentValues.maxAge);
  const [minPrice, setMinPrice] = useState<number | undefined>(currentValues.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(currentValues.maxPrice);
  const [nationalityId, setNationalityId] = useState<string>(currentValues.nationalityId || '');
  const [minOvr, setMinOvr] = useState<number | undefined>(currentValues.minOvr);
  const [maxOvr, setMaxOvr] = useState<number | undefined>(currentValues.maxOvr);
  const [attributes, setAttributes] = useState<Record<string, number>>({ ...currentValues.attributes });

  // Country Autocomplete State
  const [countrySearchText, setCountrySearchText] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Sync state khi modal mở
  useEffect(() => {
    if (isOpen) {
      setStatus(currentValues.status || 'ALL');
      setPosition(currentValues.position || '');
      setMinAge(currentValues.minAge);
      setMaxAge(currentValues.maxAge);
      setMinPrice(currentValues.minPrice);
      setMaxPrice(currentValues.maxPrice);
      setNationalityId(currentValues.nationalityId || '');
      setMinOvr(currentValues.minOvr);
      setMaxOvr(currentValues.maxOvr);
      setAttributes({ ...currentValues.attributes });
      setCountrySearchText('');
      setIsCountryDropdownOpen(false);
    }
  }, [isOpen, currentValues]);

  // Handle click outside country dropdown
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
    return filterOptions?.attributes && filterOptions.attributes.length > 0
      ? filterOptions.attributes
      : DEFAULT_ATTRIBUTES;
  }, [filterOptions]);

  const countries = useMemo(() => {
    return filterOptions?.countries || [];
  }, [filterOptions]);

  // Selected Country Object
  const selectedCountry = useMemo(() => {
    if (!nationalityId) return null;
    return countries.find((c) => String(c.id) === String(nationalityId)) || null;
  }, [nationalityId, countries]);

  // Filtered Countries for Search
  const filteredCountries = useMemo(() => {
    if (!countrySearchText.trim()) return countries.slice(0, 30);
    const q = countrySearchText.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [countries, countrySearchText]);

  // Get localized attribute name
  const getAttrName = (code: string): string => {
    return t(`skill.${code}`, ATTRIBUTE_EN_NAMES[code] || code);
  };

  // Tính số lượng bộ lọc đang kích hoạt
  const activeCount = useMemo(() => {
    let count = 0;
    if (status && status !== 'ALL') count++;
    if (position) count++;
    if (minAge !== undefined || maxAge !== undefined) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    if (nationalityId) count++;
    if (minOvr !== undefined || maxOvr !== undefined) count++;
    for (const val of Object.values(attributes)) {
      if (val > 0) count++;
    }
    return count;
  }, [status, position, minAge, maxAge, minPrice, maxPrice, nationalityId, minOvr, maxOvr, attributes]);

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
      [attrId]: prev[attrId] || 70, // Giá trị mặc định là 70
    }));
  };

  const handleRemoveAttribute = (attrId: string) => {
    const next = { ...attributes };
    delete next[attrId];
    setAttributes(next);
  };

  const handleReset = () => {
    setStatus('ALL');
    setPosition('');
    setMinAge(undefined);
    setMaxAge(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setNationalityId('');
    setMinOvr(undefined);
    setMaxOvr(undefined);
    setAttributes({});
    setCountrySearchText('');
    onReset();
  };

  const handleApply = () => {
    onApply({
      status,
      position,
      minAge,
      maxAge,
      minPrice,
      maxPrice,
      nationalityId: nationalityId || undefined,
      minOvr,
      maxOvr,
      attributes,
    });
    onClose();
  };

  // Group attributes by category for dropdown
  const groupedAttributes = {
    PHYSICAL: allAttributes.filter((a) => a.category === 'PHYSICAL'),
    TECHNICAL: allAttributes.filter((a) => a.category === 'TECHNICAL'),
    MENTAL: allAttributes.filter((a) => a.category === 'MENTAL'),
    GOALKEEPING: allAttributes.filter((a) => a.category === 'GOALKEEPING'),
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
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.15)',
              }}
            >
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)', color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>{t('skill_modal.title', 'Bộ Lọc Nâng Cao & Kỹ Năng')}</span>
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
                {t('skill_modal.subtitle', 'Thiết lập tiêu chuẩn tuyển trạch chi tiết theo 40 chỉ số FM, tuổi, giá và quốc tịch')}
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

        {/* 2. Body Cuộn Duy Nhất (Single Clean Daylight View) */}
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
          {/* SECTION 1: TÌNH TRẠNG & VỊ TRÍ THI ĐẤU */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)', color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '6px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <UserCheck size={16} />
              </div>
              <span>{t('skill_modal.section_status_position', '1. Tình Trạng & Vị Trí Thi Đấu')}</span>
            </div>

            {/* Status Pills */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.45rem' }}>
                {t('skill_modal.status_label', 'Tình trạng chuyển nhượng')}:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { value: 'ALL', label: t('common.all_statuses', 'Tất cả trạng thái'), activeBg: '#f1f5f9', activeBorder: '#94a3b8', activeColor: '#0f172a' },
                  { value: 'FREE', label: `🟢 ${t('transfers.status_free', 'Tự do (Free Agent)')}`, activeBg: '#dcfce7', activeBorder: '#16a34a', activeColor: '#15803d' },
                  { value: 'LOAN', label: `🟡 ${t('transfers.status_loan', 'Cho mượn (Loan)')}`, activeBg: '#fef3c7', activeBorder: '#d97706', activeColor: '#b45309' },
                  { value: 'TRANSFER', label: `🔵 ${t('market.status_transfer', 'Niêm yết bán (Transfer)')}`, activeBg: '#dbeafe', activeBorder: '#2563eb', activeColor: '#1d4ed8' },
                ].map((st) => {
                  const isSelected = status === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setStatus(st.value as any)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: isSelected ? `2px solid ${st.activeBorder}` : '1px solid #cbd5e1',
                        background: isSelected ? st.activeBg : '#ffffff',
                        color: isSelected ? st.activeColor : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(0, 0, 0, 0.06)' : 'none',
                      }}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Position Selector */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.45rem' }}>
                {t('skill_modal.position_label', 'Vị trí thi đấu')}:
              </label>

              {/* Tuyến chính (Lines) */}
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                {[
                  { code: '', label: t('common.all_positions', 'Tất cả vị trí'), color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
                  { code: 'GK', label: t('pos.gk', 'Thủ môn (GK)'), color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
                  { code: 'DEF', label: t('pos.def', 'Hậu vệ (DEF)'), color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                  { code: 'MID', label: t('pos.mid', 'Tiền vệ (MID)'), color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
                  { code: 'ATT', label: t('pos.att', 'Tiền đạo (ATT)'), color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                ].map((p) => {
                  const isSelected = position === p.code;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setPosition(p.code)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '7px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: isSelected ? `2px solid ${p.color}` : `1px solid ${p.border || '#e2e8f0'}`,
                        background: isSelected ? p.bg : '#ffffff',
                        color: isSelected ? p.color : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Vị trí chi tiết (Specific Roles) */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'].map((posCode) => {
                  const isSelected = position === posCode;
                  return (
                    <button
                      key={posCode}
                      type="button"
                      onClick={() => setPosition(isSelected ? '' : posCode)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                        border: isSelected ? '1px solid #16a34a' : '1px solid #cbd5e1',
                        background: isSelected ? '#16a34a' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(22, 163, 74, 0.25)' : 'none',
                      }}
                    >
                      {posCode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: QUỐC GIA & THÔNG SỐ CƠ BẢN (TUỔI, OVR, GIÁ) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)', color: '#0f172a', marginBottom: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Globe size={16} />
              </div>
              <span>{t('skill_modal.section_general', '2. Quốc Gia & Thông Số Cơ Bản')}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              {/* Quốc Gia (Searchable Input) */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('skill_modal.nationality_label', 'Quốc tịch / Quốc gia')}:
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
                        placeholder={t('skill_modal.search_country_placeholder', 'Nhập tìm quốc gia (vd: Việt Nam, Anh, Pháp...)')}
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
                  {t('skill_modal.ovr_range_label', 'Chỉ số OVR (Tổng thể)')}:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min={40}
                    max={99}
                    placeholder={`${t('common.min', 'Tối thiểu')} (40)`}
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
                  {t('skill_modal.age_range_label', 'Độ tuổi (Năm)')}:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min={15}
                    max={45}
                    placeholder={`${t('common.min', 'Tối thiểu')} (15)`}
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
                    min={15}
                    max={45}
                    placeholder={`${t('common.max', 'Tối đa')} (45)`}
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

              {/* Mức giá (Min - Max) */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                  {t('skill_modal.price_range_label', 'Giá chuyển nhượng (€)')}:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step={500000}
                    placeholder={`${t('common.min', 'Tối thiểu')} (€)`}
                    value={minPrice ?? ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
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
                    step={500000}
                    placeholder={`${t('common.max', 'Tối đa')} (€)`}
                    value={maxPrice ?? ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
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

          {/* SECTION 3: YÊU CẦU CHỈ SỐ KỸ NĂNG */}
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
              <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 26, height: 26, borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                  <Zap size={16} />
                </div>
                <span>{t('skill_modal.section_attributes', '3. Lọc Chỉ Số Kỹ Năng Chi Tiết (Attributes)')}</span>
                {selectedAttrIds.length > 0 && (
                  <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)' }}>
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
                    border: '1.5px dashed #16a34a',
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="" disabled>
                    ➕ {t('skill_modal.select_skill_to_add', 'Chọn kỹ năng để thêm vào bộ lọc...')}
                  </option>

                  <optgroup label={`⚡ ${t('skill_modal.tab_physical', 'Thể Chất (Physical)')}`}>
                    {groupedAttributes.PHYSICAL.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code)} ({a.code}) {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label={`🎯 ${t('skill_modal.tab_tech', 'Kỹ Thuật (Technical)')}`}>
                    {groupedAttributes.TECHNICAL.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code)} ({a.code}) {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label={`🧠 ${t('skill_modal.tab_mental', 'Tinh Thần (Mental)')}`}>
                    {groupedAttributes.MENTAL.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code)} ({a.code}) {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label={`🧤 ${t('skill_modal.tab_gk', 'Thủ Môn (Goalkeeping)')}`}>
                    {groupedAttributes.GOALKEEPING.map((a) => (
                      <option key={a.id} value={a.id} disabled={Boolean(attributes[a.id])}>
                        {getAttrName(a.code)} ({a.code}) {attributes[a.id] ? `(${t('skill_modal.already_selected', '✓ Đã chọn')})` : ''}
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
                {t('skill_modal.no_skill_selected_hint', 'Chưa có kỹ năng nào được chọn. Hãy chọn một kỹ năng từ menu trên để đặt yêu cầu điểm số tối thiểu (ví dụ: Tốc độ ≥ 80, Dứt điểm ≥ 75).')}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '0.75rem' }}>
                {selectedAttrIds.map((attrId) => {
                  const attrObj = allAttributes.find((a) => String(a.id) === String(attrId));
                  const currentVal = attributes[attrId] || 70;
                  const code = attrObj?.code || 'SKILL';
                  const name = attrObj ? getAttrName(attrObj.code) : code;
                  const category = attrObj?.category || 'PHYSICAL';

                  const categoryColor =
                    category === 'PHYSICAL'
                      ? '#ea580c'
                      : category === 'TECHNICAL'
                      ? '#0284c7'
                      : category === 'MENTAL'
                      ? '#7c3aed'
                      : '#d97706';

                  const categoryBg =
                    category === 'PHYSICAL'
                      ? '#fff7ed'
                      : category === 'TECHNICAL'
                      ? '#f0f9ff'
                      : category === 'MENTAL'
                      ? '#f5f3ff'
                      : '#fffbeb';

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
                            {code}
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
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontFamily: 'var(--font-game, "Chakra Petch", sans-serif)',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 163, 74, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
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
