import React from 'react';
import { useTranslation } from '../../i18n';
import { Dumbbell, Brain, Compass, HeartPulse } from 'lucide-react';
import { StaffDetailResponse, StaffAttributeItem } from '../../services/transfers.service';
import { FmAttributeRow } from '../common/FmAttributeRow';

interface Props {
  detail: StaffDetailResponse | null;
}

export const StaffSkillsTab: React.FC<Props> = ({ detail }) => {
  const { t } = useTranslation();

  const renderAttributeColumn = (
    title: string,
    icon: React.ReactNode,
    color: string,
    attributes?: StaffAttributeItem[],
    emptyText: string = t('staff.no_skills', 'Chưa có dữ liệu chỉ số')
  ) => (
    <div className="fm-attr-column">
      <div className="fm-attr-col-header" style={{ color }}>
        <span className="fm-attr-col-title">
          {icon}
          <span>{title}</span>
        </span>
        <span className="fm-attr-col-count">{attributes ? attributes.length : 0}</span>
      </div>

      <div className="fm-attr-rows-list">
        {attributes && attributes.length > 0 ? (
          attributes.map((attr) => {
            const attrKey = attr.code ? attr.code.toLowerCase() : '';
            const translatedName = attrKey ? t(`staff.attr_${attrKey}`, attr.name) : attr.name;
            const translatedDesc = attrKey ? t(`staff.attr_desc_${attrKey}`, attr.description || '') : attr.description;

            return (
              <FmAttributeRow
                key={attr.id}
                name={translatedName}
                value={attr.value}
                code={attr.code}
                isKey={attr.is_key}
                multiplier={attr.multiplier}
                highlightType={attr.is_key ? 'primary' : attr.multiplier && attr.multiplier > 1 ? 'secondary' : 'none'}
                description={translatedDesc}
              />
            );
          })
        ) : (
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '12px 8px', textAlign: 'center' }}>
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );

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

      {/* 4 Multi-Column Staff Categories */}
      <div className="fm-attr-columns-wrap" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
        {/* 1. Coaching */}
        {renderAttributeColumn(
          t('staff.skills_coaching', 'Huấn Luyện'),
          <Dumbbell size={16} />,
          '#16a34a',
          detail?.groupedAttributes?.coaching,
          t('staff.no_coaching_skills', 'Chưa có dữ liệu chỉ số huấn luyện')
        )}

        {/* 2. Mental */}
        {renderAttributeColumn(
          t('staff.skills_mental', 'Tác Phong & Tinh Thần'),
          <Brain size={16} />,
          '#0284c7',
          detail?.groupedAttributes?.mental,
          t('staff.no_mental_skills', 'Chưa có dữ liệu chỉ số tinh thần')
        )}

        {/* 3. Scouting */}
        {renderAttributeColumn(
          t('staff.skills_scouting', 'Tuyển Trạch & Đánh Giá'),
          <Compass size={16} />,
          '#7c3aed',
          detail?.groupedAttributes?.scouting,
          t('staff.no_scouting_skills', 'Chưa có dữ liệu chỉ số tuyển trạch')
        )}

        {/* 4. Medical */}
        {renderAttributeColumn(
          t('staff.skills_medical', 'Y Tế & Thể Lực'),
          <HeartPulse size={16} />,
          '#db2777',
          detail?.groupedAttributes?.medical,
          t('staff.no_medical_skills', 'Chưa có dữ liệu chỉ số y tế')
        )}
      </div>
    </div>
  );
};
