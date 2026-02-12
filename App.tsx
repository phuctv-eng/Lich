
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarEvent, MonthInsight, EventType } from './types';
import { DAYS_OF_WEEK, MONTHS, VIETNAMESE_HOLIDAYS_2026 } from './constants';
import { getMonthInsight } from './geminiService';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.5,6C19.5,6 18,3 15,3C12,3 10.5,4.5 9,6C7.5,7.5 6,9 3,9V12C6,12 7.5,10.5 9,9C10.5,7.5 12,6 15,6C18,6 19.5,9 19.5,9V6M19.5,11C19.5,11 18,14 15,14C12,14 10.5,12.5 9,11C7.5,9.5 6,8 3,8V11C6,11 7.5,12.5 9,14C10.5,15.5 12,17 15,17C18,17 19.5,20 19.5,20V11M2,22H22V20H2V22Z" />
    <circle cx="15" cy="4.5" r="0.5" fill="white" />
    <path d="M12,2L10,4L11,5L13,3L12,2Z" />
  </svg>
);

const App: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(0); // 0-11
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [insight, setInsight] = useState<MonthInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>(EventType.PERSONAL);

  useEffect(() => {
    const storedEvents = localStorage.getItem('calendar_events_2026_special');
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
    localStorage.setItem('calendar_events_2026_special', JSON.stringify(events));
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
      calendarDays.push(<div key={`pad-${i}`} className="h-24 md:h-32 bg-red-50/30 border border-red-100/50 opacity-50"></div>);
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
          className={`h-24 md:h-32 border border-red-50 p-2 cursor-pointer transition-all hover:bg-red-50 group flex flex-col ${isToday ? 'bg-red-50 ring-2 ring-red-500 ring-inset' : 'bg-white'}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-bold ${isToday ? 'text-red-600' : 'text-gray-700'}`}>{d}</span>
            {dayEvents.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded truncate ${
                  event.type === 'holiday' ? 'bg-red-600 text-white border-l-2 border-yellow-400' :
                  'bg-yellow-100 text-red-800 border-l-2 border-red-500'
                }`}
                onClick={(e) => { e.stopPropagation(); if (confirm(`Xóa "${event.title}"?`)) deleteEvent(event.id); }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return calendarDays;
  };

  return (
    <div className="min-h-screen pb-12 bg-[#fffdfa] relative overflow-hidden">
      {/* Tet Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 text-red-600/10 pointer-events-none -translate-x-10 -translate-y-10">
        <svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="40" /></svg>
      </div>
      <div className="absolute top-0 right-0 p-4 text-red-500 opacity-20 pointer-events-none">
        <span className="text-4xl">🏮</span>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white sticky top-0 z-10 shadow-xl border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-yellow-400 rounded-full shadow-lg">
                  <HorseIcon className="w-8 h-8 text-red-700" />
                </div>
                <div className="absolute -top-1 -right-1 text-xl animate-bounce">🌸</div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-yellow-300 drop-shadow-md">
                  XUÂN BÍNH NGỌ 2026
                </h1>
                <p className="text-sm font-medium text-red-100 flex items-center gap-1">
                  Gia đình: <span className="text-white font-bold underline decoration-yellow-400">Hồ Thị Thu Thảo & Trần Vĩnh Phúc</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="text-center min-w-[160px]">
                <span className="block text-xs uppercase tracking-widest text-red-100 font-bold">Tháng Mới Hỷ Kỳ</span>
                <span className="text-lg font-black text-yellow-300">{MONTHS[currentMonth]}</span>
              </div>
              <button onClick={handleNextMonth} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group border-b-8 border-red-800">
             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <HorseIcon className="w-40 h-40" />
             </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧧</span>
                <h2 className="font-black tracking-widest uppercase text-xs text-yellow-300">Lời Chúc Gemini</h2>
              </div>
              {loadingInsight ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="h-12 bg-white/20 rounded"></div>
                </div>
              ) : insight ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-red-100 text-[10px] font-bold uppercase mb-1 tracking-tighter">Vận Thế Tháng Này</p>
                    <p className="text-2xl font-black leading-tight text-yellow-200">{insight.vibe}</p>
                  </div>
                  <p className="text-sm italic font-medium leading-relaxed bg-black/10 p-3 rounded-2xl">"{insight.quote}"</p>
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-xs text-red-100 font-bold mb-2 flex items-center gap-2">
                      <span className="animate-ping">🌸</span> VIỆC NÊN LÀM:
                    </p>
                    <p className="text-sm font-semibold text-white">{insight.suggestion}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-red-100 shadow-xl relative">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 text-2xl">💮</div>
            <h3 className="font-black text-red-700 mb-4 flex items-center gap-2 uppercase text-sm tracking-widest">
              <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
              Lịch Trình Sum Vầy
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {events
                .filter(e => new Date(e.date).getMonth() === currentMonth)
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(event => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors border border-red-100">
                    <div className="flex flex-col items-center justify-center min-w-[44px] h-[44px] bg-red-600 rounded-xl text-white shadow-md">
                      <span className="text-xs font-bold leading-none">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-900 line-clamp-1">{event.title}</p>
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">{event.type}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-red-600 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>
            <div className="grid grid-cols-7 bg-red-600">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={day} className={`py-4 text-center text-[10px] font-black uppercase tracking-widest text-white ${idx > 4 ? 'bg-red-700' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {renderDays()}
            </div>
          </div>
          <div className="mt-4 flex justify-center items-center gap-6 text-red-600 font-bold animate-pulse text-sm">
             <span>🏮 Vạn Sự Như Ý</span>
             <span>🌸 An Khang Thịnh Vượng</span>
             <span>🎊 Mã Đáo Thành Công</span>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border-t-8 border-red-600 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-red-700">Ghi Chú Hỷ Sự</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase">Ngày: {selectedDay}</p>
                </div>
                <button onClick={() => setShowEventModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-red-900 uppercase tracking-widest mb-2">Tên công việc / Sự kiện</label>
                  <input 
                    type="text" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-red-50 border-2 border-red-100 focus:border-red-500 transition-all outline-none font-bold text-red-900"
                    placeholder="Nhập việc cần làm..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-red-900 uppercase tracking-widest mb-2">Loại hình</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: EventType.PERSONAL, label: 'Cá nhân', color: 'bg-green-500' },
                      { value: EventType.WORK, label: 'Công việc', color: 'bg-blue-500' },
                      { value: EventType.HOLIDAY, label: 'Lễ Tết', color: 'bg-red-500' },
                    ].map(type => (
                      <button
                        key={type.value}
                        onClick={() => setNewEventType(type.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${newEventType === type.value ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className={`w-3 h-3 rounded-full ${type.color}`}></span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowEventModal(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-all">HỦY</button>
                <button onClick={addEvent} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all">LƯU LẠI</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Horse */}
      <div className="fixed bottom-4 left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-600 z-20">
        <HorseIcon className="w-8 h-8 text-red-600" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fca5a5; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
      `}</style>
    </div>
  );
};

export default App;
