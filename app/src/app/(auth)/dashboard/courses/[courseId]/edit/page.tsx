"use client";

import { useState } from "react";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import {
  Search,
  Bell,
  ChevronRight,
  FolderOpen,
  MoreVertical,
  LayoutGrid,
  FileText,
  CheckCircle,
  Circle,
  Globe,
  Eye,
  Save,
  List,
  Settings,
  BarChart,
  Sparkles,
  X,
  Edit,
  Trash,
  Plus,
  ChevronsUpDown,
  GripVertical,
  Clock,
  HelpCircle,
  File,
  ChevronDown
} from "lucide-react";
import { useParams } from "next/navigation";

// Mock Data Types
interface KnowledgePointItem {
  id: string;
  title: string;
  completed?: boolean;
}

interface SectionItem {
  id: string;
  title: string;
  active?: boolean;
  draft?: boolean;
  knowledgePoints: KnowledgePointItem[];
}

interface ModuleItem {
  id: string;
  title: string;
  sections: SectionItem[];
  expanded?: boolean;
}

export default function CourseEditPage() {
  const params = useParams();
  const [courseTitle, setCourseTitle] = useState("Introduction to Python v3.0");
  const [activeTab, setActiveTab] = useState<"structure" | "settings" | "analytics">("structure");
  
  // Mock Data
  const [modules, setModules] = useState<ModuleItem[]>([
    {
      id: "mod-1",
      title: "Module 1: Python Basics",
      expanded: true,
      sections: [
        {
          id: "sec-1-1",
          title: "Section 1.1: Variables & Data Types",
          active: true,
          knowledgePoints: [
            { id: "kp-1", title: "Integer Types", completed: true },
            { id: "kp-2", title: "String Operations", completed: false }
          ]
        },
        {
          id: "sec-1-2",
          title: "Section 1.2: Control Flow",
          draft: true,
          knowledgePoints: [
            { id: "kp-3", title: "If/Else Logic", completed: false },
            { id: "kp-4", title: "For Loops", completed: false },
            { id: "kp-5", title: "While Loops", completed: false }
          ]
        }
      ]
    },
    {
      id: "mod-2",
      title: "Module 2: Data Structures",
      expanded: false,
      sections: []
    },
    {
      id: "mod-3",
      title: "Module 3: Algorithms",
      expanded: false,
      sections: []
    }
  ]);

  const [showAiSuggestion, setShowAiSuggestion] = useState(true);

  const toggleModule = (moduleId: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, expanded: !m.expanded } : m
    ));
  };

  return (
    <LayoutDashboard>
      <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-white dark:bg-[#1a202c] rounded-xl border border-card-border dark:border-gray-800 shadow-sm">
        {/* Sidebar Tree Navigator */}
        <aside className="w-[320px] flex-none bg-white dark:bg-[#1a202c] border-r border-card-border dark:border-gray-800 flex flex-col h-full z-10">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-card-border dark:border-gray-800 bg-[#fbfbfc] dark:bg-[#1e2532]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted dark:text-gray-400">Course Structure</h3>
              <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors" title="Expand All">
                <ChevronsUpDown className="w-5 h-5" />
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-[18px] h-[18px]" />
              Add New Module
            </button>
          </div>
          
          {/* Tree Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Root Course Node */}
            <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border border-transparent">
              <FolderOpen className="text-primary w-5 h-5 fill-current" />
              <span className="font-bold text-sm truncate flex-1 text-text-main dark:text-white">Intro to Python</span>
              <MoreVertical className="text-text-muted dark:text-gray-400 w-4 h-4 opacity-0 group-hover:opacity-100" />
            </div>

            {modules.map((module) => (
              <div key={module.id} className="pl-3 relative">
                {/* Connection line */}
                {/* <div className="absolute left-[13px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div> */}
                
                {/* Module Item */}
                <div 
                  className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer mb-1 relative z-10 ${
                    module.expanded 
                      ? "bg-primary/5 border border-primary/20 text-primary" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-text-muted dark:text-gray-400 border border-transparent"
                  }`}
                  onClick={() => toggleModule(module.id)}
                >
                  <ChevronRight className={`w-[18px] h-[18px] transform transition-transform ${module.expanded ? "rotate-90" : ""}`} />
                  <LayoutGrid className="w-5 h-5" />
                  <span className="font-medium text-sm truncate flex-1">{module.title}</span>
                  {module.expanded && <GripVertical className="text-primary w-4 h-4" />}
                  <MoreVertical className={`w-4 h-4 ${module.expanded ? "text-primary" : "text-text-muted dark:text-gray-400 opacity-0 group-hover:opacity-100"}`} />
                </div>

                {/* Children of Module */}
                {module.expanded && (
                  <div className="pl-6 space-y-1 mt-1">
                    {module.sections.map((section, idx) => (
                      <div key={section.id} className="relative">
                        {/* Connection lines would go here but keeping simple for React */}
                        <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <ChevronRight className="text-text-muted dark:text-gray-400 w-[18px] h-[18px]" />
                          <FileText className="text-text-muted dark:text-gray-500 w-[18px] h-[18px]" />
                          <span className="text-sm truncate flex-1 text-text-main dark:text-gray-300">{section.title}</span>
                        </div>
                        
                        {/* KPs under Section */}
                        <div className="pl-6 space-y-1 mt-1 border-l border-gray-100 dark:border-gray-800 ml-2">
                          {section.knowledgePoints.map((kp) => (
                            <div key={kp.id} className="group flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ml-1">
                              {kp.completed ? (
                                <CheckCircle className="text-green-500 w-4 h-4" />
                              ) : (
                                <Circle className="text-gray-300 dark:text-gray-600 w-4 h-4" />
                              )}
                              <span className="text-xs text-text-muted dark:text-gray-400 truncate">{kp.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-3 border-t border-card-border dark:border-gray-800 text-xs text-center text-text-muted dark:text-gray-400">
            Course ID: 8943-ADPT-V3
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background-soft dark:bg-[#0d121b] p-6 lg:p-10 scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-primary uppercase tracking-wide">Module</span>
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded border border-green-100 dark:border-green-900/30">
                    <Globe className="w-[14px] h-[14px]" /> Published
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">Module 1: Python Basics</h1>
                <p className="text-text-muted dark:text-gray-400 mt-1 max-w-2xl">Fundamental concepts including syntax, variables, and basic I/O operations necessary for beginners.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center justify-center gap-2 h-10 px-4 bg-white dark:bg-gray-800 border border-card-border dark:border-gray-700 text-text-main dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                  <Eye className="w-[18px] h-[18px]" />
                  Preview
                </button>
                <button className="flex items-center justify-center gap-2 h-10 px-4 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none">
                  <Save className="w-[18px] h-[18px]" />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-card-border dark:border-gray-700">
              <nav aria-label="Tabs" className="flex gap-8">
                <button 
                  onClick={() => setActiveTab("structure")}
                  className={`py-3 px-1 text-sm font-bold flex items-center gap-2 border-b-[3px] transition-colors ${
                    activeTab === "structure" 
                      ? "border-primary text-text-main dark:text-white" 
                      : "border-transparent text-text-muted hover:text-text-main dark:hover:text-gray-300"
                  }`}
                >
                  <List className="w-5 h-5" /> Content Structure
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className={`py-3 px-1 text-sm font-medium flex items-center gap-2 border-b-[3px] transition-colors ${
                    activeTab === "settings" 
                      ? "border-primary text-text-main dark:text-white" 
                      : "border-transparent text-text-muted hover:text-text-main dark:hover:text-gray-300"
                  }`}
                >
                  <Settings className="w-5 h-5" /> Settings
                </button>
                <button 
                  onClick={() => setActiveTab("analytics")}
                  className={`py-3 px-1 text-sm font-medium flex items-center gap-2 border-b-[3px] transition-colors ${
                    activeTab === "analytics" 
                      ? "border-primary text-text-main dark:text-white" 
                      : "border-transparent text-text-muted hover:text-text-main dark:hover:text-gray-300"
                  }`}
                >
                  <BarChart className="w-5 h-5" /> Analytics
                </button>
              </nav>
            </div>

            {/* AI Suggestion Alert */}
            {showAiSuggestion && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-indigo-100 dark:border-gray-700 rounded-xl p-4 flex items-start gap-4 shadow-sm relative overflow-hidden">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 z-10">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1 z-10">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">Structure Suggestion</h4>
                  <p className="text-sm text-indigo-800/80 dark:text-indigo-300/70">
                    Based on "Python Basics", we recommend adding a section on <strong>"Error Handling (Try/Except)"</strong> after Control Flow to improve learning outcomes.
                  </p>
                </div>
                <button 
                  onClick={() => setShowAiSuggestion(false)}
                  className="text-indigo-400 hover:text-indigo-600 dark:text-gray-500 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                {/* Decorative background element */}
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-indigo-100/50 to-transparent pointer-events-none"></div>
              </div>
            )}

            {/* Sections List (Card View) */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-card-border dark:border-gray-800 overflow-hidden">
              <div className="p-5 border-b border-card-border dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                <h3 className="text-base font-bold text-text-main dark:text-white">Sections in this Module</h3>
                <span className="text-xs font-medium text-text-muted dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">2 Sections, 5 KPs</span>
              </div>
              
              <div className="divide-y divide-card-border dark:divide-gray-800">
                {/* Section Item 1 */}
                <div className="group p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-text-main dark:text-white">1.1 Variables & Data Types</h4>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase rounded-full">Active</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg">
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-text-muted dark:text-gray-400 mb-4">Understanding basic storage containers and primitive types in Python.</p>
                      
                      {/* Knowledge Points (Mini Tags) */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-1">Knowledge Points:</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Integer Types
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Strings
                        </span>
                        <button className="text-xs text-text-muted hover:text-primary font-medium flex items-center gap-0.5 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Plus className="w-[14px] h-[14px]" /> Add KP
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Item 2 */}
                <div className="group p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-text-main dark:text-white">1.2 Control Flow Statements</h4>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase rounded-full">Draft</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg">
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-text-muted dark:text-gray-400 mb-4">Managing the execution order using if/else and loops.</p>
                      
                      {/* Knowledge Points (Mini Tags) */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-1">Knowledge Points:</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> If/Else Logic
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> For Loops
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> While Loops
                        </span>
                        <button className="text-xs text-text-muted hover:text-primary font-medium flex items-center gap-0.5 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Plus className="w-[14px] h-[14px]" /> Add KP
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Section Trigger */}
              <div className="p-5">
                <button className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-card-border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary/50 group transition-all">
                  <div className="size-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Plus className="text-gray-400 group-hover:text-primary w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary">Create New Section</span>
                    <span className="block text-xs text-text-muted dark:text-gray-400 mt-1">Or drag files here to bulk upload resources</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
              <div className="p-4 bg-white dark:bg-[#1a202c] rounded-lg border border-card-border dark:border-gray-800 flex items-center gap-4">
                <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Est. Duration</p>
                  <p className="text-lg font-bold text-text-main dark:text-white">45 Mins</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#1a202c] rounded-lg border border-card-border dark:border-gray-800 flex items-center gap-4">
                <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Assessment</p>
                  <p className="text-lg font-bold text-text-main dark:text-white">2 Quizzes</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#1a202c] rounded-lg border border-card-border dark:border-gray-800 flex items-center gap-4">
                <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <File className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Resources</p>
                  <p className="text-lg font-bold text-text-main dark:text-white">3 Attachments</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </LayoutDashboard>
  );
}
