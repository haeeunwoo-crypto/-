import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, Briefcase, Award, HelpCircle, Bell, Search, 
  Menu, User, ChevronRight, PlayCircle, CheckCircle, Lock, 
  MessageSquare, TrendingUp, Calendar, Zap, Target, ArrowUpCircle,
  X, LogOut, Star
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

/** * Kernel Academy LMS (Student View)
 * Based on the provided IA, Feature Specs, and Design drafts.
 */

// --- Constants & Mock Data ---

const USER_DATA = {
  name: "김현우",
  title: "데이터로 설득하는 PM 지망생",
  level: 3,
  characterState: "hatching", // egg, hatching, hatched, monster
  hatchPercent: 78,
  streak: 12,
  totalLearningTime: "48시간 20분",
  jdMatchScore: 82,
  targetCompany: "네카라쿠배 당근",
  targetRole: "서비스 기획자 (PO)",
};

const QUESTS = [
  { id: 1, title: "Ch 4. React Context 수강하기", reward: "+5% Hatch", done: false },
  { id: 2, title: "기술 블로그에 TIL 작성하기", reward: "+10% Hatch", done: true },
  { id: 3, title: "동료 코드 리뷰 1건 남기기", reward: "+3% Hatch", done: false },
];

const SKILL_DATA = [
  { subject: '기술 스택', A: 80, B: 100, fullMark: 100 },
  { subject: '문제 해결', A: 65, B: 90, fullMark: 100 },
  { subject: '학습 행동', A: 90, B: 85, fullMark: 100 },
  { subject: '프로젝트', A: 70, B: 90, fullMark: 100 },
  { subject: '협업/피드백', A: 85, B: 80, fullMark: 100 },
  { subject: '소프트스킬', A: 60, B: 85, fullMark: 100 },
];

const CURRICULUM = [
  { id: 1, title: "01. 오리엔테이션 & 로드맵 설정", duration: "10:00", completed: true },
  { id: 2, title: "02. React의 탄생 배경과 철학", duration: "15:30", completed: true },
  { id: 3, title: "03. JSX 문법 제대로 이해하기", duration: "20:00", completed: true },
  { id: 4, title: "04. React Context & State 관리", duration: "45:00", completed: false, current: true },
  { id: 5, title: "05. 컴포넌트 생명주기와 Hooks", duration: "30:00", completed: false },
];

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 mb-2 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-rose-50 text-rose-600 font-semibold' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={`transition-colors ${active ? "text-rose-600" : "text-slate-400 group-hover:text-slate-600"}`} />
    {!collapsed && <span className="ml-3 text-sm whitespace-nowrap">{label}</span>}
    {active && !collapsed && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-600" />}
  </button>
);

const EggCharacter = ({ percent }) => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg filter">
        {/* Glowing Aura behind egg */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Egg Shape */}
        <motion.path
          d="M50 5 C 20 5, 10 40, 10 65 C 10 90, 30 95, 50 95 C 70 95, 90 90, 90 65 C 90 40, 80 5, 50 5 Z"
          fill="#FFF7ED"
          stroke="#F43F5E"
          strokeWidth="3"
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: [0.95, 1.05, 0.95], 
            rotate: [0, 2, -2, 0],
            filter: ["drop-shadow(0 0 2px #fda4af)", "drop-shadow(0 0 8px #f43f5e)", "drop-shadow(0 0 2px #fda4af)"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Dynamic Cracks */}
        {percent > 30 && (
          <motion.path 
            d="M50 5 L 45 25 L 55 40" 
            fill="none" 
            stroke="#F43F5E" 
            strokeWidth="2" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        )}
        {percent > 60 && (
          <motion.path 
            d="M50 95 L 55 80 L 45 65" 
            fill="none" 
            stroke="#F43F5E" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        )}
      </svg>
      <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">
        Lv.{USER_DATA.level}
      </div>
    </div>
  );
};

const StreakHeatmap = () => {
  // Generates a mock contribution graph
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Create 4 months worth of data (approx 16 weeks)
  const days = Array.from({ length: 16 * 7 }, (_, i) => {
    // Random activity level: 0 (none) to 3 (high)
    const rand = Math.random();
    let level = 0;
    if (rand > 0.8) level = 3;
    else if (rand > 0.6) level = 2;
    else if (rand > 0.4) level = 1;
    return level;
  });

  const getColor = (level) => {
    switch(level) {
      case 1: return 'bg-rose-200';
      case 2: return 'bg-rose-400';
      case 3: return 'bg-rose-600';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-wrap gap-1 w-full min-w-[300px]" onMouseLeave={() => setHoveredIndex(null)}>
        {days.map((level, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            className={`w-3 h-3 rounded-sm transition-all duration-200 ${getColor(level)} ${hoveredIndex === i ? 'scale-125 ring-2 ring-rose-200 z-10' : ''}`}
            title={`Activity Level: ${level}`}
          />
        ))}
      </div>
      <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-slate-400">
        <span>Less</span>
        <div className="w-2 h-2 bg-slate-100 rounded-sm"></div>
        <div className="w-2 h-2 bg-rose-200 rounded-sm"></div>
        <div className="w-2 h-2 bg-rose-400 rounded-sm"></div>
        <div className="w-2 h-2 bg-rose-600 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};

// --- View Components ---

const DashboardView = ({ onStartLearning }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="space-y-6"
  >
    {/* Hero Section: Character & Status */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

      <div className="flex items-center gap-6 z-10">
        <div className="relative">
            <EggCharacter percent={USER_DATA.hatchPercent} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-rose-600 font-bold text-sm animate-pulse">부화 진행 중...</span>
            <span className="text-slate-400 text-xs font-mono">HATCH_PROCESS: {USER_DATA.hatchPercent}%</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {USER_DATA.name}님은 현재 <span className="text-rose-600">'알(Egg)'</span> 단계입니다.
          </h2>
          <p className="text-slate-500 text-sm mt-1">"{USER_DATA.title}"</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8 mt-6 md:mt-0 z-10 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
        <div className="text-center group cursor-pointer">
          <div className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-1 group-hover:scale-110 transition-transform">
            <Zap className="text-amber-500 fill-amber-500" size={20} />
            {USER_DATA.streak}일
          </div>
          <div className="text-xs text-slate-400 font-medium">연속 스트릭</div>
        </div>
        <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-1 group-hover:scale-110 transition-transform">
                <Target className="text-blue-500" size={20} />
                {USER_DATA.jdMatchScore}%
            </div>
            <div className="text-xs text-slate-400 font-medium">JD 매칭 적합도</div>
        </div>
      </div>
    </div>

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Current Course Card */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <BookOpen size={20} className="text-rose-500" />
            현재 학습 중
          </h3>
          <button 
            onClick={onStartLearning}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-3 py-1 rounded-full hover:bg-rose-50 transition-colors"
          >
            강의실 입장 <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full tracking-wide">KDT 국비과정</span>
              <h4 className="font-bold text-slate-800 mt-2 text-lg">프론트엔드 초격차 패키지 Online</h4>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">74<span className="text-sm text-slate-500 ml-1">%</span></span>
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '74%' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-rose-500 h-2.5 rounded-full" 
            />
          </div>

          <div 
            className="bg-white rounded-lg p-4 flex items-center justify-between border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group" 
            onClick={onStartLearning}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                <PlayCircle size={20} className="text-rose-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">이어보기 (24:10 / 45:00)</div>
                <div className="font-bold text-slate-800 text-sm">Ch 4. React Context & State 관리</div>
              </div>
            </div>
            <button className="hidden sm:block bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors">
              Play
            </button>
          </div>
        </div>

        <div className="mt-auto">
           <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
             <Calendar size={16} className="text-slate-400"/>
             연속 학습 캘린더 (Streak)
           </h3>
           <StreakHeatmap />
        </div>
      </div>

      {/* Side Column: Quests & AI Nudge */}
      <div className="space-y-6">
        {/* Daily Quest */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Award size={20} className="text-yellow-500" />
            오늘의 퀘스트
          </h3>
          <div className="space-y-3">
            {QUESTS.map(quest => (
              <div key={quest.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${quest.done ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-rose-200 hover:shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${quest.done ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                    {quest.done && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm ${quest.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>{quest.title}</span>
                </div>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">{quest.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan (AI Nudge) */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200 rounded-full blur-2xl -mr-5 -mt-5 opacity-40"></div>
          
          <h3 className="font-bold text-lg text-indigo-900 mb-2 flex items-center gap-2 relative z-10">
            <TrendingUp size={20} />
            데이터 기반 액션
          </h3>
          <p className="text-xs text-indigo-700 mb-4 leading-relaxed relative z-10">
            현우님, <span className="font-bold border-b border-indigo-300">React 성능 최적화</span> 역량이 목표 기업 JD 대비 부족합니다. AI가 추천하는 보완 학습입니다.
          </p>
          
          <button className="w-full bg-white/80 backdrop-blur-sm text-indigo-900 border border-indigo-200 py-3 rounded-xl text-sm font-bold hover:bg-white transition-colors text-left px-4 flex justify-between items-center shadow-sm relative z-10 group">
            <span className="flex items-center gap-2">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              useMemo & useCallback
            </span>
            <span className="text-[10px] bg-indigo-100 px-2 py-1 rounded text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">+5% Skill</span>
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const ClassroomView = ({ onClose }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', text: '"Context API의 Provider가 렌더링될 때 하위 컴포넌트들도 모두 리렌더링 되는 이유가 무엇이라고 생각하시나요? (소크라테스 모드)"' }
  ]);

  // Simulate Quiz Popup
  useEffect(() => {
    const timer = setTimeout(() => setShowQuiz(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: '좋은 접근입니다! 그렇다면 useMemo를 활용해서 그 문제를 어떻게 해결할 수 있을까요?' }]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6"
    >
      {/* Video Player Area */}
      <div className="flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col relative group border border-slate-800">
        <div className="flex-1 bg-slate-900 flex items-center justify-center relative">
          {/* Mock Video Content */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
          
          <PlayCircle size={80} className="text-white opacity-90 cursor-pointer hover:scale-110 transition-transform z-20 drop-shadow-xl" />
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700 z-30">
            <div className="h-full bg-rose-600 w-1/3 relative group-hover:h-2 transition-all">
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          {/* In-Video Quiz Popover */}
          <AnimatePresence>
            {showQuiz && (
              <motion.div 
                  initial={{ opacity: 0, y: 30, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 right-8 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl w-80 border-l-4 border-rose-500 z-40"
              >
                  <div className="flex justify-between items-start">
                      <h5 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <HelpCircle size={16} className="text-rose-500" />
                        잠깐! 퀴즈로 확인해볼까요?
                      </h5>
                      <button onClick={() => setShowQuiz(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
                    React의 Context API를 사용할 때 발생할 수 있는 불필요한 렌더링을 방지하기 위한 가장 적절한 Hook은?
                  </p>
                  <div className="space-y-2">
                      <button className="w-full text-left text-xs p-3 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all font-medium text-slate-700 hover:text-rose-700">
                        1. useMemo & React.memo
                      </button>
                      <button className="w-full text-left text-xs p-3 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all font-medium text-slate-700 hover:text-rose-700">
                        2. useEffect
                      </button>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-slate-900 p-4 flex justify-between items-center z-20 border-t border-slate-800">
          <div className="text-white font-medium flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="rotate-180" size={20} /></button>
             <span>Ch 4. React Context & State 관리</span>
          </div>
          <div className="flex gap-3 text-slate-400 text-xs font-medium">
             <button className="hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">노트 작성</button>
             <button className="hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">질문하기</button>
          </div>
        </div>
      </div>

      {/* Right Panel: Curriculum & AI Tutor */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button className="flex-1 py-3 text-sm font-bold text-slate-800 border-b-2 border-slate-800 bg-slate-50">커리큘럼</button>
          <button className="flex-1 py-3 text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">AI 튜터</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {CURRICULUM.map(item => (
            <div 
              key={item.id} 
              className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${item.current ? 'bg-rose-50 border border-rose-100' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <div className={`mt-0.5 ${item.completed ? 'text-rose-600' : item.current ? 'text-rose-500' : 'text-slate-300'}`}>
                 {item.completed ? <CheckCircle size={18} /> : item.current ? <PlayCircle size={18} /> : <Lock size={18} />}
              </div>
              <div className="flex-1">
                <div className={`text-sm ${item.current ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{item.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.duration}</div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Tutor Chat Area */}
        <div className="flex-shrink-0 h-1/2 border-t border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-2 border-b border-slate-100 bg-white flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <MessageSquare size={14} className="text-indigo-600" />
             </div>
             <span className="text-xs font-bold text-indigo-900">AI 튜터 (소크라테스 모드)</span>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-rose-500 text-white rounded-br-none shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
               </div>
             ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 relative">
            <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="답변을 입력하거나 질문하세요..." 
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white"
            />
            <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                <ArrowUpCircle size={24} />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const PortfolioView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
        {/* Top Header: Career Vision */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-600 to-orange-500 opacity-20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 <div>
                    <div className="flex items-center gap-2 text-rose-400 font-bold mb-3 text-xs uppercase tracking-widest">
                       <Star size={12} className="fill-rose-400" /> Success Vision
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
                        "복잡한 데이터를 SQL로 해결하고<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">팀원을 설득하는 주니어 기획자"</span>
                    </h2>
                 </div>
                 
                 <div className="flex gap-3">
                     <div className="bg-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                         <span className="text-slate-400 text-[10px] uppercase tracking-wide block mb-1">Target Company</span>
                         <span className="font-semibold text-sm">{USER_DATA.targetCompany}</span>
                     </div>
                     <div className="bg-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                         <span className="text-slate-400 text-[10px] uppercase tracking-wide block mb-1">Target Role</span>
                         <span className="font-semibold text-sm">{USER_DATA.targetRole}</span>
                     </div>
                 </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">역량 데이터 (Career DNA)</h3>
                        <p className="text-sm text-slate-500">목표 기업(JD) 요구 역량 vs 나의 현재 역량</p>
                    </div>
                    
                </div>
                
                <div className="flex gap-4 text-xs justify-end mb-4">
                     <div className="flex items-center gap-1.5">
                         <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                         <span className="font-medium text-slate-600">나의 역량</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                         <div className="w-3 h-3 rounded-full bg-slate-300 shadow-sm"></div>
                         <span className="font-medium text-slate-600">목표 기업 평균</span>
                     </div>
                </div>

                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={SKILL_DATA}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="목표 기업"
                                dataKey="B"
                                stroke="#cbd5e1"
                                fill="#cbd5e1"
                                fillOpacity={0.4}
                            />
                            <Radar
                                name="나의 역량"
                                dataKey="A"
                                stroke="#e11d48"
                                strokeWidth={2}
                                fill="#e11d48"
                                fillOpacity={0.6}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Timeline / History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <Briefcase size={20} className="text-slate-400" />
                    실무 검증 히스토리
                </h3>
                <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-[2px] before:bg-slate-100">
                    
                    {/* History Item 1 */}
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative pl-10"
                    >
                        <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white z-10">
                            <div className="w-3 h-3 bg-rose-600 rounded-full ring-4 ring-rose-100"></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-200 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-800 text-sm">React 성능 최적화 프로젝트 완료</span>
                                <span className="text-xs text-slate-400 font-medium">2일 전</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                쇼핑몰 리스트 페이지의 렌더링 속도를 개선하기 위해 React.memo와 가상화(Virtualization)를 적용. Lighthouse 성능 점수 45점 → 92점 개선 달성.
                            </p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-500 font-medium">#Refactoring</span>
                                <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-500 font-medium">#Optimization</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* History Item 2 */}
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative pl-10"
                    >
                         <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white z-10">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-100"></div>
                        </div>
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                                    <MessageSquare size={14} /> 멘토 피드백 수신 (김코딩 멘토)
                                </span>
                                <span className="text-xs text-indigo-400 font-medium">5일 전</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-indigo-100 mt-2 relative">
                                <div className="absolute top-0 left-4 w-3 h-3 bg-white border-l border-t border-indigo-100 transform -translate-y-1/2 rotate-45"></div>
                                <p className="text-xs text-slate-600 italic">"협업 과정에서 의사소통 방식이 매우 논리적입니다. 다만, 기술적인 용어를 비개발자에게 설명할 때 조금 더 쉬운 비유를 사용하면 좋겠습니다."</p>
                            </div>
                            <button className="text-xs text-indigo-600 font-bold mt-2 hover:underline px-1">피드백 전체보기 &gt;</button>
                        </div>
                    </motion.div>

                    <div className="relative pl-10">
                         <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white z-10">
                            <div className="w-3 h-3 bg-slate-300 rounded-full ring-4 ring-slate-100"></div>
                        </div>
                         <div className="py-2">
                            <button className="text-xs text-slate-400 font-medium hover:text-slate-600">이전 활동 더보기...</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);


// --- Main App Container ---

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle Sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    return (
      <AnimatePresence mode='wait'>
        {activeTab === 'home' && <DashboardView key="home" onStartLearning={() => setActiveTab('classroom')} />}
        {activeTab === 'classroom' && <ClassroomView key="classroom" onClose={() => setActiveTab('home')} />}
        {activeTab === 'portfolio' && <PortfolioView key="portfolio" />}
        {/* Fallbacks for other tabs */}
        {(activeTab === 'jd' || activeTab === 'news' || activeTab === 'support') && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-96 text-slate-400">
              <Briefcase size={48} className="mb-4 opacity-50" />
              <p>준비 중인 페이지입니다.</p>
           </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-900 overflow-hidden">
      
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-slate-900 h-full flex flex-col shadow-2xl z-30 flex-shrink-0 relative"
      >
        <div className="p-6 flex items-center gap-3 h-20">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-900/50 flex-shrink-0">K</div>
          <AnimatePresence>
            {sidebarOpen && (
                <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-white font-bold text-lg tracking-tight whitespace-nowrap"
                >
                    Kernel Academy
                </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 px-4 py-6 overflow-hidden hover:overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <div className={`text-[10px] font-bold text-slate-500 mb-4 px-2 tracking-wider ${!sidebarOpen && 'text-center'}`}>
                {sidebarOpen ? 'MAIN MENU' : 'MENU'}
            </div>
            <SidebarItem 
                icon={Home} label="홈 (대시보드)" 
                active={activeTab === 'home'} 
                onClick={() => setActiveTab('home')} 
                collapsed={!sidebarOpen}
            />
            <SidebarItem 
                icon={BookOpen} label="나의 강의실 (LMS)" 
                active={activeTab === 'classroom'} 
                onClick={() => setActiveTab('classroom')} 
                collapsed={!sidebarOpen}
            />
            <SidebarItem 
                icon={Briefcase} label="포트폴리오" 
                active={activeTab === 'portfolio'} 
                onClick={() => setActiveTab('portfolio')} 
                collapsed={!sidebarOpen}
            />
             <SidebarItem 
                icon={Target} label="취업 매칭 (JD)" 
                active={activeTab === 'jd'} 
                onClick={() => setActiveTab('jd')} 
                collapsed={!sidebarOpen}
            />
             <SidebarItem 
                icon={TrendingUp} label="취업 소식" 
                active={activeTab === 'news'} 
                onClick={() => setActiveTab('news')} 
                collapsed={!sidebarOpen}
            />
          </div>

          <div>
             <div className={`text-[10px] font-bold text-slate-500 mb-4 px-2 tracking-wider ${!sidebarOpen && 'text-center'}`}>
                {sidebarOpen ? 'SUPPORT' : 'ETC'}
            </div>
            <SidebarItem 
                icon={HelpCircle} label="지원센터" 
                active={activeTab === 'support'} 
                onClick={() => setActiveTab('support')} 
                collapsed={!sidebarOpen}
            />
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 flex items-center justify-center text-slate-200 border border-slate-600 flex-shrink-0">
                    <User size={20} />
                </div>
                {sidebarOpen && (
                    <div className="overflow-hidden">
                        <div className="text-sm font-bold text-white truncate">{USER_DATA.name}</div>
                        <div className="text-xs text-slate-400 truncate">수강생 (Lv.{USER_DATA.level})</div>
                    </div>
                )}
                {sidebarOpen && (
                    <button className="ml-auto text-slate-400 hover:text-white">
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold text-slate-800 md:hidden">Kernel</h1>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="강의, 공지사항, 멘토 검색..." 
                    className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all outline-none"
                />
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Hatch Status Small Widget */}
             <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Hatch Process</span>
                <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${USER_DATA.hatchPercent}%` }}></div>
                </div>
                <span className="text-xs font-bold text-rose-600">{USER_DATA.hatchPercent}%</span>
             </div>

             <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

             <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
             </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
