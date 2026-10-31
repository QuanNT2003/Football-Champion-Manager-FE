import React from 'react';
import { useTranslation } from '../../i18n';
import { Shield, Dumbbell, Brain, Award } from 'lucide-react';
import { PlayerDetailData, PlayerSkillItem } from '../../types';
import { FmAttributeRow } from '../common/FmAttributeRow';

interface Props {
  detail: PlayerDetailData | null;
  pPosCode: string;
  compared?: boolean;
  setCompared?: (val: boolean) => void;
  skillCategory?: any;
  setSkillCategory?: (cat: any) => void;
  displayedSkills?: any;
}

export const PlayerSkillsTab: React.FC<Props> = ({
  detail,
  pPosCode,
}) => {
  const { t } = useTranslation();

  // Extract categories from detail with safe fallbacks
  const categories = detail?.skills?.categories;
  const allAttrs = detail?.skills?.all_attributes || [];

  const technicalAttrs: PlayerSkillItem[] =
    categories?.technical && categories.technical.length > 0
      ? categories.technical
      : allAttrs.filter((a) => a.category === 'TECHNICAL');

  const mentalAttrs: PlayerSkillItem[] =
    categories?.mental && categories.mental.length > 0
      ? categories.mental
      : allAttrs.filter((a) => a.category === 'MENTAL');

  const physicalAttrs: PlayerSkillItem[] =
    categories?.physical && categories.physical.length > 0
      ? categories.physical
      : allAttrs.filter((a) => a.category === 'PHYSICAL');

  const goalkeepingAttrs: PlayerSkillItem[] =
    categories?.goalkeeping && categories.goalkeeping.length > 0
      ? categories.goalkeeping
      : allAttrs.filter((a) => a.category === 'GOALKEEPING');

  const isGK =
    pPosCode === 'GK' ||
    goalkeepingAttrs.some((g) => g.value > 0 || g.is_key);

  // Helper to translate attribute name & description
  const renderAttributeList = (items: PlayerSkillItem[]) => {
    return items.map((sk) => {
      const rawCode = (sk.code || '').toLowerCase();
      const strippedCode = rawCode.startsWith('gk_') ? rawCode.slice(3) : rawCode;
      const prefixedCode = rawCode.startsWith('gk_') ? rawCode : `gk_${rawCode}`;

      const translatedName = t(
        `player.attr_${rawCode}`,
        t(`player.attr_${prefixedCode}`, t(`player.attr_${strippedCode}`, sk.name))
      );
      const translatedDesc = t(
        `player.attr_desc_${rawCode}`,
        t(`player.attr_desc_${prefixedCode}`, t(`player.attr_desc_${strippedCode}`, sk.description || ''))
      );

      return (
        <FmAttributeRow
          key={sk.id || sk.code}
          name={translatedName}
          value={sk.value}
          code={sk.code}
          isKey={sk.is_key}
          multiplier={sk.multiplier}
          highlightType={sk.is_key ? 'primary' : sk.multiplier && sk.multiplier > 1 ? 'secondary' : 'none'}
          description={translatedDesc}
          potentialValue={sk.potential_value}
          growth={sk.growth}
        />
      );
    });
  };

  // Calculate totals
  const totalTechnical = technicalAttrs.reduce((acc, a) => acc + (a.value || 0), 0);
  const totalMental = mentalAttrs.reduce((acc, a) => acc + (a.value || 0), 0);
  const totalPhysical = physicalAttrs.reduce((acc, a) => acc + (a.value || 0), 0);
  const totalGk = goalkeepingAttrs.reduce((acc, a) => acc + (a.value || 0), 0);
  const grandTotal = totalTechnical + totalMental + totalPhysical + (isGK ? totalGk : 0);

  return (
    <div className="fm-skills-container">
      {/* Legend Bar */}
      <div className="fm-skills-legend-bar">
        <span className="fm-legend-item">
          <span className="fm-legend-bar fm-legend-primary" />
          <span>{t('skills.legend_key', 'Chỉ số cốt lõi vị trí')}</span>
        </span>
        <span className="fm-legend-item">
          <span className="fm-legend-bar fm-legend-secondary" />
          <span>{t('skills.legend_preferred', 'Chỉ số bổ trợ')}</span>
        </span>
      </div>

      {/* Multi-Column Categories Layout */}
      <div
        className="fm-attr-columns-wrap"
        style={{
          gridTemplateColumns: isGK
            ? 'repeat(auto-fit, minmax(220px, 1fr))'
            : 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {/* If Goalkeeper, put Goalkeeping Column first */}
        {isGK && (
          <div className="fm-attr-column">
            <div className="fm-attr-col-header" style={{ color: '#db2777' }}>
              <span className="fm-attr-col-title">
                <Shield size={16} />
                <span>{t('skills.col_goalkeeping', 'Thủ Môn')}</span>
              </span>
              <span className="fm-attr-col-count">{goalkeepingAttrs.length}</span>
            </div>
            <div className="fm-attr-rows-list">
              {renderAttributeList(goalkeepingAttrs)}
            </div>
          </div>
        )}

        {/* 1. Technical Column */}
        <div className="fm-attr-column">
          <div className="fm-attr-col-header" style={{ color: '#d97706' }}>
            <span className="fm-attr-col-title">
              <Award size={16} />
              <span>{t('skills.col_technical', 'Kỹ Thuật')}</span>
            </span>
            <span className="fm-attr-col-count">{technicalAttrs.length}</span>
          </div>
          <div className="fm-attr-rows-list">
            {renderAttributeList(technicalAttrs)}
          </div>
        </div>

        {/* 2. Mental Column */}
        <div className="fm-attr-column">
          <div className="fm-attr-col-header" style={{ color: '#0284c7' }}>
            <span className="fm-attr-col-title">
              <Brain size={16} />
              <span>{t('skills.col_mental', 'Tâm Lý')}</span>
            </span>
            <span className="fm-attr-col-count">{mentalAttrs.length}</span>
          </div>
          <div className="fm-attr-rows-list">
            {renderAttributeList(mentalAttrs)}
          </div>
        </div>

        {/* 3. Physical Column */}
        <div className="fm-attr-column">
          <div className="fm-attr-col-header" style={{ color: '#16a34a' }}>
            <span className="fm-attr-col-title">
              <Dumbbell size={16} />
              <span>{t('skills.col_physical', 'Thể Chất')}</span>
            </span>
            <span className="fm-attr-col-count">{physicalAttrs.length}</span>
          </div>
          <div className="fm-attr-rows-list">
            {renderAttributeList(physicalAttrs)}
          </div>
        </div>
      </div>

      {/* Summary Total Points */}
      <div className="pm-skills-total-row">
        <span className="pm-total-label">
          {t('skills.total_points', 'Tổng điểm {label}:').replace('{label}', t('skills.all_attributes_title', 'Toàn bộ chỉ số'))}
        </span>
        <span className="pm-total-val">{grandTotal}</span>
        <span className="pm-calc-icon">🧮</span>
      </div>
    </div>
  );
};
