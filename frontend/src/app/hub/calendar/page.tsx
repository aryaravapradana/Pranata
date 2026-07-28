"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import { Footer } from "@/components/layout/Footer";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Trash2, Edit3, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateWheelPicker } from "@/components/ui/date-wheel-picker";
import { TimeWheelPicker } from "@/components/ui/time-wheel-picker";

const API_BASE = getApiBaseUrl();

const getEventStyle = (typeStr: string) => {
  const t = (typeStr || "").toUpperCase().trim();
  if (t === 'TASK') {
    return {
      bg: 'bg-[#FFF5E6] border-[#F5990D] text-[#1C241E]',
      badgeBg: 'bg-[#F5990D]',
      badgeText: 'text-white',
      label: 'Tugas'
    };
  }
  if (t === 'ROUTINE') {
    return {
      bg: 'bg-[#ECF5EE] border-[#4A7C59] text-[#1C241E]',
      badgeBg: 'bg-[#4A7C59]',
      badgeText: 'text-white',
      label: 'Rutinitas'
    };
  }
  return {
    bg: 'bg-[#F3E8FF] border-[#9333EA] text-[#1C241E]',
    badgeBg: 'bg-[#9333EA]',
    badgeText: 'text-white',
    label: typeStr || 'Custom'
  };
};

const HOURS_24 = Array.from({ length: 24 }).map((_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function CalendarPage() {
  const [activeDay, setActiveDay] = useState(new Date().getDate());
  const [activeDateObj, setActiveDateObj] = useState(new Date());
  
  const [viewMode, setViewMode] = useState('Week'); // Month, Week, Day
  
  const [events, setEvents] = useState<any[]>([]);
  const [sellerId, setSellerId] = useState("");

  const scrollRefWeek = useRef<HTMLDivElement>(null);
  const scrollRefDay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ROW_HEIGHT = 96;

      if (viewMode === 'Day' && scrollRefDay.current) {
        const dayEvents = events.filter(e => 
          e.day === activeDay && 
          e.month === activeDateObj.getMonth() && 
          e.year === activeDateObj.getFullYear()
        );

        if (dayEvents.length > 0) {
          const validHours = dayEvents.map(e => typeof e.hoursFromMidnight === 'number' ? e.hoursFromMidnight : 0);
          const minHour = Math.min(...validHours);
          const targetTop = Math.max(0, minHour * ROW_HEIGHT);
          scrollRefDay.current.scrollTop = targetTop;
          scrollRefDay.current.scrollTo({ top: targetTop, behavior: 'smooth' });
        } else {
          scrollRefDay.current.scrollTop = 0;
          scrollRefDay.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      if (viewMode === 'Week' && scrollRefWeek.current) {
        const weekDates = weekDays.map(w => w.fullDate.toDateString());
        const weekEvents = events.filter(e => {
          const evDate = new Date(e.eventDate).toDateString();
          return weekDates.includes(evDate);
        });

        if (weekEvents.length > 0) {
          const validHours = weekEvents.map(e => typeof e.hoursFromMidnight === 'number' ? e.hoursFromMidnight : 0);
          const minHour = Math.min(...validHours);
          const targetTop = Math.max(0, minHour * ROW_HEIGHT);
          scrollRefWeek.current.scrollTop = targetTop;
          scrollRefWeek.current.scrollTo({ top: targetTop, behavior: 'smooth' });
        } else {
          scrollRefWeek.current.scrollTop = 0;
          scrollRefWeek.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [viewMode, activeDay, activeDateObj, events]);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"ROUTINE" | "TASK" | "CUSTOM">("ROUTINE");
  const [customTagInput, setCustomTagInput] = useState("");
  const [formData, setFormData] = useState({ id: "", title: "", description: "", eventDate: "", time: "08:00", type: "ROUTINE" });

  useEffect(() => {
    const sessionStr = localStorage.getItem("farmpro_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setSellerId(session.id);
      fetchEvents(session.id);
    }
  }, []);

  const fetchEvents = (id: string) => {
    fetchApi(`${API_BASE}/api/events/${id}`)
      .then(res => res.json())
      .then(data => {
        const eventsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        // Transform backend events to UI events
        const uiEvents = eventsArray.map((e: any) => {
          const d = new Date(e.eventDate);
          
          const hour = d.getHours();
          const minutes = d.getMinutes();
          // Hours elapsed since 00:00 AM (midnight)
          const hoursFromMidnight = Math.max(0, hour + (minutes / 60));
          
          const style = getEventStyle(e.type);
          return {
            id: e.id,
            title: e.title,
            description: e.description,
            eventDate: e.eventDate,
            time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            day: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            hoursFromMidnight,
            durationHours: 1, // Default 1 hour duration block
            type: e.type,
            style,
            color: style.bg
          };
        });
        setEvents(uiEvents);
      })
      .catch(console.error);
  };

  // Generate Days for Week View (Current Week)
  const getDaysInWeek = () => {
    const INDO_DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const curr = new Date(activeDateObj);
    const first = curr.getDate() - curr.getDay(); 
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      days.push({ day: INDO_DAYS_SHORT[d.getDay()], date: d.getDate(), fullDate: d });
    }
    return days;
  };
  const weekDays = getDaysInWeek();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title || !formData.eventDate || !formData.time) {
      alert("Mohon isi semua field.");
      return;
    }

    setIsSaving(true);

    // combine date and time locally to avoid UTC shifts
    const [hours, minutes] = formData.time.split(':');
    const [year, month, day] = formData.eventDate.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));

    const payload = {
      title: formData.title,
      description: formData.description,
      eventDate: d.toISOString(),
      type: formData.type,
      sellerId
    };

    try {
      let res;
      if (isEditing && formData.id) {
        res = await fetchApi(`${API_BASE}/api/events/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchApi(`${API_BASE}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan jadwal. Silakan coba lagi.");
        return;
      }

      setShowModal(false);
      fetchEvents(sellerId);
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus jadwal ini?")) {
      await fetchApi(`${API_BASE}/api/events/${id}`, { method: 'DELETE' });
      setShowModal(false);
      fetchEvents(sellerId);
    }
  };

  const getLocalYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openNewEvent = () => {
    const d = new Date(activeDateObj);
    d.setDate(activeDay);
    setFormData({ id: "", title: "", description: "", eventDate: getLocalYMD(d), time: "08:00", type: "ROUTINE" });
    setSelectedCategory("ROUTINE");
    setCustomTagInput("");
    setIsEditing(false);
    setShowModal(true);
  };

  const openNewEventAt = (dateObj: Date, hourNum: number) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dateObj.getDate()).padStart(2, '0');
    const timeStr = `${hourNum.toString().padStart(2, '0')}:00`;

    setFormData({ 
      id: "", 
      title: "", 
      description: "", 
      eventDate: `${y}-${m}-${dStr}`, 
      time: timeStr, 
      type: "ROUTINE" 
    });
    setSelectedCategory("ROUTINE");
    setCustomTagInput("");
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditEvent = (e: any) => {
    const d = new Date(e.eventDate);
    const typeUpper = (e.type || "").toUpperCase().trim();
    if (typeUpper === "ROUTINE" || typeUpper === "TASK") {
      setSelectedCategory(typeUpper as "ROUTINE" | "TASK");
      setCustomTagInput("");
    } else {
      setSelectedCategory("CUSTOM");
      setCustomTagInput(e.type || "");
    }
    setFormData({ 
      id: e.id, 
      title: e.title, 
      description: e.description || "", 
      eventDate: getLocalYMD(d), 
      time: e.time, 
      type: e.type || "ROUTINE"
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handlePrev = () => {
    const d = new Date(activeDateObj);
    if (viewMode === 'Day') {
      d.setDate(d.getDate() - 1);
      setActiveDateObj(d);
      setActiveDay(d.getDate());
    } else if (viewMode === 'Week') {
      d.setDate(d.getDate() - 7);
      setActiveDateObj(d);
      setActiveDay(d.getDate());
    } else if (viewMode === 'Month') {
      d.setMonth(d.getMonth() - 1);
      setActiveDateObj(d);
    }
  };

  const handleNext = () => {
    const d = new Date(activeDateObj);
    if (viewMode === 'Day') {
      d.setDate(d.getDate() + 1);
      setActiveDateObj(d);
      setActiveDay(d.getDate());
    } else if (viewMode === 'Week') {
      d.setDate(d.getDate() + 7);
      setActiveDateObj(d);
      setActiveDay(d.getDate());
    } else if (viewMode === 'Month') {
      d.setMonth(d.getMonth() + 1);
      setActiveDateObj(d);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setActiveDateObj(now);
    setActiveDay(now.getDate());
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] font-sans flex flex-col justify-between" >
      
      {/* Header Area */}
      <header className="max-w-7xl mx-auto pt-4 sm:pt-6 md:pt-10 pb-3 sm:pb-4 md:pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-6 px-3.5 sm:px-6 md:px-8 lg:px-12 w-full">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight">{activeDateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-2.5 sm:gap-3 md:gap-6 w-full md:w-auto">
          {/* View Mode Switcher Pills */}
          <div className="bg-[#E8E3D2]/70 p-1 md:p-1.5 rounded-full flex gap-1 relative shadow-inner w-full sm:w-auto justify-between">
            {['Month', 'Week', 'Day'].map(view => (
              <button 
                key={view} 
                onClick={() => setViewMode(view)}
                className={`relative flex-1 sm:flex-none px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all z-10 text-center cursor-pointer ${
                  view === viewMode ? 'text-[#2B4C3B]' : 'text-[#7A8678] hover:text-[#1C241E]'
                }`}
              >
                {view === viewMode && (
                  <motion.div
                    layoutId="activeCalendarViewTab"
                    className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span>{view === 'Month' ? 'Bulan' : view === 'Week' ? 'Minggu' : 'Hari'}</span>
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <button onClick={handlePrev} className="w-8 h-8 sm:w-10 sm:h-10 bg-[#E8E3D2] hover:bg-[#DDE2D6] rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <ChevronLeft size={16} className="text-[#5A635B]" />
            </button>
            <button onClick={handleToday} className="flex-1 sm:flex-none px-4 sm:px-6 py-1.5 sm:py-2 bg-[#E8E3D2] hover:bg-[#DDE2D6] rounded-full text-xs sm:text-sm font-bold text-[#2B4C3B] transition-colors text-center cursor-pointer">
              Hari Ini
            </button>
            <button onClick={handleNext} className="w-8 h-8 sm:w-10 sm:h-10 bg-[#E8E3D2] hover:bg-[#DDE2D6] rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <ChevronRight size={16} className="text-[#5A635B]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 lg:px-12 w-full flex-1 mb-8 md:mb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Days Header (Only for Week View) */}
            {viewMode === 'Week' && (
              <div className="overflow-x-auto pb-3 mb-3 md:mb-4 hide-scrollbar">
                <div className="flex min-w-[540px] sm:min-w-[720px] md:min-w-[880px]">
                  <div className="w-12 sm:w-14 md:w-16 shrink-0 flex items-center justify-center">
                    <CalendarIcon size={20} className="text-[#7A8678]" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2.5 px-1 md:px-2">
                    {weekDays.map((d) => (
                      <button 
                        key={d.fullDate.toISOString()}
                        onClick={() => {
                          setActiveDay(d.date);
                          if (d.fullDate.getMonth() !== activeDateObj.getMonth() || d.fullDate.getFullYear() !== activeDateObj.getFullYear()) {
                            setActiveDateObj(d.fullDate);
                          }
                        }}
                        className={`flex flex-col items-center justify-center py-2 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl md:rounded-3xl transition-all ${activeDay === d.date ? 'bg-pranata text-white shadow-lg' : 'bg-white text-[#1C241E] border border-[#E8E3D2] hover:border-[#B4C179]'}`}
                      >
                        <span className={`text-[10px] sm:text-xs md:text-sm font-bold mb-0.5 ${activeDay === d.date ? 'text-[#A4C4A8]' : 'text-[#7A8678]'}`}>{d.day}</span>
                        <span className="text-lg sm:text-2xl md:text-3xl font-black">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Grid Area - WEEK VIEW */}
            {viewMode === 'Week' && (
              <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E8E3D2] shadow-sm overflow-hidden">
                <div 
                  ref={scrollRefWeek} 
                  style={{ height: '500px', maxHeight: '500px', overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }} 
                  className="custom-scrollbar overflow-x-auto relative shadow-inner"
                >
                  <div style={{ height: '2304px', minHeight: '2304px' }} className="flex shrink-0 min-w-[640px] sm:min-w-[720px] md:min-w-[880px] relative">
                    
                    {/* Time Column */}
                    <div style={{ height: '2304px', minHeight: '2304px' }} className="w-12 sm:w-14 md:w-16 shrink-0 flex flex-col pt-2 bg-[#F8F6F0] border-r border-[#E8E3D2]/60 select-none">
                      {HOURS_24.map((time) => (
                        <div key={time} style={{ height: '96px', minHeight: '96px' }} className="flex items-start justify-end pr-1.5 sm:pr-2 md:pr-3 text-[10px] sm:text-[11px] font-bold text-[#7A8678] shrink-0">
                          <span className="-mt-2.5">{time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Grid Area */}
                    <div style={{ height: '2304px', minHeight: '2304px' }} className="flex-1 shrink-0 relative">
                      {/* Horizontal Hour Lines */}
                      <div style={{ height: '2304px', minHeight: '2304px' }} className="absolute inset-0 flex flex-col pt-2 pointer-events-none">
                        {HOURS_24.map((_, i) => (
                          <div key={i} style={{ height: '96px', minHeight: '96px' }} className="border-t border-[#F8F6F0] w-full shrink-0"></div>
                        ))}
                      </div>

                      {/* 7 Days Columns */}
                      <div style={{ height: '2304px', minHeight: '2304px' }} className="absolute inset-0 grid grid-cols-7 gap-1 pt-2 px-1 pointer-events-none">
                        {weekDays.map((d, colIdx) => (
                          <div key={colIdx} className="relative h-full border-l border-[#F8F6F0]/80 pointer-events-none">
                            
                            {/* 24 Clickable Hour Slots */}
                            {HOURS_24.map((_, hourIdx) => (
                              <div
                                key={hourIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDay(d.date);
                                  if (d.fullDate.getMonth() !== activeDateObj.getMonth() || d.fullDate.getFullYear() !== activeDateObj.getFullYear()) {
                                    setActiveDateObj(d.fullDate);
                                  }
                                  openNewEventAt(d.fullDate, hourIdx);
                                }}
                                style={{ top: `${hourIdx * 96}px`, height: '96px' }}
                                className="absolute w-full border border-transparent hover:border-dashed hover:border-[#4A7C59]/60 hover:bg-[#4A7C59]/10 rounded-xl transition-all cursor-pointer pointer-events-auto flex items-center justify-center group/slot z-0"
                              >
                                <div className="opacity-0 group-hover/slot:opacity-100 transition-opacity bg-[#4A7C59] text-white px-1.5 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-xs">
                                  <Plus size={12} /> <span className="hidden sm:inline">Tambah</span> {hourIdx.toString().padStart(2, '0')}:00
                                </div>
                              </div>
                            ))}

                            {events
                              .filter(e => e.day === d.date && e.month === d.fullDate.getMonth() && e.year === d.fullDate.getFullYear())
                              .map((ev, i) => (
                                <EventCard key={i} event={ev} onClick={() => openEditEvent(ev)} />
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {viewMode === 'Month' && (
              <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E8E3D2] p-2.5 sm:p-5 md:p-6 shadow-sm overflow-x-auto hide-scrollbar">
                <div className="min-w-[340px] sm:min-w-[640px] md:min-w-0">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 lg:gap-4 mb-2 sm:mb-3 md:mb-4">
                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", 'Sab'].map(d => (
                      <div key={d} className="text-center font-black text-[10px] sm:text-xs md:text-sm text-[#1C241E] bg-[#F8F6F0] py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 lg:gap-4">
                    {/* Find first day of month */}
                    {Array.from({length: new Date(activeDateObj.getFullYear(), activeDateObj.getMonth(), 1).getDay()}).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[80px] md:min-h-[110px] lg:min-h-[120px] rounded-lg sm:rounded-xl md:rounded-2xl p-1 sm:p-2 opacity-50 bg-[#F8F6F0]"></div>
                    ))}
                    
                    {Array.from({length: new Date(activeDateObj.getFullYear(), activeDateObj.getMonth() + 1, 0).getDate()}).map((_, i) => {
                      const day = i + 1;
                      const dayEvents = events.filter(e => e.day === day && e.month === activeDateObj.getMonth() && e.year === activeDateObj.getFullYear());
                      const now = new Date();
                      const isToday = day === now.getDate() && activeDateObj.getMonth() === now.getMonth() && activeDateObj.getFullYear() === now.getFullYear();
                      return (
                        <div key={i} onClick={() => { setActiveDay(day); setViewMode('Day'); }} className={`min-h-[56px] sm:min-h-[80px] md:min-h-[110px] lg:min-h-[120px] rounded-lg sm:rounded-xl md:rounded-2xl p-1 sm:p-2 md:p-3 border-2 ${isToday ? 'border-[#2B4C3B] bg-[#F8F6F0]' : 'border-transparent hover:border-[#DDE2D6] bg-white shadow-xs'} cursor-pointer transition-colors relative overflow-hidden group`}>
                          <div className={`mb-0.5 sm:mb-1 text-xs sm:text-base md:text-lg ${isToday ? 'font-black text-[#C25939]' : 'font-medium text-[#5A635B]'}`}>{day}</div>
                          <div className="space-y-0.5 sm:space-y-1 relative z-10">
                            {dayEvents.map((e, idx) => (
                              <div key={idx} className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded sm:rounded-lg truncate ${e.color} shadow-2xs border`}>{e.title}</div>
                            ))}
                          </div>
                          <div className="absolute -bottom-10 -right-10 opacity-0 group-hover:opacity-5 transition-opacity">
                            <CalendarIcon size={80} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {viewMode === 'Day' && (
              <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E8E3D2] shadow-sm overflow-hidden">
                <div className="px-4 sm:px-8 py-4 border-b border-[#E8E3D2] bg-[#F8F6F0] flex justify-between items-center gap-2">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-[#1C241E]">{activeDay} {activeDateObj.toLocaleDateString('id-ID', { month: 'short' })}</h2>
                    <p className="text-[#5A635B] font-bold text-[11px] sm:text-xs mt-0.5">{events.filter(e => e.day === activeDay).length} Jadwal Terjadwal</p>
                  </div>
                  <button onClick={openNewEvent} className="bg-pranata hover:bg-[#1E362A] text-white font-extrabold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs sm:text-sm shadow-md cursor-pointer">
                    <Plus size={16} /> <span>Tambah Jadwal</span>
                  </button>
                </div>

                <div 
                  ref={scrollRefDay} 
                  style={{ height: '500px', maxHeight: '500px', overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }} 
                  className="custom-scrollbar overflow-x-auto relative shadow-inner"
                >
                  <div style={{ height: '2304px', minHeight: '2304px' }} className="flex shrink-0 bg-[#F8F6F0] p-3 sm:p-6 relative">
                    {/* Time Column */}
                    <div style={{ height: '2304px', minHeight: '2304px' }} className="w-12 sm:w-14 md:w-16 shrink-0 flex flex-col pt-2 select-none">
                      {HOURS_24.map((time) => (
                        <div key={time} style={{ height: '96px', minHeight: '96px' }} className="flex items-start justify-end pr-2 md:pr-4 text-[10px] sm:text-[11px] font-bold text-[#7A8678] shrink-0">
                          <span className="-mt-2.5">{time}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Day Grid Container */}
                    <div style={{ height: '2304px', minHeight: '2304px' }} className="flex-1 shrink-0 relative bg-white rounded-2xl border border-[#E8E3D2]">
                      <div style={{ height: '2304px', minHeight: '2304px' }} className="absolute inset-0 flex flex-col pt-2 pointer-events-none">
                        {HOURS_24.map((_, i) => (
                          <div key={i} style={{ height: '96px', minHeight: '96px' }} className="border-b border-[#F8F6F0] w-full last:border-0 shrink-0"></div>
                        ))}
                      </div>
                      
                      <div style={{ height: '2304px', minHeight: '2304px' }} className="absolute inset-0 px-2 sm:px-4 w-full md:w-3/4 lg:w-1/2 pt-2 pointer-events-none">
                        {/* 24 Clickable Hour Slots for Day View */}
                        {HOURS_24.map((_, hourIdx) => (
                          <div
                            key={hourIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              const activeFullDate = new Date(activeDateObj.getFullYear(), activeDateObj.getMonth(), activeDay);
                              openNewEventAt(activeFullDate, hourIdx);
                            }}
                            style={{ top: `${hourIdx * 96}px`, height: '96px' }}
                            className="absolute w-full border border-transparent hover:border-dashed hover:border-[#4A7C59]/60 hover:bg-[#4A7C59]/10 rounded-2xl transition-all cursor-pointer pointer-events-auto flex items-center justify-center group/slot z-0"
                          >
                            <div className="opacity-0 group-hover/slot:opacity-100 transition-opacity bg-[#4A7C59] text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
                              <Plus size={14} /> <span>Tambah Jadwal Jam {hourIdx.toString().padStart(2, '0')}:00</span>
                            </div>
                          </div>
                        ))}

                        {events
                          .filter(e => e.day === activeDay && e.month === activeDateObj.getMonth() && e.year === activeDateObj.getFullYear())
                          .map((e, idx) => (
                            <EventCard key={idx} event={e} onClick={() => openEditEvent(e)} />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-[#5A635B] hover:text-[#1C241E] cursor-pointer">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-[#1C241E] mb-6">{isEditing ? 'Detail Jadwal' : 'Jadwal Baru'}</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-[#7A8678] mb-1 block">Judul Kegiatan</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#F8F6F0] p-4 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#4A7C59]" placeholder="Cek Stok Pakan Ternak" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
                  {/* Tanggal (3 cols) */}
                  <div className="sm:col-span-3 relative group">
                    <label className="text-xs font-bold text-[#7A8678] mb-1 block">Tanggal</label>
                    <div className="relative flex items-center bg-[#F8F6F0] border-2 border-transparent group-hover:border-[#E8E3D2] focus-within:border-[#B4C179] focus-within:bg-white rounded-2xl transition-all p-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-[#4A7C59] shrink-0 ml-1">
                        <CalendarIcon size={18} />
                      </div>
                      <Popover>
                        <PopoverTrigger className="w-full bg-transparent py-2.5 px-3 font-bold text-[#1C241E] focus:outline-none text-left text-xs sm:text-sm truncate">
                          {formData.eventDate ? new Date(formData.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "Pilih Tanggal"}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 bg-white rounded-[2rem] border border-[#E8E3D2] shadow-[0_20px_60px_-15px_rgba(43,76,59,0.2)]">
                          <div className="mb-4 text-center">
                            <h4 className="font-black text-[#1C241E]">Pilih Tanggal</h4>
                            <p className="text-xs text-[#7A8678] font-medium">Geser untuk memilih</p>
                          </div>
                          <DateWheelPicker
                            value={formData.eventDate ? new Date(formData.eventDate) : new Date()}
                            onChange={(date) => {
                              const y = date.getFullYear();
                              const m = String(date.getMonth() + 1).padStart(2, '0');
                              const d = String(date.getDate()).padStart(2, '0');
                              setFormData({...formData, eventDate: `${y}-${m}-${d}`});
                            }}
                            minYear={new Date().getFullYear() - 1}
                            maxYear={new Date().getFullYear() + 5}
                            size="sm"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Jam (2 cols) */}
                  <div className="sm:col-span-2 relative group">
                    <label className="text-xs font-bold text-[#7A8678] mb-1 block">Jam</label>
                    <div className="relative flex items-center bg-[#F8F6F0] border-2 border-transparent group-hover:border-[#E8E3D2] focus-within:border-[#B4C179] focus-within:bg-white rounded-2xl transition-all p-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-[#4A7C59] shrink-0 ml-1">
                        <Clock size={18} />
                      </div>
                      <Popover>
                        <PopoverTrigger className="w-full bg-transparent py-2.5 px-3 font-bold text-[#1C241E] focus:outline-none text-left text-xs sm:text-sm truncate">
                          {formData.time || "08:00"}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none">
                          <TimeWheelPicker
                            value={formData.time || "08:00"}
                            onChange={(t) => setFormData({ ...formData, time: t })}
                            stepMinute={5}
                            size="sm"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#7A8678] mb-1.5 block">Tipe Kegiatan</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedCategory("ROUTINE");
                        setFormData({ ...formData, type: "ROUTINE" });
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-extrabold border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        selectedCategory === "ROUTINE"
                          ? 'border-[#4A7C59] bg-[#4A7C59] text-white shadow-md'
                          : 'border-[#E8E3D2] bg-[#F8F6F0] text-[#5A635B] hover:border-[#4A7C59]/50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-300" />
                      <span>Rutinitas</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedCategory("TASK");
                        setFormData({ ...formData, type: "TASK" });
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-extrabold border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        selectedCategory === "TASK"
                          ? 'border-[#F5990D] bg-[#F5990D] text-white shadow-md'
                          : 'border-[#E8E3D2] bg-[#F8F6F0] text-[#5A635B] hover:border-[#F5990D]/50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-200" />
                      <span>Tugas</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedCategory("CUSTOM");
                        setFormData({ ...formData, type: customTagInput.trim() ? customTagInput.trim() : "CUSTOM" });
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-extrabold border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        selectedCategory === "CUSTOM"
                          ? 'border-[#9333EA] bg-[#9333EA] text-white shadow-md'
                          : 'border-[#E8E3D2] bg-[#F8F6F0] text-[#5A635B] hover:border-[#9333EA]/50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-300" />
                      <span>+ Tag Custom</span>
                    </button>
                  </div>

                  {selectedCategory === "CUSTOM" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      className="mt-3"
                    >
                      <label className="text-[11px] font-bold text-[#7A8678] mb-1 block">Nama Tag Custom</label>
                      <input 
                        type="text" 
                        value={customTagInput} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomTagInput(val);
                          setFormData({ ...formData, type: val.trim() ? val.trim() : "CUSTOM" });
                        }}
                        className="w-full bg-[#F8F6F0] p-3 rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#9333EA] border border-[#E8E3D2]" 
                        placeholder="Contoh: Vaksinasi, Medis, Kebersihan..." 
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {isEditing && (
                  <button onClick={() => handleDelete(formData.id)} className="w-16 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 flex items-center justify-center rounded-2xl transition-colors shadow-sm cursor-pointer">
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  disabled={isSaving}
                  onClick={handleSave} 
                  className="flex-1 bg-pranata disabled:opacity-75 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      <span>{isEditing ? 'Menyimpan...' : 'Membuat Jadwal...'}</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Simpan Perubahan' : 'Buat Jadwal'}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({ event, onClick }: { event: any, onClick: () => void }) {
  const ROW_HEIGHT = 96; // 1 hour = 96px (h-24)
  const topPixels = Math.max(0, (event.hoursFromMidnight ?? 0) * ROW_HEIGHT + 8);
  const heightPixels = Math.max(64, (event.durationHours ?? 1) * ROW_HEIGHT - 6);
  const style = event.style || getEventStyle(event.type);

  return (
    <div 
      onClick={onClick}
      className={`absolute w-[calc(100%-6px)] mx-[3px] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 md:p-3 flex flex-col cursor-pointer transition-all hover:scale-[1.02] shadow-sm border-2 overflow-hidden pointer-events-auto ${style.bg}`}
      style={{ top: `${topPixels}px`, height: `${heightPixels}px`, zIndex: 20 }}
    >
      <h3 className="font-extrabold text-xs sm:text-sm leading-tight mb-1 break-words line-clamp-2">{event.title}</h3>
      <p className="text-[10px] sm:text-xs font-bold opacity-80 flex items-center gap-1 shrink-0"><Clock size={11}/> {event.time}</p>
      <div className="mt-auto pt-1 flex items-center">
        <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${style.badgeBg} ${style.badgeText} shadow-xs truncate`}>
          {style.label}
        </span>
      </div>
    </div>
  );
}
