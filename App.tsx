
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarEvent, MonthInsight, EventType } from './types';
import { DAYS_OF_WEEK, MONTHS, VIETNAMESE_HOLIDAYS_2026 } from './constants';
import { getMonthInsight } from './geminiService';

// Chibi Horse Component - High quality SVG
const CuteHorse = ({ className, mood = 'happy' }: { className?: string; mood?: 'happy' | 'winking' }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <ellipse cx="100" cy="130" rx="50" ry="40" fill="#FDE68A" />
    <path d="M70 155C70 155 60 180 65 185C70 190 80 185 80 185" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
    <path d="M130 155C130 155 140 180 135 185C130 190 120 185 120 185" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
    
    {/* Head */}
    <path d="M150 100C150 127.614 127.614 150 100 150C72.3858 150 50 127.614 50 100C50 72.3858 72.3858 50 100 50C127.614 50 150 72.3858 150 100Z" fill="#FEF3C7" />
    
    {/* Ears */}
    <path d="M70 60L55 30L85 55" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
    <path d="M130 60L145 30L115 55" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
    
    {/* Mane (Tóc ngựa) */}
    <path d="M85 52C85 52 100 20 125 55L115 65C115 65 100 45 95 60L85 52Z" fill="#D97706" />
    
    {/* Eyes */}
    {mood === 'happy' ? (
      <>
        <circle cx="80" cy="95" r="8" fill="#451A03" />
        <circle cx="120" cy="95" r="8" fill="#451A03" />
        <circle cx="77" cy="92" r="3" fill="white" />
        <circle cx="117" cy="92" r="3" fill="white" />
      </>
    ) : (
      <>
        <path d="M70 95C70 95 80 85 90 95" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
        <circle cx="120" cy="95" r="8" fill="#451A03" />
        <circle cx="117" cy="92" r="3" fill="white" />
      </>
    )}
    
    {/* Nose & Mouth */}
    <ellipse cx="100" cy="120" rx="25" ry="15" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
    <circle cx="92" cy="118" r="2" fill="#92400E" />
    <circle cx="108" cy="118" r="2" fill="#92400E" />
    <path d="M95 125C95 125 100 132 105 125" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
    
    {/* Blush */}
    <circle cx="65" cy="110" r="5" fill="#FECACA" opacity="0.6" />
    <circle cx="135" cy="110" r="5" fill="#FECACA" opacity="0.6" />
  </svg>
);

const App: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(0); 
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [insight, setInsight] = useState<MonthInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>(EventType.PERSONAL);

  useEffect(() => {
    const storedEvents = localStorage.getItem('calendar_events_2026_final');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      const initialHolidays: CalendarEvent[] = VIETNAMESE_HOLIDAYS_2026.map(h => ({
        id: Math.random().toString(36).substr(2, 9),
        title: h.title,
        date: h.date,
        type: 'holiday' as any
      }));
      setEvents(initialHolidays);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar_events_2026_final', JSON.stringify(events));
  }, [events]);

  const fetchInsight = useCallback(async () => {
    setLoadingInsight(true);
    const result = await getMonthInsight(MONTHS[currentMonth]);
    setInsight(result);
    setLoadingInsight(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchInsight();
  }, [currentMonth]);

  const daysInMonth = useMemo(() => new Date(2026, currentMonth + 1, 0).getDate(), [currentMonth]);
  const firstDayOfMonth = useMemo(() => {
    let first = new Date(2026, currentMonth, 1).getDay();
    return first === 0 ? 6 : first - 1;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
  const handleNextMonth = () => setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));

  const addEvent = () => {
    if (!selectedDay || !newEventTitle.trim()) return;
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEventTitle,
      date: selectedDay,
      type: newEventType as any
    };
    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setShowEventModal(false);
  };

  const deleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id));

  const renderDays = () => {
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`pad-${i}`} className="h-24 md:h-32 bg-red-50/20 border border-red-50 opacity-40"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `2026-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      calendarDays.push(
        <div 
          key={d} 
          onClick={() => {
            setSelectedDay(dateStr);
            setShowEventModal(true);
          }}
          className={`h-24 md:h-32 border border-red-50 p-2 cursor-pointer transition-all hover:scale-[1.02] hover:z-10 hover:shadow-lg group flex flex-col ${isToday ? 'bg-red-50 ring-2 ring-red-600 ring-inset' : 'bg-white'}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-black ${isToday ? 'text-red-700' : 'text-gray-700'}`}>{d}</span>
            {dayEvents.length > 0 && <span className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`text-[10px] md:text-xs px-2 py-0.5 rounded-lg truncate font-bold ${
                  event.type === 'holiday' ? 'bg-red-600 text-white shadow-sm' :
                  'bg-yellow-100 text-red-800 border-l-2 border-red-500'
                }`}
                onClick={(e) => { e.stopPropagation(); if (confirm(`Xóa sự kiện "${event.title}"?`)) deleteEvent(event.id); }}
              >
                {event.title}
              </div>
            ))}
          </div>
          {d % 10 === 0 && <div className="absolute bottom-1 right-1 opacity-10 group-hover:opacity-100 transition-opacity"><CuteHorse className="w-6 h-6" /></div>}
        </div>
      );
    }
    return calendarDays;
  };

  return (
    <div className="min-h-screen pb-12 bg-[#FFF9F5] relative overflow-hidden selection:bg-red-200">
      {/* Red Tet Patterns Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="grid grid-cols-4 gap-20 p-10">
          {[...Array(12)].map((_, i) => <CuteHorse key={i} className="w-40 h-40" />)}
        </div>
      </div>

      {/* Floating Decorations */}
      <div className="fixed top-20 left-4 animate-bounce delay-75 z-20 hidden lg:block"><span className="text-4xl">🏮</span></div>
      <div className="fixed top-40 right-4 animate-bounce delay-150 z-20 hidden lg:block"><span className="text-4xl">🏮</span></div>
      
      {/* Header */}
      <header className="bg-gradient-to-b from-red-700 to-red-600 text-white sticky top-0 z-30 shadow-[0_4px_20px_rgba(185,28,28,0.4)] border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="p-1 bg-white rounded-full shadow-inner ring-4 ring-yellow-400 transform transition-transform group-hover:rotate-12">
                  <CuteHorse className="w-14 h-14" />
                </div>
                <div className="absolute -top-3 -right-3 text-2xl">🌸</div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                  MỪNG XUÂN BÍNH NGỌ 2026
                </h1>
                <p className="text-sm font-extrabold text-red-50 flex items-center gap-2">
                  <span className="bg-yellow-400 text-red-700 px-2 py-0.5 rounded text-[10px] uppercase">Gia Chủ</span>
                  Hồ Thị Thu Thảo & Trần Vĩnh Phúc
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white/20 rounded-full transition-all active:scale-90">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="text-center min-w-[120px]">
                <span className="text-xl font-black text-yellow-300">{MONTHS[currentMonth]}</span>
              </div>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white/20 rounded-full transition-all active:scale-90">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[3rem] p-7 text-white shadow-2xl relative overflow-hidden border-b-[12px] border-red-800 transform transition-transform hover:-translate-y-1">
             <div className="absolute -right-6 -bottom-6 opacity-30 group-hover:scale-125 transition-transform duration-1000">
               <CuteHorse className="w-48 h-48" mood="winking" />
             </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl animate-pulse">🧧</span>
                <h2 className="font-black tracking-widest uppercase text-xs text-yellow-300 drop-shadow">Quẻ Bói Đầu Tháng</h2>
              </div>
              {loadingInsight ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-5 bg-white/20 rounded-full w-2/3"></div>
                  <div className="h-16 bg-white/20 rounded-2xl"></div>
                </div>
              ) : insight ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-red-100 text-[10px] font-black uppercase mb-1 tracking-widest opacity-80">Khí Tiết</p>
                    <p className="text-3xl font-black leading-tight text-yellow-300 uppercase italic">{insight.vibe}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-2 -top-2 text-3xl opacity-20 text-yellow-400">"</span>
                    <p className="text-sm font-bold leading-relaxed bg-black/20 p-4 rounded-3xl border border-white/10 italic">
                      {insight.quote}
                    </p>
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-white/20">
                    <p className="text-xs text-yellow-200 font-black mb-2 flex items-center gap-2">
                      <span className="animate-spin-slow">🍀</span> LỜI KHUYÊN:
                    </p>
                    <p className="text-sm font-bold text-white leading-snug">{insight.suggestion}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-7 border-2 border-red-100 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 transform rotate-12">
               <CuteHorse className="w-40 h-40" />
            </div>
            <h3 className="font-black text-red-700 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest border-b-2 border-red-50 pb-2">
              <span className="w-2 h-5 bg-yellow-500 rounded-full"></span>
              Sự Kiện Quan Trọng
            </h3>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {events
                .filter(e => new Date(e.date).getMonth() === currentMonth)
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-red-50/50 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group">
                    <div className="flex flex-col items-center justify-center min-w-[48px] h-[48px] bg-gradient-to-tr from-red-600 to-red-500 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-sm font-black">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-red-900 line-clamp-1">{event.title}</p>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter">{event.type}</p>
                    </div>
                  </div>
                ))}
              {events.filter(e => new Date(e.date).getMonth() === currentMonth).length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <CuteHorse className="w-16 h-16 mx-auto mb-2 grayscale" />
                  <p className="text-xs font-bold text-gray-400 uppercase italic tracking-widest">Không có hỷ sự</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3.5rem] shadow-[0_20px_50px_rgba(185,28,28,0.15)] border-8 border-red-600 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-4 bg-yellow-400"></div>
            <div className="grid grid-cols-7 bg-red-600 pt-2">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={day} className={`py-5 text-center text-[11px] font-black uppercase tracking-widest text-white ${idx > 4 ? 'bg-red-700/50' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-[1px] bg-red-100">
              {renderDays()}
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm flex flex-col items-center">
               <CuteHorse className="w-10 h-10 mb-2" />
               <p className="text-[10px] font-black text-red-700 uppercase">Mã Đáo Thành Công</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm flex flex-col items-center">
               <span className="text-2xl mb-2">🌸</span>
               <p className="text-[10px] font-black text-red-700 uppercase">Vạn Sự Như Ý</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm flex flex-col items-center">
               <CuteHorse className="w-10 h-10 mb-2" mood="winking" />
               <p className="text-[10px] font-black text-red-700 uppercase">Hạnh Phúc Bình An</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Add Event */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl border-t-[12px] border-red-600 overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="p-10 relative">
              <div className="absolute top-4 right-10 opacity-10">
                 <CuteHorse className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-3xl font-black text-red-700 leading-none mb-1">Thêm Hỷ Sự</h2>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">📅 {selectedDay}</p>
                </div>
                <button onClick={() => setShowEventModal(false)} className="bg-red-50 p-3 rounded-full text-red-600 hover:rotate-90 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-black text-red-900 uppercase tracking-widest ml-1">Tên việc cần nhớ</label>
                  <input 
                    type="text" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-6 py-5 rounded-3xl bg-red-50/50 border-2 border-red-100 focus:border-red-500 focus:bg-white transition-all outline-none font-black text-red-900 shadow-inner"
                    placeholder="Hôm nay Thảo & Phúc làm gì?"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-red-900 uppercase tracking-widest ml-1">Phân loại</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: EventType.PERSONAL, label: 'Cá Nhân', emoji: '🏠' },
                      { value: EventType.WORK, label: 'Công Việc', emoji: '💼' },
                      { value: EventType.HOLIDAY, label: 'Lễ Tết', emoji: '🏮' },
                      { value: EventType.OTHER, label: 'Khác', emoji: '✨' },
                    ].map(type => (
                      <button
                        key={type.value}
                        onClick={() => setNewEventType(type.value)}
                        className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all font-black text-sm ${newEventType === type.value ? 'border-red-600 bg-red-50 text-red-700 scale-[1.05] shadow-md' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {type.label}
                        <span>{type.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4 relative z-10">
                <button onClick={() => setShowEventModal(false)} className="flex-1 py-5 rounded-3xl font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest text-xs">Hủy</button>
                <button onClick={addEvent} className="flex-2 px-10 py-5 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 text-white font-black shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Lưu Ngay 🧧</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Cute Horse Button */}
      <button 
        onClick={() => {
          setSelectedDay(new Date().toISOString().split('T')[0]);
          setShowEventModal(true);
        }}
        className="fixed bottom-6 right-6 w-20 h-20 bg-yellow-400 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] border-4 border-red-600 z-40 group hover:scale-110 active:scale-90 transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
        <CuteHorse className="w-full h-full transform group-hover:rotate-12 transition-transform" />
      </button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
        
        /* Mobile-first adjustments */
        @media (max-width: 640px) {
          .h-24 { height: 5rem; }
        }
      `}</style>
    </div>
  );
};

export default App;
