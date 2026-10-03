import React, { useState, useMemo } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Search, Shield, Zap, Target, Brain, Activity } from 'lucide-react';
import { FilterOptionsResponse } from '../../services/transfers.service';

export interface SkillFilterValues {
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

const ATTRIBUTE_VN_NAMES: Record<string, string> = {
  // PHYSICAL
  PAC: 'Tốc độ',
  ACC: 'Tăng tốc',
  STA: 'Thể lực',
  STR: 'Sức mạnh',
  AGI: 'Khéo léo',
  BAL: 'Thăng bằng',
  JUM: 'Bật nhảy',
  NAT: 'Thể chất tự nhiên',
  PWR: 'Lực sút',
  RES: 'Sức chịu đựng',
  // TECHNICAL
  FIN: 'Dứt điểm',
  DRI: 'Rê bóng',
  PAS: 'Chuyền bóng',
  TEC: 'Kỹ thuật',
  FIR: 'Chạm bước một',
  HEA: 'Đánh đầu',
  TAC: 'Tắc bóng',
  MAR: 'Kèm người',
  CRO: 'Tạt bóng',
  LSH: 'Sút xa',
  // MENTAL
  DEC: 'Ra quyết định',
  VIS: 'Tầm nhìn',
  CMP: 'Điềm tĩnh',
  ANT: 'Phán đoán',
  OTB: 'Chạy chỗ không bóng',
  POS: 'Chọn vị trí',
  WOR: 'Tinh thần thi đấu',
  DET: 'Quyết tâm',
  CON: 'Tập trung',
  LEA: 'Lãnh đạo',
  // GOALKEEPING
  REF: 'Phản xạ',
  HAN: 'Bắt bóng',
  AER: 'Không chiến GK',
  CMD: 'Chỉ huy vòng cấm',
  OOO: 'Đối mặt 1v1',
  KIC: 'Phát bóng',
  THR: 'Ném bóng',
  PUN: 'Đấm bóng',
  RUS: 'Lao ra cản phá',
  COM: 'Giao tiếp GK',
};

// Danh mục kỹ năng mặc định nếu API chưa kịp load
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
  const [activeTab, setActiveTab] = useState<'general' | 'PHYSICAL' | 'TECHNICAL' | 'MENTAL' | 'GOALKEEPING'>('general');
  const [minAge, setMinAge] = useState<number | undefined>(currentValues.minAge);
  const [maxAge, setMaxAge] = useState<number | undefined>(currentValues.maxAge);
  const [minPrice, setMinPrice] = useState<number | undefined>(currentValues.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(currentValues.maxPrice);
  const [nationalityId, setNationalityId] = useState<string>(currentValues.nationalityId || '');
  const [minOvr, setMinOvr] = useState<number | undefined>(currentValues.minOvr);
  const [maxOvr, setMaxOvr] = useState<number | undefined>(currentValues.maxOvr);
  const [attributes, setAttributes] = useState<Record<string, number>>({ ...currentValues.attributes });
  const [searchSkillQuery, setSearchSkillQuery] = useState('');

  // Sync state khi modal mở
  React.useEffect(() => {
    if (isOpen) {
      setMinAge(currentValues.minAge);
      setMaxAge(currentValues.maxAge);
      setMinPrice(currentValues.minPrice);
      setMaxPrice(currentValues.maxPrice);
      setNationalityId(currentValues.nationalityId || '');
      setMinOvr(currentValues.minOvr);
      setMaxOvr(currentValues.maxOvr);
      setAttributes({ ...currentValues.attributes });
    }
  }, [isOpen, currentValues]);

  const allAttributes = filterOptions?.attributes && filterOptions.attributes.length > 0
    ? filterOptions.attributes
    : DEFAULT_ATTRIBUTES;

  const countries = filterOptions?.countries || [];

  // Tính số lượng bộ lọc đang kích hoạt
  const activeCount = useMemo(() => {
    let count = 0;
    if (minAge !== undefined || maxAge !== undefined) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    if (nationalityId) count++;
    if (minOvr !== undefined || maxOvr !== undefined) count++;
    for (const val of Object.values(attributes)) {
      if (val > 0) count++;
    }
    return count;
  }, [minAge, maxAge, minPrice, maxPrice, nationalityId, minOvr, maxOvr, attributes]);

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

  const handleReset = () => {
    setMinAge(undefined);
    setMaxAge(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setNationalityId('');
    setMinOvr(undefined);
    setMaxOvr(undefined);
    setAttributes({});
    onReset();
  };

  const handleApply = () => {
    onApply({
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

  const currentCategoryAttributes = allAttributes.filter((a) => {
    if (searchSkillQuery.trim()) {
      const q = searchSkillQuery.toLowerCase();
      const vnName = (ATTRIBUTE_VN_NAMES[a.code] || '').toLowerCase();
      return a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || vnName.includes(q);
    }
    return a.category === activeTab;
  });

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        margin: 0,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(22, 163, 74, 0.25)',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SlidersHorizontal size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Bộ Lọc Nâng Cao & Kỹ Năng
                {activeCount > 0 && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: '#eab308',
                      color: '#713f12',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {activeCount} đang chọn
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#bbf7d0', marginTop: '2px' }}>
                Thiết lập tiêu chuẩn tuyển trạch chi tiết theo 40 chỉ số FM, tuổi, giá và quốc tịch
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'background 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation & Search bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActiveTab('general'); setSearchSkillQuery(''); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: activeTab === 'general' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'general' ? '#fff' : '#475569',
                transition: 'all 0.2s',
              }}
            >
              <Activity size={15} />
              Cơ Bản & Giá
            </button>

            <button
              onClick={() => { setActiveTab('PHYSICAL'); setSearchSkillQuery(''); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: activeTab === 'PHYSICAL' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'PHYSICAL' ? '#fff' : '#475569',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={15} />
              Thể Chất (Physical)
            </button>

            <button
              onClick={() => { setActiveTab('TECHNICAL'); setSearchSkillQuery(''); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: activeTab === 'TECHNICAL' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'TECHNICAL' ? '#fff' : '#475569',
                transition: 'all 0.2s',
              }}
            >
              <Target size={15} />
              Kỹ Thuật (Technical)
            </button>

            <button
              onClick={() => { setActiveTab('MENTAL'); setSearchSkillQuery(''); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: activeTab === 'MENTAL' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'MENTAL' ? '#fff' : '#475569',
                transition: 'all 0.2s',
              }}
            >
              <Brain size={15} />
              Tinh Thần (Mental)
            </button>

            <button
              onClick={() => { setActiveTab('GOALKEEPING'); setSearchSkillQuery(''); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: activeTab === 'GOALKEEPING' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'GOALKEEPING' ? '#fff' : '#475569',
                transition: 'all 0.2s',
              }}
            >
              <Shield size={15} />
              Thủ Môn (GK)
            </button>
          </div>

          {/* Quick search skill */}
          {activeTab !== 'general' && (
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tìm kỹ năng..."
                value={searchSkillQuery}
                onChange={(e) => setSearchSkillQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.6rem 0.35rem 2rem',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* Modal Body: Scrollable */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, minHeight: '360px' }}>
          {/* TAB 1: GENERAL (Tuổi, Giá, Quốc tịch, OVR) */}
          {activeTab === 'general' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {/* Section: Độ Tuổi */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    📅 Độ Tuổi Cầu Thủ
                  </label>
                  {(minAge || maxAge) && (
                    <button
                      onClick={() => { setMinAge(undefined); setMaxAge(undefined); }}
                      style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Từ (tuổi)</span>
                    <input
                      type="number"
                      min={15}
                      max={45}
                      placeholder="Tối thiểu (15)"
                      value={minAge ?? ''}
                      onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : undefined)}
                      className="input-text"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <span style={{ marginTop: '1rem', color: '#94a3b8' }}>-</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Đến (tuổi)</span>
                    <input
                      type="number"
                      min={15}
                      max={45}
                      placeholder="Tối đa (45)"
                      value={maxAge ?? ''}
                      onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : undefined)}
                      className="input-text"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinAge(16); setMaxAge(21); }}
                  >
                    U21 (16-21)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinAge(22); setMaxAge(25); }}
                  >
                    Đang chín (22-25)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinAge(26); setMaxAge(30); }}
                  >
                    Đỉnh cao (26-30)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinAge(31); setMaxAge(40); }}
                  >
                    Kinh nghiệm (31+)
                  </button>
                </div>
              </div>

              {/* Section: Giá Chuyển Nhượng */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    💰 Giá Thị Trường (€)
                  </label>
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={() => { setMinPrice(undefined); setMaxPrice(undefined); }}
                      style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Giá từ (€)</span>
                    <input
                      type="number"
                      min={0}
                      step={500000}
                      placeholder="0"
                      value={minPrice ?? ''}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="input-text"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <span style={{ marginTop: '1rem', color: '#94a3b8' }}>-</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Giá đến (€)</span>
                    <input
                      type="number"
                      min={0}
                      step={1000000}
                      placeholder="Không giới hạn"
                      value={maxPrice ?? ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="input-text"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                {/* Quick Presets for Price */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinPrice(0); setMaxPrice(1000000); }}
                  >
                    Dưới €1M
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinPrice(1000000); setMaxPrice(10000000); }}
                  >
                    €1M - €10M
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinPrice(10000000); setMaxPrice(50000000); }}
                  >
                    €10M - €50M
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinPrice(50000000); setMaxPrice(undefined); }}
                  >
                    Bom tấn &gt; €50M
                  </button>
                </div>
              </div>

              {/* Section: Quốc Tịch */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    🌍 Quốc Tịch Cầu Thủ
                  </label>
                  {nationalityId && (
                    <button
                      onClick={() => setNationalityId('')}
                      style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <select
                  value={nationalityId}
                  onChange={(e) => setNationalityId(e.target.value)}
                  className="input-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Tất cả các quốc gia ({countries.length > 0 ? countries.length : '96'} quốc gia)</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Lọc chính xác các cầu thủ mang quốc tịch đã chọn trong hệ thống.
                </div>
              </div>

              {/* Section: Chỉ Số Chung (OVR) */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    ⭐ Điểm Tổng Quát (OVR)
                  </label>
                  {(minOvr || maxOvr) && (
                    <button
                      onClick={() => { setMinOvr(undefined); setMaxOvr(undefined); }}
                      style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>OVR từ</span>
                    <input
                      type="number"
                      min={50}
                      max={99}
                      placeholder="50"
                      value={minOvr ?? ''}
                      onChange={(e) => setMinOvr(e.target.value ? Number(e.target.value) : undefined)}
                      className="input-text"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <span style={{ marginTop: '1rem', color: '#94a3b8' }}>-</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>OVR đến</span>
                    <input
                      type="number"
                      min={50}
                      max={99}
                      placeholder="99"
                      value={maxOvr ?? ''}
                      onChange={(e) => setMaxOvr(e.target.value ? Number(e.target.value) : undefined)}
                      className="input-text"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                {/* Quick Presets for OVR */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinOvr(70); setMaxOvr(undefined); }}
                  >
                    70+ (Khá)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinOvr(75); setMaxOvr(undefined); }}
                  >
                    75+ (Tốt)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinOvr(80); setMaxOvr(undefined); }}
                  >
                    80+ (Xuất sắc)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => { setMinOvr(85); setMaxOvr(undefined); }}
                  >
                    85+ (Siêu sao)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2, 3, 4, 5: ATTRIBUTES */}
          {activeTab !== 'general' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {currentCategoryAttributes.map((attr) => {
                  const val = attributes[attr.id] || 0;
                  const isActive = val > 0;
                  const vnName = ATTRIBUTE_VN_NAMES[attr.code] || attr.name;

                  return (
                    <div
                      key={attr.id}
                      style={{
                        padding: '0.9rem',
                        borderRadius: '10px',
                        background: isActive ? '#f0fdf4' : '#ffffff',
                        border: isActive ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                        boxShadow: isActive ? '0 4px 12px rgba(22, 163, 74, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isActive ? '#15803d' : '#1e293b' }}>
                            {vnName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {attr.code} - {attr.name}
                          </div>
                        </div>

                        {isActive ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              ≥ {val}
                            </span>
                            <button
                              onClick={() => handleAttrChange(attr.id, 0)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: '2px',
                              }}
                              title="Xóa chỉ số này"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bất kỳ</span>
                        )}
                      </div>

                      {/* Slider & Quick selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="range"
                          min={0}
                          max={99}
                          value={val}
                          onChange={(e) => handleAttrChange(attr.id, Number(e.target.value))}
                          style={{
                            flex: 1,
                            accentColor: '#16a34a',
                            cursor: 'pointer',
                          }}
                        />
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={val > 0 ? val : ''}
                          placeholder="0"
                          onChange={(e) => handleAttrChange(attr.id, e.target.value ? Number(e.target.value) : 0)}
                          style={{
                            width: 44,
                            padding: '2px 4px',
                            textAlign: 'center',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                          }}
                        />
                      </div>

                      {/* Presets: 60, 70, 80, 85 */}
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        {[65, 75, 80, 85].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAttrChange(attr.id, preset)}
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              border: val === preset ? '1px solid #16a34a' : '1px solid #e2e8f0',
                              background: val === preset ? '#dcfce7' : '#f8fafc',
                              color: val === preset ? '#15803d' : '#64748b',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {preset}+
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentCategoryAttributes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Không tìm thấy kỹ năng nào khớp với từ khóa "{searchSkillQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div
          style={{
            padding: '1rem 1.75rem',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleReset}
              className="btn btn-sm btn-outline flex-center"
              style={{ gap: '0.35rem', color: '#64748b' }}
            >
              <RotateCcw size={15} />
              Xóa bộ lọc
            </button>
            {activeCount > 0 && (
              <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                ✓ Đang chọn {activeCount} tiêu chí lọc
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} className="btn btn-sm btn-outline">
              Hủy
            </button>
            <button onClick={handleApply} className="btn btn-sm btn-primary flex-center" style={{ gap: '0.35rem' }}>
              <Check size={16} />
              Áp Dụng Bộ Lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
