import React from 'react';
import { Dumbbell, Brain, Compass, HeartPulse } from 'lucide-react';
import { StaffDetailResponse, StaffAttributeItem } from '../../services/transfers.service';
import { AttributeProgressBar } from '../common/AttributeProgressBar';

interface Props {
  detail: StaffDetailResponse | null;
}

export const StaffSkillsTab: React.FC<Props> = ({ detail }) => {
  const renderAttributeGroup = (
    title: string,
    icon: React.ReactNode,
    color: string,
    attributes?: StaffAttributeItem[],
    emptyText: string = 'Chưa có dữ liệu chỉ số'
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
        'Huấn Luyện (Coaching)',
        <Dumbbell size={18} />,
        '#16a34a',
        detail?.groupedAttributes.coaching,
        'Chưa có dữ liệu chỉ số huấn luyện'
      )}

      {/* 2. Mental */}
      {renderAttributeGroup(
        'Tác Phong & Tinh Thần (Mental)',
        <Brain size={18} />,
        '#0284c7',
        detail?.groupedAttributes.mental,
        'Chưa có dữ liệu chỉ số tinh thần'
      )}

      {/* 3. Scouting */}
      {renderAttributeGroup(
        'Tuyển Trạch & Đánh Giá (Scouting)',
        <Compass size={18} />,
        '#7c3aed',
        detail?.groupedAttributes.scouting,
        'Chưa có dữ liệu chỉ số tuyển trạch'
      )}

      {/* 4. Medical */}
      {renderAttributeGroup(
        'Y Tế & Thể Lực (Medical)',
        <HeartPulse size={18} />,
        '#db2777',
        detail?.groupedAttributes.medical,
        'Chưa có dữ liệu chỉ số y tế'
      )}
    </div>
  );
};
