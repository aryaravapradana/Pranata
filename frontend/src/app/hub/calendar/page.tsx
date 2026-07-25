"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Trash2, Edit3, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateWheelPicker } from "@/components/ui/date-wheel-picker";
import { TimeWheelPicker } from "@/components/ui/time-wheel-picker";

const API_BASE = getApiBaseUrl();

export default function CalendarPage() {
  const [activeDay, setActiveDay] = useState(new Date().getDate());
  const [activeDateObj, setActiveDateObj] = useState(new Date());
  
  const [viewMode, setViewMode] = useState('Week'); // Month, Week, Day
  
  const [events, setEvents] = useState<any[]>([]);
  const [sellerId, setSellerId] = useState("");
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", title: "", description: "", eventDate: "", time: "06:00", type: "ROUTINE" });

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
          
          // Calculate row (starts at 6 AM = row 1)
          const hour = d.getHours();
          const minutes = d.getMinutes();
          // Assuming each hour is 2 rows (30 min blocks)
          let startRow = ((hour - 6) * 2) + (minutes / 30) + 1;
          if (startRow < 1) startRow = 1;
          
          return {
            id: e.id,
            title: e.title,
            description: e.description,
            eventDate: e.eventDate,
            time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            day: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            startRow,
            spanRows: 3, // Default 1.5 hours
            type: e.type,
            color: e.type === 'HARVEST' ? 'bg-[#C25939]/20 border-[#C25939] text-[#1C241E]' : 
                   e.type === 'TASK' ? 'bg-[#F5990D]/30 border-[#F5990D] text-[#1C241E]' : 
                   'bg-[#4A7C59]/20 border-[#4A7C59] text-[#1C241E]'
          };
        });
        setEvents(uiEvents);
      })
      .catch(console.error);
  };

  // Generate Days for Week View (Current Week)
  const getDaysInWeek = () => {
    const curr = new Date(activeDateObj);
    const first = curr.getDate() - curr.getDay(); 
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.getDate(), fullDate: d });
    }
    return days;
  };
  const weekDays = getDaysInWeek();

  const handleSave = async () => {
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
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditEvent = (e: any) => {
    const d = new Date(e.eventDate);
    setFormData({ 
      id: e.id, 
      title: e.title, 
      description: e.description || "", 
      eventDate: getLocalYMD(d), 
      time: e.time, 
      type: e.type 
    });
    setIsEditing(true);
    setShowModal(true);
  };

  return (
    <div className="bg-[#F8F6F0] text-[#1C241E] font-sans pb-20" >
      
      {/* Header Area */}
      <header className="max-w-7xl mx-auto pt-10 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 md:px-8 lg:px-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{activeDateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h1>
        
        <div className="flex flex-wrap items-center gap-4 md:gap-8 w-full md:w-auto">
          {/* View Mode Switcher Pills */}
          <div className="bg-[#E8E3D2]/70 p-1.5 rounded-full flex gap-1 relative shadow-inner">
            {['Month', 'Week', 'Day'].map(view => (
              <button 
                key={view} 
                onClick={() => setViewMode(view)}
                className={`relative px-6 py-2 rounded-full text-sm font-extrabold transition-all z-10 ${
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
                <span>{view}</span>
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button onClick={() => {const d = new Date(activeDateObj); d.setDate(d.getDate() - 7); setActiveDateObj(d);}} className="w-10 h-10 bg-[#E8E3D2] hover:bg-[#DDE2D6] rounded-full flex items-center justify-center transition-colors">
              <ChevronLeft size={20} className="text-[#5A635B]" />
            </button>
            <button onClick={() => { setActiveDateObj(new Date()); setActiveDay(new Date().getDate()); }} className="px-6 py-2 bg-[#E8E3D2] hover:bg-[#DDE2D6] rounded-full text-sm font-bold text-[#2B4C3B] transition-colors">
              Today
            </button>
            <button onClick={() => {const d = new Date(activeDateObj); d.setDate(d.getDate() + 7); setActiveDateObj(d);}} className="w-10 h-10 bg-[#E8E3D2] hover:bg-[#DDE2D6] rounded-full flex items-center justify-center transition-colors">
              <ChevronRight size={20} className="text-[#5A635B]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
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
              <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                <div className="w-12 shrink-0 flex items-center justify-center">
                  <CalendarIcon size={24} className="text-[#7A8678]" />
                </div>
                
                <div className="flex-1 grid grid-cols-7 gap-4 min-w-[800px]">
                  {weekDays.map((d) => (
                    <button 
                      key={d.fullDate.toISOString()}
                      onClick={() => {
                        setActiveDay(d.date);
                        if (d.fullDate.getMonth() !== activeDateObj.getMonth() || d.fullDate.getFullYear() !== activeDateObj.getFullYear()) {
                          setActiveDateObj(d.fullDate);
                        }
                      }}
                      className={`flex flex-col items-center justify-center py-4 rounded-3xl transition-all ${activeDay === d.date ? 'bg-pranata text-white shadow-lg' : 'bg-white text-[#1C241E] border border-[#E8E3D2] hover:border-[#B4C179]'}`}
                    >
                      <span className={`text-sm font-bold mb-1 ${activeDay === d.date ? 'text-[#A4C4A8]' : 'text-[#7A8678]'}`}>{d.day}</span>
                      <span className="text-3xl font-black">{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Grid Area - WEEK VIEW */}
            {viewMode === 'Week' && (
              <div className="relative bg-white rounded-3xl overflow-hidden min-w-[800px] lg:min-w-0 overflow-x-auto border border-[#E8E3D2]">
                <div className="flex min-w-[800px]">
                  
                  {/* Time Column */}
                  <div className="w-16 shrink-0 flex flex-col relative z-10 pt-4 bg-[#F8F6F0]">
                    {["6 am", "7 am", "8 am", "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm"].map((time, i) => (
                      <div key={time} className="h-32 flex items-start justify-end pr-4 text-xs font-bold text-[#7A8678]">
                        <span className="-mt-2">{time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Grid Column */}
                  <div className="flex-1 relative">
                    {/* Horizontal Lines */}
                    <div className="absolute inset-0 flex flex-col pt-4">
                      {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className="h-32 border-t border-[#F8F6F0] w-full"></div>
                      ))}
                    </div>

                    {/* Vertical Lines & Events */}
                    <div className="absolute inset-0 grid grid-cols-7 gap-4 pt-4 px-2">
                      
                      {weekDays.map((d, colIdx) => (
                        <div key={colIdx} className="relative border-l border-[#F8F6F0]">
                          {/* Empty Slot Highlight on active day */}
                          {activeDay === d.date && (
                             <div onClick={openNewEvent} className="absolute top-0 w-full h-32 border-2 border-dashed border-[#A4B0A7] rounded-3xl bg-[#F8F6F0]/50 flex items-center justify-center cursor-pointer hover:bg-[#F8F6F0] transition-colors z-0">
                               <Plus className="text-[#A4B0A7]" />
                             </div>
                          )}

                          {events.filter(e => e.day === d.date && e.month === d.fullDate.getMonth() && e.year === d.fullDate.getFullYear()).map((ev, i) => (
                             <EventCard key={i} event={ev} onClick={() => openEditEvent(ev)} />
                          ))}
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {viewMode === 'Month' && (
              <div className="bg-white rounded-3xl border border-[#E8E3D2] p-6 shadow-sm overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-7 gap-4 mb-4">
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                      <div key={d} className="text-center font-black text-[#1C241E] bg-[#F8F6F0] py-2 rounded-xl">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    {/* Find first day of month */}
                    {Array.from({length: new Date(activeDateObj.getFullYear(), activeDateObj.getMonth(), 1).getDay()}).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[120px] rounded-2xl p-2 opacity-50 bg-[#F8F6F0]"></div>
                    ))}
                    
                    {Array.from({length: new Date(activeDateObj.getFullYear(), activeDateObj.getMonth() + 1, 0).getDate()}).map((_, i) => {
                      const day = i + 1;
                      const dayEvents = events.filter(e => e.day === day && e.month === activeDateObj.getMonth() && e.year === activeDateObj.getFullYear());
                      const now = new Date();
                      const isToday = day === now.getDate() && activeDateObj.getMonth() === now.getMonth() && activeDateObj.getFullYear() === now.getFullYear();
                      return (
                        <div key={i} onClick={() => { setActiveDay(day); setViewMode('Day'); }} className={`min-h-[120px] rounded-2xl p-3 border-2 ${isToday ? 'border-[#2B4C3B] bg-[#F8F6F0]' : 'border-transparent hover:border-[#DDE2D6] bg-white shadow-sm'} cursor-pointer transition-colors relative overflow-hidden group`}>
                          <div className={`mb-2 text-lg ${isToday ? 'font-black text-[#C25939]' : 'font-medium text-[#5A635B]'}`}>{day}</div>
                          <div className="space-y-1.5 relative z-10">
                            {dayEvents.map((e, idx) => (
                              <div key={idx} className={`text-[10px] font-bold px-2 py-1.5 rounded-lg truncate ${e.color} shadow-sm border`}>{e.title}</div>
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
              <div className="relative bg-white rounded-3xl overflow-hidden border border-[#E8E3D2] shadow-sm min-w-[800px] lg:min-w-0 overflow-x-auto">
                <div className="px-8 py-6 border-b border-[#E8E3D2] bg-[#F8F6F0] flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-[#1C241E]">{activeDay} {activeDateObj.toLocaleDateString('id-ID', { month: 'short' })}</h2>
                    <p className="text-[#5A635B] font-bold text-sm mt-1">{events.filter(e => e.day === activeDay).length} Scheduled Events</p>
                  </div>
                  <button onClick={openNewEvent} className="bg-pranata hover:bg-[#1E362A] text-white font-extrabold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95">
                    <Plus size={18} /> Tambah Jadwal
                  </button>
                </div>

                <div className="flex bg-[#F8F6F0] p-6">
                  {/* Time Column */}
                  <div className="w-16 shrink-0 flex flex-col relative z-10">
                    {["6 am", "7 am", "8 am", "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm"].map((time, i) => (
                      <div key={time} className="h-32 flex items-start justify-end pr-4 text-xs font-bold text-[#7A8678]">
                        <span className="-mt-2">{time}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex-1 relative bg-white rounded-2xl border border-[#E8E3D2] overflow-hidden">
                    <div className="absolute inset-0 flex flex-col">
                      {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className="h-32 border-b border-[#F8F6F0] w-full last:border-0"></div>
                      ))}
                    </div>
                    
                    <div className="absolute inset-0 px-4 md:w-2/3 lg:w-1/2 pt-4">
                      {events.filter(e => e.day === activeDay && e.month === activeDateObj.getMonth() && e.year === activeDateObj.getFullYear()).map((e, idx) => (
                        <EventCard key={idx} event={e} onClick={() => openEditEvent(e)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* CRUD Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C241E]/40 backdrop-blur-sm p-4 lg:p-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-[#5A635B] hover:text-[#1C241E]">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-[#1C241E] mb-6">{isEditing ? 'Detail Jadwal' : 'Jadwal Baru'}</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-[#7A8678] mb-1 block">Judul Kegiatan</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#F8F6F0] p-4 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#4A7C59]" placeholder="Cek Stok Pupuk" />
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
                  <label className="text-xs font-bold text-[#7A8678] mb-1 block">Tipe Kegiatan</label>
                  <div className="flex gap-2">
                    {["ROUTINE", "TASK", "HARVEST"].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormData({...formData, type: t})}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-colors ${formData.type === t ? 'border-[#2B4C3B] bg-pranata text-white' : 'border-[#E8E3D2] text-[#5A635B] hover:border-[#A4B0A7]'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {isEditing && (
                  <button onClick={() => handleDelete(formData.id)} className="w-16 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 flex items-center justify-center rounded-2xl transition-colors shadow-sm">
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={handleSave} className="flex-1 bg-pranata text-white py-4 rounded-2xl font-black text-lg transition-transform hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]">
                  {isEditing ? 'Simpan Perubahan' : 'Buat Jadwal'}
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
  const topOffset = `${(event.startRow - 1) * 128}px`;
  const height = `${event.spanRows * 128}px`;

  return (
    <div 
      onClick={onClick}
      className={`absolute w-[calc(100%-8px)] mx-[4px] rounded-3xl p-4 flex flex-col cursor-pointer transition-transform hover:scale-[1.02] shadow-sm border-2 ${event.color}`}
      style={{ top: topOffset, height: height, zIndex: 20 }}
    >
      <h3 className="font-bold text-sm leading-tight mb-1">{event.title}</h3>
      <p className="text-xs font-semibold opacity-70 mb-auto flex items-center gap-1"><Clock size={12}/> {event.time}</p>
      <div className="mt-2 text-[10px] font-black tracking-wider uppercase opacity-50">{event.type}</div>
    </div>
  );
}
