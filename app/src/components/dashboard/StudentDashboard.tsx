'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../layout/Header';
import { StudentSidebar } from '../layout/StudentSidebar';
import { LearningPanel } from '../learning/LearningPanel';
import type { Course, KnowledgePoint } from '@/types';

interface StudentDashboardProps {
  courses?: Course[];
  onLoadCourses?: () => Promise<Course[]>;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  courses: initialCourses,
  onLoadCourses
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [selectedKP, setSelectedKP] = useState<KnowledgePoint | undefined>();
  const [showLearningPanel, setShowLearningPanel] = useState(false);
  const [loading, setLoading] = useState(!initialCourses);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCourses && onLoadCourses) {
      loadCourses();
    }
  }, []);

  const loadCourses = async () => {
    if (!onLoadCourses) return;

    try {
      const coursesData = await onLoadCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKP = (kp: KnowledgePoint) => {
    setSelectedKP(kp);
  };

  const handleOpenLearningPanel = () => {
    if (selectedKP) {
      setShowLearningPanel(true);
    }
  };

  const handleResetNetworkView = () => {
    // TODO: Implement reset network view logic
    console.log('Reset network view');
  };

  const handleToggleDependencies = () => {
    // TODO: Implement toggle dependencies logic
    console.log('Toggle dependencies');
  };

  const handleShowLearningPath = () => {
    // TODO: Implement show learning path logic
    console.log('Show learning path');
  };

  // Network data
  const networkNodes = [
    { id: 'PI_SET_101', name: 'Mệnh đề', score: 95, level: 'excellent' as const, x: 100, y: 80, type: 'mastered' as const },
    { id: 'PI_SET_102', name: 'Tập hợp', score: 87, level: 'excellent' as const, x: 200, y: 120, type: 'mastered' as const },
    { id: 'PI_FUN_201', name: 'Hàm số', score: 85, level: 'excellent' as const, x: 300, y: 160, type: 'mastered' as const },
    { id: 'PI_LIN_701', name: 'Hàm bậc 1', score: 73, level: 'fair' as const, x: 450, y: 140, type: 'current' as const },
    { id: 'PI_QUA_202', name: 'Hàm số bậc hai', score: 45, level: 'poor' as const, x: 350, y: 240, type: 'at_risk' as const },
    { id: 'PI_EQU_301', name: 'Phương trình bậc nhất', score: 0, level: 'none' as const, x: 550, y: 200, type: 'locked' as const },
  ];

  const networkEdges = [
    { from: 'PI_SET_102', to: 'PI_SET_101' },
    { from: 'PI_FUN_201', to: 'PI_SET_102' },
    { from: 'PI_LIN_701', to: 'PI_FUN_201' },
    { from: 'PI_QUA_202', to: 'PI_LIN_701' },
    { from: 'PI_EQU_301', to: 'PI_LIN_701' },
  ];

  const handleSelectNetworkNode = (piPoint: string) => {
    setSelectedNodeId(piPoint);
    // Map piPoint to KnowledgePoint
    const node = networkNodes.find(n => n.id === piPoint);
    if (node) {
      const mockKP: KnowledgePoint = {
        id: piPoint,
        name: node.name,
        section_id: 'mock-section',
        module_id: 'mock-module',
        course_id: 'mock-course',
        code: piPoint,
        kp_type: 'concept',
        difficulty_level: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      handleSelectKP(mockKP);
    }
  };

  const getNodeRadius = (node: typeof networkNodes[0], isHovered: boolean, isSelected: boolean): number => {
    if (node.type === 'current' || isSelected) return 30;
    if (isHovered) return 27;
    if (node.type === 'locked') return 20;
    if (node.type === 'at_risk') return 22;
    return 25;
  };

  const getNodeStrokeWidth = (node: typeof networkNodes[0], isSelected: boolean): number => {
    if (isSelected || node.type === 'current') return 4;
    return node.type === 'locked' || node.type === 'at_risk' ? 2 : 3;
  };

  const getNodeStrokeColor = (node: typeof networkNodes[0], isSelected: boolean): string => {
    if (isSelected || node.type === 'current') return '#FF5722';
    return '#fff';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Sidebar */}
        <StudentSidebar
          courses={courses}
          selectedKP={selectedKP}
          onSelectKP={handleSelectKP}
        />

        {/* Main Area */}
        <main className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
          {/* Network Visualization */}
          <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col min-h-0 border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="font-bold text-blue-600 flex items-center gap-2">
                <span className="text-2xl">🗺️</span>
                <span>Bản đồ tri thức Pi-Map</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetNetworkView}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Đặt lại
                </button>
                <button
                  onClick={handleToggleDependencies}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Tiên quyết
                </button>
                <button
                  onClick={handleShowLearningPath}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Lộ trình
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <svg
                id="networkCanvas"
                className="w-full h-full"
                viewBox="0 0 800 400"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#FF9800" />
                  </marker>

                  <radialGradient id="masteredGradient">
                    <stop offset="0%" stopColor="#4CAF50" />
                    <stop offset="100%" stopColor="#2E7D32" />
                  </radialGradient>
                  <radialGradient id="currentGradient">
                    <stop offset="0%" stopColor="#FF9800" />
                    <stop offset="100%" stopColor="#F57C00" />
                  </radialGradient>
                  <radialGradient id="atRiskGradient">
                    <stop offset="0%" stopColor="#FF5722" />
                    <stop offset="100%" stopColor="#D84315" />
                  </radialGradient>
                  <radialGradient id="lockedGradient">
                    <stop offset="0%" stopColor="#9E9E9E" />
                    <stop offset="100%" stopColor="#616161" />
                  </radialGradient>
                </defs>

                {/* Edges */}
                {networkEdges.map((edge, index) => {
                  const fromNode = networkNodes.find(n => n.id === edge.from);
                  const toNode = networkNodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <line
                      key={`edge-${index}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      className="network-edge dependency"
                      markerEnd="url(#arrowhead)"
                      stroke="#FF9800"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  );
                })}

                {/* Nodes */}
                {networkNodes.map((node) => {
                  const isHovered = hoveredNode === node.id;
                  const isSelected = selectedNodeId === node.id;
                  const radius = getNodeRadius(node, isHovered, isSelected);
                  const strokeWidth = getNodeStrokeWidth(node, isSelected);
                  const strokeColor = getNodeStrokeColor(node, isSelected);
                  const isCurrent = node.type === 'current';
                  const fontSize = isSelected || isCurrent ? '16px' : node.type === 'locked' ? '11px' : node.type === 'at_risk' ? '12px' : '14px';
                  const labelFontSize = isSelected || isCurrent ? '11px' : node.type === 'locked' ? '9px' : '10px';
                  const labelY = isSelected || isCurrent ? 50 : node.type === 'locked' ? 38 : 45;

                  let gradientId = 'masteredGradient';
                  if (node.type === 'current') gradientId = 'currentGradient';
                  else if (node.type === 'at_risk') gradientId = 'atRiskGradient';
                  else if (node.type === 'locked') gradientId = 'lockedGradient';

                  return (
                    <g
                      key={node.id}
                      className={`network-node ${node.type} cursor-pointer transition-all duration-200 ${
                        isSelected ? 'selected' : ''
                      }`}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => handleSelectNetworkNode(node.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse animation rings for current/selected nodes */}
                      {(isCurrent || isSelected) && (
                        <>
                          <circle
                            r={radius}
                            fill="none"
                            stroke="#FF9800"
                            strokeWidth="2"
                            opacity="0.6"
                            style={{ pointerEvents: 'none' }}
                          >
                            <animate
                              attributeName="r"
                              values={`${radius};${radius + 8};${radius}`}
                              dur="3s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.6;0.1;0.6"
                              dur="3s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle
                            r={radius}
                            fill="none"
                            stroke="#FF9800"
                            strokeWidth="1"
                            opacity="0.4"
                            style={{ pointerEvents: 'none' }}
                          >
                            <animate
                              attributeName="r"
                              values={`${radius};${radius + 12};${radius}`}
                              dur="3s"
                              begin="1s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.4;0.05;0.4"
                              dur="3s"
                              begin="1s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </>
                      )}
                      
                      {/* Main node circle */}
                      <circle
                        r={radius}
                        fill={`url(#${gradientId})`}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        style={{
                          transition: 'all 0.2s ease',
                          filter: isHovered ? 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.6))' : 'none',
                        }}
                      />
                      
                      {/* Score text */}
                      <text
                        y={isSelected || isCurrent ? 6 : 5}
                        fill="#fff"
                        style={{
                          fontSize,
                          fontWeight: 700,
                          textAnchor: 'middle',
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                      >
                        {node.score === 0 ? '🔒' : String(node.score)}
                      </text>
                      
                      {/* Label text */}
                      <text
                        y={labelY}
                        fill="#333"
                        style={{
                          fontSize: labelFontSize,
                          fontWeight: isSelected || isCurrent ? 700 : 600,
                          textAnchor: 'middle',
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Analytics Panel */}
          <div className="h-60 bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-3 gap-4 p-6 flex-shrink-0 border border-gray-200">
            {/* Progress Section */}
            <div className="space-y-3">
              <div className="text-base font-bold text-blue-600 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span>Mức độ thành thạo</span>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-orange-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold text-orange-600">73%</div>
                  <div className="text-sm text-green-600 font-semibold">+8% tuần này</div>
                </div>
                <div className="text-sm text-gray-600">Hiện tại</div>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold text-blue-600">90%</div>
                  <div className="text-sm text-orange-600 font-semibold">Cần thêm 5%</div>
                </div>
                <div className="text-sm text-gray-600">Mục tiêu</div>
              </div>
            </div>

            {/* Learning Stats Section */}
            <div className="space-y-3">
              <div className="text-base font-bold text-green-600 mb-4 flex items-center gap-2">
                <span className="text-xl">📚</span>
                <span>Chỉ số học tập</span>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-green-600 font-semibold">+4 tuần này</div>
                </div>
                <div className="text-sm text-gray-600">Bài tập đã giải</div>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-green-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-green-600 font-semibold">Trên trung bình</div>
                </div>
                <div className="text-sm text-gray-600">Tỷ lệ chính xác</div>
              </div>
            </div>

            {/* Time Section */}
            <div className="space-y-3">
              <div className="text-base font-bold text-purple-600 mb-4 flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <span>Thời gian học</span>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold text-purple-600">8.5h</div>
                  <div className="text-sm text-green-600 font-semibold">Mục tiêu: 8h ✓</div>
                </div>
                <div className="text-sm text-gray-600">Tuần này</div>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-yellow-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-gray-600">ngày</div>
                </div>
                <div className="text-sm text-gray-600">Ngày liên tục</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Practice Button */}
      {selectedKP && (
        <button
          onClick={handleOpenLearningPanel}
          className="fixed bottom-12 right-12 bg-gradient-to-r from-[#FF5722] to-[#FF6B35] text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-[0_12px_40px_rgba(255,87,34,0.5)] hover:-translate-y-1 transition-all font-bold text-lg z-40 flex flex-col items-center gap-1 min-w-[200px]"
        >
          <div>🎯 Học Pi-point này!</div>
          <div className="text-sm font-medium opacity-90 italic">Học thích ứng</div>
        </button>
      )}

      {/* Learning Panel */}
      {showLearningPanel && selectedKP && (
        <LearningPanel
          knowledgePoint={selectedKP}
          onClose={() => setShowLearningPanel(false)}
        />
      )}
    </div>
  );
};
