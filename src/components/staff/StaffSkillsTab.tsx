import { useTranslation } from '../../i18n';
import React from 'react';
import { Dumbbell, Brain, Compass, HeartPulse } from 'lucide-react';
import { StaffDetailResponse, StaffAttributeItem } from '../../services/transfers.service';
import { AttributeProgressBar } from '../common/AttributeProgressBar';

interface Props {
  detail: StaffDetailResponse | null;
}

export const StaffSkillsTab: React.FC<Props> = ({ detail }) => {
  const { t } = useTranslation();
  const renderAttributeGroup = (
    title: string,
    icon: React.ReactNode,
    color: string,
    attributes?: StaffAttributeItem[],
    emptyText: string = t('staff.no_skills')
  ) => (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.15rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color, fontWeight: 800 }}>
        {icon}
        <span>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {attributes && attributes.length > 0 ? (
          attributes.map((attr) => (
            <AttributeProgressBar
              key={attr.id}
              name={attr.name}
              value={attr.value}
              isKey={attr.is_key}
              description={attr.description}
            />
          ))
        ) : (
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{emptyText}</div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
      {/* 1. Coaching */}
      {renderAttributeGroup(
        t('staff.skills_coaching', 'Huấn Luyện (Coaching)'),
        <Dumbbell size={18} />,
        '#16a34a',
        detail?.groupedAttributes.coaching,
        t('staff.no_coaching_skills', 'Chưa có dữ liệu chỉ số huấn luyện')
      )}

      {/* 2. Mental */}
      {renderAttributeGroup(
        t('staff.skills_mental', 'Tác Phong & Tinh Thần (Mental)'),
        <Brain size={18} />,
        '#0284c7',
        detail?.groupedAttributes.mental,
        t('staff.no_mental_skills', 'Chưa có dữ liệu chỉ số tinh thần')
      )}

      {/* 3. Scouting */}
      {renderAttributeGroup(
        t('staff.skills_scouting', 'Tuyển Trạch & Đánh Giá (Scouting)'),
        <Compass size={18} />,
        '#7c3aed',
        detail?.groupedAttributes.scouting,
        t('staff.no_scouting_skills', 'Chưa có dữ liệu chỉ số tuyển trạch')
      )}

      {/* 4. Medical */}
      {renderAttributeGroup(
        t('staff.skills_medical', 'Y Tế & Thể Lực (Medical)'),
        <HeartPulse size={18} />,
        '#db2777',
        detail?.groupedAttributes.medical,
        t('staff.no_medical_skills', 'Chưa có dữ liệu chỉ số y tế')
      )}
    </div>
  );
};
