import React from 'react';
import { ArrowUp, ArrowDown, Layers } from 'lucide-react';
import { Competition } from '../../types';

interface TierNavigatorProps {
  currentTier?: number | null;
  domesticComps: Competition[];
  onSwitchTier: (tier: number) => void;
  groups?: Array<{
    id?: string | number;
    name?: string;
    standings?: any[];
  }>;
  selectedGroupIdx: number;
  onSelectGroupIdx: (idx: number) => void;
  currentClubId?: string;
  activeTab: 'table' | 'teams' | 'stats';
}

export const TierNavigator: React.FC<TierNavigatorProps> = ({
  currentTier,
  domesticComps,
  onSwitchTier,
  groups,
  selectedGroupIdx,
  onSelectGroupIdx,
  currentClubId,
  activeTab,
}) => {
  return (
    <>
      {/* TIER STEPPER CONTROLS (HẠ CẤP / LÊN CẤP CHO GIẢI ĐẤU LEAGUE QUỐC NỘI) */}
      {currentTier && (
        <div className="standings-tier-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Điều Hướng Cấp Độ:
            </span>
            <button
              type="button"
              className="tier-step-btn"
              disabled={currentTier <= 1}
              onClick={() => onSwitchTier(currentTier - 1)}
              title="Xem giải đấu hạng cao hơn"
            >
              <ArrowUp size={16} />
              <span>Lên Cấp {currentTier > 1 ? `(Tier ${currentTier - 1})` : ''}</span>
            </button>
          </div>

          <div className="tier-pills-group">
            {[1, 2, 3, 4].map((tNum) => {
              const compInTier = domesticComps.find((c) => c.tier === tNum);
              const isAct = currentTier === tNum;
              const label =
                tNum === 1
                  ? 'Tier 1 - VĐQG'
                  : tNum === 2
                  ? 'Tier 2 - Hạng Nhất (2 Bảng)'
                  : tNum === 3
                  ? 'Tier 3 - Hạng Nhì (4 Bảng)'
                  : 'Tier 4 - Hạng Ba (8 Bảng)';
              return (
                <button
                  key={tNum}
                  type="button"
                  className={`tier-pill-item ${isAct ? 'active' : ''}`}
                  onClick={() => onSwitchTier(tNum)}
                  disabled={!compInTier}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div>
            <button
              type="button"
              className="tier-step-btn"
              disabled={currentTier >= 4}
              onClick={() => onSwitchTier(currentTier + 1)}
              title="Xem giải đấu hạng thấp hơn"
            >
              <span>Hạ Cấp {currentTier < 4 ? `(Tier ${currentTier + 1})` : ''}</span>
              <ArrowDown size={16} />
            </button>
          </div>
        </div>
      )}

      {/* GROUP SELECTOR BAR FOR MULTI-GROUP LEAGUES (TIER 2, 3, 4) */}
      {groups && groups.length > 0 && activeTab === 'table' && (
        <div className="group-tabs-container">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} />
            <span>Chọn Bảng Đấu:</span>
          </span>
          {groups.map((grp, idx) => {
            const hasMyClub = grp.standings?.some((s: any) => {
              const cId = s.club?.id || s.club_id;
              return cId && cId.toString() === currentClubId?.toString();
            });
            return (
              <button
                key={grp.id || idx}
                type="button"
                className={`group-tab-button ${selectedGroupIdx === idx ? 'active' : ''}`}
                onClick={() => onSelectGroupIdx(idx)}
                style={hasMyClub && selectedGroupIdx !== idx ? { borderColor: '#15803d', color: '#15803d', fontWeight: 800 } : {}}
              >
                {grp.name || `Bảng ${String.fromCharCode(65 + idx)}`}
                {hasMyClub && <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>★</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
