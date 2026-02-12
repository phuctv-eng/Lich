
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarEvent, MonthInsight, EventType } from './types';
import { DAYS_OF_WEEK, MONTHS, VIETNAMESE_HOLIDAYS_2026 } from './constants';
import { getMonthInsight } from './geminiService';

// Chibi Horse Component - Linh vật Bính Ngọ dễ thương
const CuteHorse = ({ className, mood = 'happy' }: { className?: string; mood?: 'happy' | 'winking' }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="130" rx="50" ry="40" fill="#FDE68A" />
    <path d="M70 155C70 155 60 180 65 185C70 190 80 185 80 185" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
    <path d="M130 155C130 155 140 180 135 185C130 190 120 185 120 185" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
    <path d="M150 100C150 127.614 127.614 150 100 150C72.3858 150 50 127.614 50 100C50 72.3858 72.3858 50 100 50C127.614 50 150 72.3858 150 100Z" fill="#FEF3C7" />
    <path d="M70 60L55 30L85 55" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
    <path d="M130 60L145 30L115 55" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
    <path d="M85 52C85 52 100 20 125 55L115 65C115 65 100 45 95 60L85 52Z" fill="#D97706" />
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
    <ellipse cx="100" cy="120" rx="25" ry="15" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
    <circle cx="92" cy="118" r="2" fill="#92400E" />
    <circle cx="108" cy="118" r="2" fill="#92400E" />
    <path d="M95 125C95 125 100 132 105 125" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
    <circle cx="65" cy="110" r="5" fill="#FECACA" opacity="0.6" />
    <circle cx="135" cy="110" r="5" fill="#FECACA" opacity="0.6" />
  </svg>
);

const STORAGE_KEY_EVENTS = 'calendar_events_2026_thao_phuc';
const STORAGE_KEY_INSIGHTS = 'calendar_insights_cache_2026';
const DEFAULT_MUSIC_URL = 'https://raw.githubusercontent.com/NguyenXuanAn/audio-storage/main/xuan-oi-xuan-da-ve.mp3';

const App: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(0); 
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicSource, setMusicSource] = useState(DEFAULT_MUSIC_URL);
  const [customMusicName, setCustomMusicName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) return JSON.parse(saved);
    return VIETNAMESE_HOLIDAYS_2026.map(h => ({
      id: Math.random().toString(36).substr(2, 9),
      title: h.title,
      date: h.date,
      type: 'holiday' as any
    }));
  });

  const [insight, setInsight] = useState<MonthInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>(EventType.PERSONAL);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser. Click again!"));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMusicSource(url);
      setCustomMusicName(file.name);
      setIsMusicPlaying(false); // Reset playback state for new track
      if (audioRef.current) {
        audioRef.current.load();
      }
    }
  };

  const fetchInsight = useCallback(async () => {
    const monthName = MONTHS[currentMonth];
    const cacheRaw = localStorage.getItem(STORAGE_KEY_INSIGHTS);
    const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
    
    if (cache[monthName]) {
      setInsight(cache[monthName]);
      return;
    }

    setLoadingInsight(true);
    const result = await getMonthInsight(monthName);
    setInsight(result);
    cache[monthName] = result;
    localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(cache));
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

  const deleteEvent = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

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
          className={`h-24 md:h-32 border border-red-50 p-2 cursor-pointer transition-all hover:scale-[1.02] hover:z-10 hover:shadow-lg group flex flex-col relative ${isToday ? 'bg-red-50 ring-2 ring-red-600 ring-inset' : 'bg-white'}`}
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
                onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
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
      {/* Background audio - Looping */}
      <audio ref={audioRef} src={musicSource} loop />

      {/* Background patterns */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="grid grid-cols-4 gap-20 p-10">
          {[...Array(12)].map((_, i) => <CuteHorse key={i} className="w-40 h-40" />)}
        </div>
      </div>

      <header className="bg-gradient-to-b from-red-700 to-red-600 text-white sticky top-0 z-30 shadow-xl border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="p-1 bg-white rounded-full shadow-inner ring-4 ring-yellow-400 transform transition-transform group-hover:rotate-12">
                  <CuteHorse className="w-14 h-14" />
                </div>
                <div className="absolute -top-3 -right-3 text-2xl">🌸</div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter text-yellow-300 drop-shadow-lg leading-tight">
                  XUÂN BÍNH NGỌ 2026
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-red-50">
                    <span className="bg-yellow-400 text-red-700 px-2 py-0.5 rounded text-[10px] uppercase mr-1">Gia Đình</span>
                    Hồ Thị Thu Thảo & Trần Vĩnh Phúc
                  </p>
                  
                  {/* Music Controls */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleMusic}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all shadow-md ${isMusicPlaying ? 'bg-yellow-400 text-red-700 animate-pulse' : 'bg-red-800 text-white opacity-80'}`}
                    >
                      <span className={`text-xs ${isMusicPlaying ? 'animate-spin-slow' : ''}`}>
                        {isMusicPlaying ? '🏮' : '🔇'}
                      </span>
                      {isMusicPlaying ? (customMusicName ? `Đang phát: ${customMusicName}` : 'Nhạc Xuân Đang Phát') : 'Phát Nhạc'}
                    </button>
                    
                    {/* Upload Music Button */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/10 hover:bg-white/30 border border-white/20 p-1 rounded-full transition-all group"
                      title="Tải nhạc của bạn"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="audio/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
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
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[3rem] p-7 text-white shadow-2xl relative overflow-hidden border-b-[12px] border-red-800 transform transition-transform hover:-translate-y-1 group">
             <div className="absolute -right-6 -bottom-6 opacity-30 group-hover:scale-125 transition-transform duration-1000">
               <CuteHorse className="w-48 h-48" mood="winking" />
             </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl animate-pulse">🧧</span>
                <h2 className="font-black tracking-widest uppercase text-xs text-yellow-300">Quẻ Bói Gemini</h2>
              </div>
              {loadingInsight ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-5 bg-white/20 rounded-full w-2/3"></div>
                  <div className="h-16 bg-white/20 rounded-2xl"></div>
                </div>
              ) : insight ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-red-100 text-[10px] font-black uppercase mb-1 tracking-widest opacity-80">Vận Thế</p>
                    <p className="text-3xl font-black leading-tight text-yellow-300 uppercase italic">{insight.vibe}</p>
                  </div>
                  <div className="relative">
                    <p className="text-sm font-bold leading-relaxed bg-black/20 p-4 rounded-3xl border border-white/10 italic">
                      "{insight.quote}"
                    </p>
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-white/20">
                    <p className="text-xs text-yellow-200 font-black mb-2 uppercase tracking-widest">🍀 Lời Khuyên</p>
                    <p className="text-sm font-bold text-white leading-snug">{insight.suggestion}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-7 border-2 border-red-100 shadow-xl relative overflow-hidden">
            <h3 className="font-black text-red-700 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest border-b-2 border-red-50 pb-2">
              <span className="w-2 h-5 bg-yellow-500 rounded-full"></span>
              Lịch Trình Đã Lưu
            </h3>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {events
                .filter(e => new Date(e.date).getMonth() === currentMonth)
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-red-50/50 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group">
                    <div className="flex flex-col items-center justify-center min-w-[48px] h-[48px] bg-red-600 rounded-2xl text-white shadow-lg">
                      <span className="text-sm font-black">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-red-900 line-clamp-1">{event.title}</p>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter">{event.type}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3.5rem] shadow-2xl border-8 border-red-600 overflow-hidden relative">
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
               <p className="text-[10px] font-black text-red-700 uppercase">Bình An Vô Sự</p>
            </div>
          </div>
        </div>
      </main>

      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl border-t-[12px] border-red-600 overflow-hidden">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-red-700">Thêm Hỷ Sự</h2>
                <button onClick={() => setShowEventModal(false)} className="bg-red-50 p-3 rounded-full text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-red-900 uppercase ml-1">Tên việc cần nhớ</label>
                  <input 
                    type="text" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-6 py-5 rounded-3xl bg-red-50 border-2 border-red-100 focus:border-red-500 outline-none font-black text-red-900"
                    placeholder="Ghi chú tại đây..."
                    autoFocus
                  />
                </div>
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
                      className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all font-black text-sm ${newEventType === type.value ? 'border-red-600 bg-red-50 text-red-700 shadow-md' : 'border-gray-100 text-gray-500'}`}
                    >
                      {type.label} {type.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button onClick={() => setShowEventModal(false)} className="flex-1 py-5 rounded-3xl font-black text-gray-400 uppercase tracking-widest text-xs">Hủy</button>
                <button onClick={addEvent} className="flex-2 px-10 py-5 rounded-3xl bg-red-600 text-white font-black shadow-lg hover:bg-red-700 transition-all uppercase tracking-widest text-xs">Lưu Dữ Liệu 🧧</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => {
          setSelectedDay(new Date().toISOString().split('T')[0]);
          setShowEventModal(true);
        }}
        className="fixed bottom-6 right-6 w-20 h-20 bg-yellow-400 rounded-full shadow-2xl border-4 border-red-600 z-40 group hover:scale-110 active:scale-90 transition-all overflow-hidden"
      >
        <CuteHorse className="w-full h-full transform group-hover:rotate-12 transition-transform" />
      </button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}</style>
    </div>
  );
};

export default App;
