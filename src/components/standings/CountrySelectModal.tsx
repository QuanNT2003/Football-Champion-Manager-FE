import React, { useState } from 'react';
import { CompetitionCountry } from '../../services/competitions.service';
import { X, Search, Globe2, Flag } from 'lucide-react';

interface CountrySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (c: CompetitionCountry) => void;
  viewingCountryId: string;
  allCountries: CompetitionCountry[];
  loading: boolean;
}

export const CountrySelectModal: React.FC<CountrySelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCountry,
  viewingCountryId,
  allCountries,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredCountries = allCountries.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchContinent =
      selectedContinent === 'ALL' ||
      (selectedContinent === 'UEFA' && (c.confederation?.code === 'UEFA' || (c as any).continent === 'Europe')) ||
      (selectedContinent === 'AFC' && (c.confederation?.code === 'AFC' || (c as any).continent === 'Asia')) ||
      (selectedContinent === 'AMERICAS' &&
        (c.confederation?.code === 'CONMEBOL' ||
          c.confederation?.code === 'CONCACAF' ||
          (c as any).continent === 'South America' ||
          (c as any).continent === 'North America')) ||
      (selectedContinent === 'CAF' && (c.confederation?.code === 'CAF' || (c as any).continent === 'Africa'));
    return matchSearch && matchContinent;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe2 size={24} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Khám Phá Giải Đấu Toàn Cầu
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                Hệ thống 96 Quốc Gia Tinh Hoa (UEFA, AFC, AMERICAS, CAF)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Controls */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', top: '12px' }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm quốc gia hoặc mã (VD: Vietnam, Anh, VIE, ENG...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'ALL', label: 'Tất Cả (96)' },
              { id: 'UEFA', label: 'Châu Âu - UEFA (32)' },
              { id: 'AFC', label: 'Châu Á - AFC (32)' },
              { id: 'AMERICAS', label: 'Châu Mỹ (16)' },
              { id: 'CAF', label: 'Châu Phi - CAF (16)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedContinent(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedContinent === tab.id ? '#15803d' : '#e2e8f0',
                  color: selectedContinent === tab.id ? '#ffffff' : '#475569',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
              <p>Đang tải danh sách quốc gia...</p>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <p>Không tìm thấy quốc gia phù hợp với từ khóa.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '10px',
              }}
            >
              {filteredCountries.map((c) => {
                const isSelected = c.id === viewingCountryId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCountry(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #15803d' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff';
                    }}
                  >
                    {c.flag_url ? (
                      <img
                        src={c.flag_url}
                        alt={c.name}
                        style={{
                          width: '28px',
                          height: '20px',
                          borderRadius: '4px',
                          objectFit: 'cover',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                    ) : (
                      <Flag size={20} color="#64748b" />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#15803d' : '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {c.confederation?.name || (c as any).continent || 'Liên Đoàn'}
                      </div>
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: '#15803d',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontWeight: 700,
                        }}
                      >
                        Đang xem
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
