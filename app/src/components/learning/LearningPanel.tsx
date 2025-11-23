'use client';

import React, { useState } from 'react';
import type { KnowledgePoint } from '@/types';

interface LearningPanelProps {
  knowledgePoint: KnowledgePoint;
  onClose: () => void;
}

type TabType = 'overview' | 'knowledge' | 'practice' | 'tutor' | 'analytics';

export const LearningPanel: React.FC<LearningPanelProps> = ({ knowledgePoint, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>

      {/* Panel */}
      <div className="relative w-[700px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-blue-600 text-white flex-shrink-0">
          <h2 className="text-xl font-bold">{knowledgePoint.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 border-b-2 border-gray-200 flex-shrink-0">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon="📋"
            label="Tổng quan"
          />
          <TabButton
            active={activeTab === 'knowledge'}
            onClick={() => setActiveTab('knowledge')}
            icon="📚"
            label="Kiến thức"
          />
          <TabButton
            active={activeTab === 'practice'}
            onClick={() => setActiveTab('practice')}
            icon="🎯"
            label="Luyện tập"
          />
          <TabButton
            active={activeTab === 'tutor'}
            onClick={() => setActiveTab('tutor')}
            icon="🤖"
            label="Gia sư AI"
          />
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon="📊"
            label="Phân tích"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab kp={knowledgePoint} />}
          {activeTab === 'knowledge' && <KnowledgeTab kp={knowledgePoint} />}
          {activeTab === 'practice' && <PracticeTab kp={knowledgePoint} />}
          {activeTab === 'tutor' && <TutorTab kp={knowledgePoint} />}
          {activeTab === 'analytics' && <AnalyticsTab kp={knowledgePoint} />}
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-3 px-2 font-semibold text-sm transition-all border-b-3
      ${active
        ? 'text-blue-600 bg-white border-blue-600'
        : 'text-gray-600 bg-gray-50 border-transparent hover:bg-gray-100'
      }
    `}
  >
    <span className="mr-1">{icon}</span>
    {label}
  </button>
);

const OverviewTab: React.FC<{ kp: KnowledgePoint }> = ({ kp }) => (
  <div className="space-y-6">
    <Section title="🎯 Mục tiêu thành thạo" border="blue">
      <ul className="space-y-2">
        {kp.learning_objectives?.knowledge?.map((obj, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">→</span>
            <span>{obj}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 p-3 bg-green-50 border-l-3 border-green-500 rounded text-sm">
        <strong>✅ Tiêu chí đạt thành thạo:</strong> Đạt ≥80% độ chính xác
      </div>
    </Section>

    <Section title="🔗 Tiên quyết" border="purple">
      <div className="flex flex-wrap gap-2">
        <Badge color="blue">Khái niệm hàm số</Badge>
        <Badge color="blue">Hệ tọa độ Oxy</Badge>
      </div>
    </Section>

    <Section title="🚀 Kế tiếp" border="green">
      <div className="flex flex-wrap gap-2">
        <Badge color="green">Hàm số bậc hai</Badge>
        <Badge color="green">Phương trình bậc nhất</Badge>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        <strong>💡 Mở khóa khi:</strong> Đạt ≥80% độ chính xác
      </p>
    </Section>

    <Section title="📊 Phân tích thành thạo" border="orange">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Chính xác" value="78%" />
        <MetricCard label="Bài tập" value="7/10" />
        <MetricCard label="Thời gian" value="2.5h" />
      </div>
    </Section>
  </div>
);

const KnowledgeTab: React.FC<{ kp: KnowledgePoint }> = ({ kp }) => (
  <div className="space-y-6">
    <Section title="📖 Định nghĩa & Mục tiêu" border="blue">
      <p className="mb-4">
        <strong>Định nghĩa:</strong> {kp.description || 'Nội dung kiến thức chi tiết...'}
      </p>
      <div className="p-4 bg-blue-50 border-l-3 border-blue-600 rounded">
        <div className="font-semibold text-blue-600 mb-2">🎯 Mục tiêu thành thạo:</div>
        <ul className="space-y-1">
          {kp.learning_objectives?.skills?.map((skill, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-600">→</span>
              <span>{skill}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>

    <Section title="🔍 Tính chất và công thức" border="purple">
      <p className="text-gray-700">Nội dung chi tiết về tính chất và công thức...</p>
      <div className="mt-4 p-4 bg-purple-50 border-l-3 border-purple-600 rounded">
        <div className="font-semibold text-purple-600 mb-2">🔢 Ví dụ minh họa:</div>
        <p className="text-sm text-gray-700">Các ví dụ minh họa chi tiết...</p>
      </div>
    </Section>
  </div>
);

const PracticeTab: React.FC<{ kp: KnowledgePoint }> = ({ kp }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-3">
      <StatCard label="Câu hỏi" value="1/12" />
      <StatCard label="Điểm" value="85" />
      <StatCard label="Độ chính xác" value="78%" />
      <StatCard label="Thời gian" value="3:45" />
    </div>

    <div className="p-6 bg-white rounded-xl border-2 border-gray-200">
      <div className="inline-block px-3 py-1 bg-gray-600 text-white rounded-full text-xs font-semibold mb-4">
        Trung bình
      </div>
      <div className="text-lg font-medium text-gray-900 mb-6">
        Cho hàm số y = 3x - 2. Hệ số góc của đường thẳng này là bao nhiêu?
      </div>
      <div className="space-y-3">
        {['A. -2', 'B. 3', 'C. 1', 'D. 5'].map((option, idx) => (
          <button
            key={idx}
            className="w-full p-4 text-left border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
          ← Trước
        </button>
        <div className="flex gap-2">
          <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
            Bỏ qua
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Tiếp →
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TutorTab: React.FC<{ kp: KnowledgePoint }> = ({ kp }) => (
  <div className="space-y-4">
    <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-4 border border-blue-200">
      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-3xl flex-shrink-0">
        🤖
      </div>
      <div>
        <h3 className="font-bold text-blue-700">Pi-Assistant</h3>
        <p className="text-sm text-gray-600 italic">Gia sư AI chuyên về {kp.name}</p>
      </div>
    </div>

    <div className="flex-1 border border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
      <div className="p-3 bg-blue-50 border-l-3 border-blue-600 rounded">
        <strong>🤖 Pi-Assistant:</strong> Xin chào! Tôi là gia sư AI chuyên về <strong>{kp.name}</strong>.
        Tôi có thể giúp bạn hiểu rõ hơn về chủ đề này!
      </div>
      <div className="p-3 bg-blue-50 border-l-3 border-blue-600 rounded text-sm">
        Một số câu hỏi bạn có thể quan tâm:
        <br/>• &quot;Giải thích chi tiết hơn về khái niệm này&quot;
        <br/>• &quot;Cho tôi thêm ví dụ&quot;
        <br/>• &quot;Làm thế nào để áp dụng vào bài tập?&quot;
      </div>
    </div>

    <div className="flex gap-2">
      <textarea
        placeholder="Nhập câu hỏi của bạn..."
        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={2}
      />
      <button className="px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
        Gửi
      </button>
    </div>
  </div>
);

const AnalyticsTab: React.FC<{ kp: KnowledgePoint }> = ({ kp }) => (
  <div className="space-y-6">
    <Section title="📊 Phân tích chi tiết thành thạo" border="blue">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Tổng thể" value="73%" />
        <MetricCard label="Lý thuyết" value="85%" />
        <MetricCard label="Thực hành" value="65%" />
      </div>
    </Section>

    <Section title="📈 Lịch sử tiến độ" border="green">
      <div className="space-y-2">
        <ProgressBar label="Tuần 1" value={45} color="red" />
        <ProgressBar label="Tuần 2" value={60} color="orange" />
        <ProgressBar label="Tuần 3" value={73} color="blue" />
      </div>
    </Section>
  </div>
);

const Section: React.FC<{ title: string; border: string; children: React.ReactNode }> = ({
  title,
  border,
  children
}) => {
  const borderColors: Record<string, string> = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600',
    orange: 'border-orange-600',
  };

  return (
    <div className={`bg-white p-5 rounded-xl border-l-4 ${borderColors[border]} shadow-sm`}>
      <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
};

const Badge: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
  };

  return (
    <span className={`${colors[color]} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
      {children}
    </span>
  );
};

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
    <div className="text-xl font-bold text-blue-600">{value}</div>
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-200">
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-xl font-bold text-blue-600">{value}</div>
  </div>
);

const ProgressBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color
}) => {
  const colors: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
