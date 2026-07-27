"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import { Footer } from "@/components/layout/Footer";

import React, { useState, useEffect } from "react";
import { Search, Bell, Settings, Store, TrendingUp, CloudSun, Calendar, Package, ChevronRight, Droplets, Wind, MapPin, Sparkles, Loader2, Info, RefreshCw } from "lucide-react";
import { useChat } from "ai/react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MainDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [currentPriceIdx, setCurrentPriceIdx] = useState(0);

  // Weather State
  const [weather, setWeather] = useState<any>(null);
  const [locationName, setLocationName] = useState<string>("Mencari lokasi...");
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  const getWeatherDetails = (code: number) => {
    if (code === 0) return { text: "Cerah", icon: "☀️", bg: "from-[#2B4C3B] via-[#3A6B49] to-[#4A7C59]", advice: "Cuaca cerah. Sangat baik untuk aktivitas kandang & pengiriman." };
    if ([1, 2].includes(code)) return { text: "Cerah Berawan", icon: "⛅", bg: "from-[#2B4C3B] via-[#3A6B49] to-[#4A7C59]", advice: "Cuaca hangat berawan. Pastikan sirkulasi udara kandang lancar." };
    if (code === 3) return { text: "Berawan", icon: "☁️", bg: "from-[#334237] via-[#43574A] to-[#2B4C3B]", advice: "Cuaca teduh berawan. Cocok untuk pemberian pakan & kesehatan ternak." };
    if ([45, 48].includes(code)) return { text: "Kabut", icon: "🌫️", bg: "from-[#38483E] via-[#4B5E52] to-[#2B4C3B]", advice: "Jarak pandang terbatas karena kabut. Berhati-hati saat pengiriman." };
    if ([51, 53, 55, 56, 57].includes(code)) return { text: "Gerimis Ringan", icon: "🌦️", bg: "from-[#254238] via-[#355B4D] to-[#1E362C]", advice: "Gerimis turun. Jaga kelembapan alas ternak tetap kering." };
    if ([61, 63, 65, 66, 67].includes(code)) return { text: "Hujan", icon: "🌧️", bg: "from-[#1F3A30] via-[#2D5043] to-[#162B23]", advice: "Terjadi hujan. Waspada lantai kandang licin & kelembapan tinggi." };
    if ([80, 81, 82].includes(code)) return { text: "Hujan Lebat", icon: "🌧️", bg: "from-[#192F27] via-[#264438] to-[#101F19]", advice: "Hujan lebat. Pastikan pakan tersimpan rapat & terlindung dari air." };
    if ([95, 96, 99].includes(code)) return { text: "Badai Petir", icon: "🌩️", bg: "from-[#14241E] via-[#1E362C] to-[#0A120F]", advice: "Waspada badai petir. Pastikan kelistrikan & tirai kandang tertutup aman." };
    return { text: "Cerah Berawan", icon: "⛅", bg: "from-[#2B4C3B] via-[#3A6B49] to-[#4A7C59]", advice: "Suhu & kondisi stabil untuk kegiatan pemeliharaan ternak." };
  };

  const fetchWeatherForCoords = async (lat: number, lng: number) => {
    try {
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const district = geoData.locality || geoData.city || geoData.principalSubdivision;
          const regency = geoData.city || geoData.principalSubdivision;
          if (district && regency && district !== regency) {
            setLocationName(`${district}, ${regency}`);
          } else if (regency) {
            setLocationName(regency);
          } else {
            setLocationName(geoData.countryName || "Lokasi Terdeteksi");
          }
        }
      } catch(e) {
        if (!locationName || locationName === "Mencari lokasi...") {
          setLocationName("Lokasi Terdeteksi");
        }
      }

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`);
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        setWeather(weatherData.current);
      }
    } catch(err) {
      console.error("[Weather Fetch Error]", err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const detectLocationAndWeather = () => {
    setIsDetectingLocation(true);
    setLocationName("Mencari lokasi...");

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeatherForCoords(latitude, longitude);
        },
        (err) => {
          console.warn("[Geolocation Error/Denied]", err);
          // Fallback: Default to Kediri / East Java Agricultural Hub
          const fallbackLat = -7.848;
          const fallbackLng = 112.017;
          setLocationName("Kediri, Jawa Timur");
          fetchWeatherForCoords(fallbackLat, fallbackLng);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    } else {
      const fallbackLat = -7.848;
      const fallbackLng = 112.017;
      setLocationName("Kediri, Jawa Timur");
      fetchWeatherForCoords(fallbackLat, fallbackLng);
    }
  };

  // Products State for AI
  const [products, setProducts] = useState<any[]>([]);
  const [allMarketplaceCount, setAllMarketplaceCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // AI Live Tile State
  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: { 
      contextData: { profile, orders, products, allMarketplaceCount, events, weather }
    }
  });
  const hasTriggeredInsight = React.useRef(false);

  // Cache AI messages when they finish loading (only if not fallback)
  useEffect(() => {
    if (!isLoading && messages.length > 0 && profile?.id) {
      const lastMsgContent = messages.filter((m: any) => m.role === 'assistant').pop()?.content || "";
      const isFallback = lastMsgContent.includes("TITLE: Status Toko\nVALUE: Aktif") || lastMsgContent.includes("TITLE: Status Etalase");
      
      if (!isFallback) {
        const prodIds = products.map(p => p.id).sort().join(',');
        const currentHash = `${profile.id}_${prodIds}_${orders.length}_${events.length}`;
        localStorage.setItem(`pranata_ai_insight_cache_${profile.id}`, JSON.stringify({
          timestamp: Date.now(),
          dataHash: currentHash,
          messages: messages
        }));
      }
    }
  }, [messages, isLoading, profile?.id, products, orders.length, events.length]);

  useEffect(() => {
    // 1. Session Auth
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) {
      router.push("/login");
      return;
    }
    const session = JSON.parse(sessionStr);
    if (session.role === 'BUYER') {
      router.push("/market");
      return;
    }
    setProfile(session);

    // 2. Fetch Orders, Products, & Prices
    const API_BASE = getApiBaseUrl();
    
    Promise.all([
      fetchApi(`${API_BASE}/api/orders/PRODUCER/${session.id}`).catch(() => null),
      fetchApi(`${API_BASE}/api/products/seller/${session.id}`).catch(() => null),
      fetchApi(`${API_BASE}/api/products?limit=200`).catch(() => null)
    ]).then(async ([ordRes, prodRes, allProdRes]) => {
      const ordersData = ordRes && ordRes.ok ? await ordRes.json() : [];
      const productsData = prodRes && prodRes.ok ? await prodRes.json() : [];
      const allProdData = allProdRes && allProdRes.ok ? await allProdRes.json() : [];
      
      const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData.data || []);
      const productsArray = Array.isArray(productsData) ? productsData : (productsData.data || []);
      const allProductsArray = Array.isArray(allProdData) ? allProdData : (allProdData.data || []);
      
      setOrders(ordersArray.slice(0, 2));
      setProducts(productsArray);
      setAllMarketplaceCount(allProductsArray.length);
      setIsLoaded(true);
    }).catch(() => {
      setOrders([]);
      setProducts([]);
      setAllMarketplaceCount(0);
      setIsLoaded(true);
    });
      
    fetchApi(`${API_BASE}/api/events/${session.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (data && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          setEvents([]);
        }
      })
      .catch(() => setEvents([]));

    fetchApi(`${API_BASE}/api/prices`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setPrices(data);
        }
      })
      .catch(console.error);

    // 3. Detect Real-time High-Accuracy Location & Weather
    detectLocationAndWeather();
  }, [router]);

  // Live Tile Effect for Prices
  useEffect(() => {
    if (prices.length > 0) {
      const interval = setInterval(() => {
        setCurrentPriceIdx((prev) => (prev + 1) % prices.length);
      }, 4000); // Rotate every 4 seconds
      return () => clearInterval(interval);
    }
  }, [prices]);

  // Auto-trigger AI Insight once everything is ready
  useEffect(() => {
    if (profile?.id && isLoaded && !hasTriggeredInsight.current) {
      setTimeout(() => {
        if (!hasTriggeredInsight.current) {
          hasTriggeredInsight.current = true;
          
          let shouldFetchNew = true;
          const prodIds = products.map(p => p.id).sort().join(',');
          const currentHash = `${profile.id}_${prodIds}_${orders.length}_${events.length}`;
          const cacheKey = `pranata_ai_insight_cache_${profile.id}`;
          const cachedStr = localStorage.getItem(cacheKey);
          
          if (cachedStr) {
            try {
              const cached = JSON.parse(cachedStr);
              const isExpired = Date.now() - cached.timestamp > 2 * 60 * 60 * 1000; // 2 hours TTL
              const lastMsgContent = cached.messages?.filter((m: any) => m.role === 'assistant').pop()?.content || "";
              
              // Invalidate stale fallback cache
              const isFallbackCache = lastMsgContent.includes("TITLE: Status Toko\nVALUE: Aktif") || lastMsgContent.includes("TITLE: Status Etalase");

              if (!isExpired && !isFallbackCache && cached.dataHash === currentHash && cached.messages?.length > 0) {
                shouldFetchNew = false;
                setMessages(cached.messages);
              }
            } catch(e) { }
          }

          if (shouldFetchNew) {
            append(
              { role: 'user', content: 'Analisis data riwayat stok, pesanan, dan cuaca terkini milik saya. Berikan tepat 2 insight bisnis paling krusial dan aksi nyata yang sangat spesifik. WAJIB GUNAKAN FORMAT KAKU BERIKUT:\n\nTITLE: [Kata kunci 1-2 kata spesifik dari data]\nVALUE: [Angka/Status Nyata]\nDESC: [1 kalimat analisis & tindakan konkret spesifik]\nCTA_TEXT: [Teks tombol]\nCTA_URL: [URL relatif: /hub/store ATAU /hub/calendar ATAU /hub/orders]\n---\nTITLE: [Kata kunci ke-2]\nVALUE: [Angka/Status ke-2]\nDESC: [Penjelasan & aksi ke-2]\nCTA_TEXT: [Teks tombol ke-2]\nCTA_URL: [URL ke-2]' },
              { body: { contextData: { profile, orders, products, allMarketplaceCount, events, weather } } }
            );
          }
        }
      }, 500);
    }
  }, [profile, isLoaded, products, orders, events, weather, append]);

  const firstName = profile?.name?.split(" ")[0] || profile?.fullName?.split(" ")[0] || "Petani";

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]" >
      <div className="w-full mx-auto px-3.5 sm:px-6 md:px-8 pt-2 pb-6">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-black text-[#1C241E] mb-1 tracking-tighter leading-tight">
            Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B4C3B] to-[#4A7C59]">{firstName}</span>! 
            <motion.span 
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }} 
              transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }} 
              className="inline-block origin-bottom-right ml-2"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-[#5A635B]">
            Pusat kendali operasional harian Anda.
          </p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              
          {/* Weather Widget */}
          {(() => {
            const details = weather ? getWeatherDetails(weather.weather_code ?? 1) : null;
            const bgGradient = details ? details.bg : "from-[#4A7C59] via-[#3A6B49] to-[#2B4C3B]";

            return (
              <div className={`md:col-span-1 lg:col-span-1 order-1 bg-gradient-to-br ${bgGradient} rounded-3xl sm:rounded-[2rem] p-5 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[240px] border border-white/15 transition-all`}>
                
                {/* Header: Location & Refresh Button */}
                <div className="relative z-10 flex justify-between items-center mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase truncate max-w-[85%] border border-white/10 shadow-xs">
                    <MapPin size={13} className="text-white shrink-0" />
                    <span className="truncate">{locationName}</span>
                  </div>

                  <button 
                    onClick={detectLocationAndWeather} 
                    disabled={isDetectingLocation}
                    title="Perbarui Lokasi Presisi"
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-md active:scale-95 text-white disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <RefreshCw size={14} className={isDetectingLocation ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="relative z-10 my-auto">
                  {weather ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                          <span className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight">{Math.round(weather.temperature_2m)}°</span>
                          <span className="text-xl sm:text-2xl font-black text-[#B4C179]">C</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-md shadow-xs">
                          <span className="text-base sm:text-lg">{details?.icon || "⛅"}</span>
                          <span className="text-xs sm:text-sm font-black text-white">{details?.text || "Cerah"}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                        <div className="bg-black/20 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2.5 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-[#4A7C59]/50 rounded-lg sm:rounded-xl shrink-0">
                            <Droplets size={18} className="text-[#B4C179]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-bold text-[#A4C4A8] uppercase tracking-wider truncate">Kelembapan</p>
                            <p className="text-sm sm:text-base font-black text-white">{weather.relative_humidity_2m}%</p>
                          </div>
                        </div>
                        <div className="bg-black/20 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2.5 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-[#4A7C59]/50 rounded-lg sm:rounded-xl shrink-0">
                            <Wind size={18} className="text-[#B4C179]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-bold text-[#A4C4A8] uppercase tracking-wider truncate">Kecepatan Angin</p>
                            <p className="text-sm sm:text-base font-black text-white truncate">{weather.wind_speed_10m} <span className="text-[10px] sm:text-xs font-normal">km/j</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Agricultural Weather Insight Pill */}
                      {details?.advice && (
                        <div className="mt-2 text-[10px] sm:text-xs font-bold text-white/90 bg-white/10 border border-white/15 p-2 sm:p-2.5 rounded-xl backdrop-blur-sm flex items-start gap-1.5">
                          <Sparkles size={14} className="text-[#F5990D] shrink-0 mt-0.5" />
                          <span className="leading-snug">{details.advice}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-4 py-3">
                      <div className="h-14 w-36 bg-white/20 rounded-2xl"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

              {/* Incoming Orders Tile */}
              <div className="md:col-span-1 lg:col-span-1 order-3 lg:order-2 bg-gradient-to-br from-[#2B4C3B] to-[#4A7C59] rounded-3xl sm:rounded-[2rem] p-4.5 sm:p-5 border border-[#4A7C59] shadow-lg text-white flex flex-col relative overflow-hidden min-h-[140px]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="flex items-center gap-2 text-white font-bold text-sm">
                    <Package className="text-[#A4C4A8]" size={16} /> Pesanan Aktif
                  </h3>
                </div>
                
                <div className="flex-1 flex flex-col gap-2.5 sm:gap-3 mt-2 overflow-y-auto pr-1">
                  {orders.filter(o => o.status !== 'COMPLETED').slice(0, 2).length > 0 ? (
                    orders.filter(o => o.status !== 'COMPLETED').slice(0, 2).map((order, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors shadow-sm backdrop-blur-md">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-black text-xs text-white truncate">{order.buyer?.fullName || order.buyer?.username || 'Pembeli'}</span>
                            <span className="text-[9px] font-bold text-[#A4C4A8] shrink-0">INV-{order.id.substring(0,4)}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-white/80 truncate">
                            {order.items && order.items.length > 0 ? order.items[0].product?.title : 'Produk'} 
                            {order.items && order.items.length > 1 && ` (+${order.items.length - 1} lainnya)`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md block mb-1 w-fit ml-auto ${
                            order.status === 'PENDING' ? 'bg-[#F1EBE1] text-[#C25939]' :
                            order.status === 'PROCESSING' ? 'bg-[#EEF2E6] text-[#2B4C3B]' :
                            order.status === 'SHIPPED' ? 'bg-[#E3F0F4] text-[#246A80]' :
                            'bg-[#E8E3D2] text-[#5A635B]'
                          }`}>
                            {order.status}
                          </span>
                          <span className="font-black text-xs text-white">Rp {order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                        <Package size={20} className="text-[#A4C4A8]" />
                      </div>
                      <p className="text-xs font-bold text-[#A4C4A8]">Belum ada pesanan aktif</p>
                    </div>
                  )}
                </div>
                <div className="shrink-0 pt-2.5 sm:pt-3 flex justify-end border-t border-white/10 mt-1">
                  <Link href="/hub/orders" className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-extrabold text-[#2B4C3B] bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-[#EEF2E6] transition-all shadow-md hover:shadow-lg active:scale-95 w-fit">
                    <span>Semua Pesanan</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>

            {/* Window Calendar Widget */}
            <div className="md:col-span-2 lg:col-span-2 order-4 lg:order-4 bg-pranata rounded-3xl sm:rounded-[2rem] p-4.5 sm:p-6 md:py-8 md:px-8 shadow-lg shadow-[#2B4C3B]/20 relative flex flex-col md:flex-row gap-3 md:gap-6 md:min-h-[280px] overflow-hidden">
              
              {/* Left Side: Header & Event List */}
              <div className="order-2 md:order-1 w-full md:flex-1 flex flex-col min-w-0 md:h-full pt-2 md:pt-0 border-t md:border-t-0 border-white/15 mt-1 md:mt-0">
                <div className="shrink-0 mb-2 sm:mb-3">
                  <h3 className="text-sm sm:text-lg md:text-xl font-black text-white flex items-center gap-2 capitalize">
                    <Calendar className="text-[#A4C4A8] shrink-0" size={18} /> 
                    <span className="truncate">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </h3>
                </div>
                
                {/* Event List (Kiri Bawah) */}
                <div className="max-h-32 sm:max-h-36 md:max-h-none overflow-y-auto min-h-0 pr-1 sm:pr-2 space-y-2 pb-1 hide-scrollbar">
                  {(() => {
                    const startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);

                    const futureEvents = events
                      .filter(e => new Date(e.eventDate) >= startOfToday)
                      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                      .slice(0, 4);

                    if (futureEvents.length === 0) {
                      return (
                        <div className="text-xs sm:text-sm font-semibold text-[#84B0A5] py-1 md:py-0 md:h-full flex items-center">
                          Belum ada jadwal mendatang.
                        </div>
                      );
                    }

                    return futureEvents.map((e, idx) => {
                      const d = new Date(e.eventDate);
                      return (
                        <div key={idx} className="flex items-start gap-2 bg-white/5 p-2 rounded-xl border border-white/10 transition-colors hover:bg-white/10">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-inner ${e.type === 'TASK' ? 'bg-[#F5990D] text-white' : 'bg-[#4A7C59] text-white'}`}>
                            <span className="text-[8px] sm:text-[9px] font-bold leading-none opacity-80 mb-0.5">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                            <span className="text-xs sm:text-base font-black leading-none">{d.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white leading-tight mb-0.5 truncate">{e.title}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-[#84B0A5]">{d.toLocaleDateString('id-ID', { weekday: 'long' })} • {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-[9px] font-black tracking-wider uppercase text-white/50">{e.type === 'TASK' ? 'Tugas' : e.type === 'ROUTINE' ? 'Rutinitas' : e.type}</p>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Mobile Button: Bottom Right of Card */}
                <div className="shrink-0 pt-2.5 flex justify-end mt-2 border-t border-white/10 md:hidden">
                  <Link href="/hub/calendar" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2B4C3B] bg-white px-4 py-2 rounded-full hover:bg-[#EEF2E6] transition-all shadow-md active:scale-95 w-fit">
                    <span>Buka Kalender Penuh</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Right Side: Month Grid */}
              <div className="order-1 md:order-2 w-full md:w-[320px] shrink-0 flex flex-col justify-center md:h-full pb-1 pt-1 md:pt-0">
                <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] font-bold text-[#84B0A5]">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* Fill days */}
                  {(() => {
                    const today = new Date();
                    const currentMonth = today.getMonth();
                    const currentYear = today.getFullYear();
                    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-7 sm:h-8 rounded-lg opacity-10 bg-white/5"></div>);
                    }
                    
                    for (let d = 1; d <= daysInMonth; d++) {
                      const isToday = d === today.getDate();
                      
                      // Check for events
                      const dayEvents = events.filter(e => {
                        const eDate = new Date(e.eventDate);
                        return eDate.getDate() === d && eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
                      });
                      const hasEvent = dayEvents.length > 0;
                      const hasHarvest = dayEvents.some(e => e.type === 'HARVEST');
                      
                      let bgClass = "bg-white/5 hover:bg-white/10 text-white/70 border border-transparent";
                      if (isToday) {
                         bgClass = "bg-[#C25939] text-white font-black shadow-[0_4px_12px_rgba(194,89,57,0.4)] border-[#C25939]";
                      } else if (hasHarvest) {
                         bgClass = "bg-white/20 text-white font-bold border-white/40";
                      } else if (hasEvent) {
                         bgClass = "bg-[#4A7C59]/60 text-white font-bold border-[#4A7C59]";
                      }
                      
                      cells.push(
                        <Link href="/hub/calendar" key={d} className={`h-7 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all relative ${bgClass}`}>
                          {d}
                          {hasEvent && !isToday && (
                             <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${hasHarvest ? 'bg-[#C25939]' : 'bg-white'}`}></span>
                          )}
                        </Link>
                      );
                    }
                    return cells;
                  })()}
                </div>
                {/* Desktop Button: Bottom Right of Card */}
                <div className="shrink-0 pt-3 hidden md:flex justify-end mt-2 border-t border-white/10">
                  <Link href="/hub/calendar" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#2B4C3B] bg-white px-6 py-3 rounded-full hover:bg-[#EEF2E6] transition-all shadow-md hover:shadow-lg active:scale-95 w-fit">
                    <span>Buka Kalender Penuh</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

          {/* Pranata Intelligence Insight Card */}
          <div className="md:col-span-1 lg:col-span-1 md:col-start-2 lg:col-start-auto md:row-start-1 lg:row-start-auto md:row-span-2 lg:row-span-2 order-2 lg:order-3 bg-gradient-to-br from-[#2B4C3B] to-[#4A7C59] rounded-3xl sm:rounded-[2rem] border border-[#4A7C59] shadow-xl flex flex-col overflow-hidden h-full min-h-[260px] sm:min-h-[296px] relative">
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5990D] opacity-20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300 opacity-20 blur-[80px] rounded-full pointer-events-none" />

              <div className="p-4.5 sm:p-5 relative z-10 flex flex-col h-full">
                <img src="/logos/intelligence/intelligence-white.webp" alt="Pranata Intelligence" className="h-6 sm:h-8 w-auto object-contain mb-2 drop-shadow-md origin-left self-start" loading="lazy" decoding="async" />
                
                <h3 className="text-base sm:text-lg font-black text-white mb-1 leading-tight">
                  Business Insight
                </h3>

                <div className="flex-1 flex flex-col mt-1 overflow-hidden">
                  {profile && products.length === 0 && orders.length === 0 && events.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/10 p-5 text-center backdrop-blur-md">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-2">
                        <Info size={20} className="text-[#A4C4A8]" />
                      </div>
                      <h4 className="font-bold text-white text-sm sm:text-base mb-1">Belum Ada Data</h4>
                      <p className="text-[11px] sm:text-xs text-[#84B0A5] leading-relaxed">
                        Agen intelijen membutuhkan riwayat produk, pesanan, atau kalender untuk memberikan analisis. Yuk, mulai aktivitas pertamamu!
                      </p>
                    </div>
                  ) : (!hasTriggeredInsight.current || isLoading) ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-3xl border border-white/10 p-5 text-center backdrop-blur-md shadow-inner">
                      <Loader2 size={28} className="text-[#F5990D] animate-spin mb-3" />
                      <h4 className="font-black text-white text-base sm:text-lg mb-1">Menganalisis Data</h4>
                      <p className="text-[11px] sm:text-xs text-[#DDE2D6] font-medium leading-relaxed max-w-[200px]">
                        Menyinkronkan data toko dan pesanan secara real-time...
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                      
                      <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 overflow-y-auto pr-1 hide-scrollbar">
                        {(() => {
                          const content = messages.filter(m => m.role === 'assistant').pop()?.content || "";
                          let rawCards = content.split(/---|\n(?=TITLE:)/i)
                            .map(c => c.trim())
                            .filter(c => c.length > 5 && /TITLE:/i.test(c));
                          
                          // Default fallback cards if model returned less than 2
                          if (rawCards.length === 0) {
                            const lowStockProd = products.find(p => p.stock < 5);
                            const pendingOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
                            const card1T = lowStockProd ? "Stok Menipis" : (pendingOrdersCount > 0 ? "Pesanan Masuk" : "Status Etalase");
                            const card1V = lowStockProd ? `${lowStockProd.title} (${lowStockProd.stock} Pcs)` : (pendingOrdersCount > 0 ? `${pendingOrdersCount} Pesanan Baru` : `${products.length} Produk`);
                            const card1D = lowStockProd ? `Stok ${lowStockProd.title} tersisa ${lowStockProd.stock} pcs. Segera restok.` : (pendingOrdersCount > 0 ? `Ada ${pendingOrdersCount} pesanan aktif yang perlu diproses.` : `Semua ${products.length} produk di etalase aktif.`);
                            const card1Text = pendingOrdersCount > 0 ? "Proses Pesanan" : "Kelola Produk";
                            const card1Url = pendingOrdersCount > 0 ? "/hub/orders" : "/hub/store";

                            const startOfToday = new Date();
                            startOfToday.setHours(0, 0, 0, 0);
                            const futureEventsList = (events || [])
                              .filter(e => new Date(e.eventDate) >= startOfToday)
                              .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
                            const upcomingEvt = futureEventsList.length > 0 ? futureEventsList[0] : null;

                            const temp = weather?.temperature_2m;
                            const card2T = upcomingEvt ? "Agenda Terdekat" : (temp ? "Cuaca Kandang" : "Jadwal Kandang");
                            const card2V = upcomingEvt ? upcomingEvt.title : (temp ? `${Math.round(temp)}°C` : "Operasional");
                            const card2D = upcomingEvt 
                              ? `Agenda: ${upcomingEvt.title} pada ${new Date(upcomingEvt.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}.`
                              : (temp && temp > 30 ? `Suhu ${Math.round(temp)}°C tergolong tinggi. Pastikan pakan & air minum.` : 'Kelola rutinitas pakan dan kesehatan ternak hari ini.');

                            rawCards.push(
                              `TITLE: ${card1T}\nVALUE: ${card1V}\nDESC: ${card1D}\nCTA_TEXT: ${card1Text}\nCTA_URL: ${card1Url}`,
                              `TITLE: ${card2T}\nVALUE: ${card2V}\nDESC: ${card2D}\nCTA_TEXT: Cek Kalender\nCTA_URL: /hub/calendar`
                            );
                          } else if (rawCards.length === 1) {
                            const startOfToday = new Date();
                            startOfToday.setHours(0, 0, 0, 0);
                            const futureEventsList = (events || [])
                              .filter(e => new Date(e.eventDate) >= startOfToday)
                              .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
                            const upcomingEvt = futureEventsList.length > 0 ? futureEventsList[0] : null;

                            const temp = weather?.temperature_2m;
                            const secondTitle = upcomingEvt ? "Agenda Terdekat" : (temp ? "Cuaca Kandang" : "Jadwal Kandang");
                            const secondVal = upcomingEvt ? upcomingEvt.title : (temp ? `${Math.round(temp)}°C` : "Operasional");
                            const secondDesc = upcomingEvt 
                              ? `Agenda: ${upcomingEvt.title} pada ${new Date(upcomingEvt.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}.`
                              : (temp && temp > 30 ? `Suhu ${Math.round(temp)}°C tergolong tinggi. Pastikan pakan & air minum.` : 'Kelola rutinitas pakan dan kesehatan ternak hari ini.');
                            
                            rawCards.push(
                              `TITLE: ${secondTitle}\nVALUE: ${secondVal}\nDESC: ${secondDesc}\nCTA_TEXT: Cek Kalender\nCTA_URL: /hub/calendar`
                            );
                          }

                          return rawCards.slice(0, 2).map((raw, idx) => {
                            const titleMatch = raw.match(/TITLE:\s*(.*)/i);
                            const valMatch = raw.match(/VALUE:\s*(.*)/i);
                            const descMatch = raw.match(/DESC:\s*(.*)/i);
                            const ctaTextMatch = raw.match(/CTA_TEXT:\s*(.*)/i);
                            const ctaUrlMatch = raw.match(/CTA_URL:\s*(.*)/i);
                            
                            const title = titleMatch ? titleMatch[1].replace(/\*/g, '').trim() : (idx === 0 ? 'Status Toko' : 'Jadwal Kandang');
                            const val = valMatch ? valMatch[1].replace(/\*/g, '').trim() : (idx === 0 ? 'Aktif' : 'Operasional');
                            const desc = descMatch ? descMatch[1].replace(/\*/g, '').trim() : (idx === 0 ? 'Pantau pesanan peternakan Anda.' : 'Kelola rutinitas pakan ternak hari ini.');
                            const ctaText = ctaTextMatch ? ctaTextMatch[1].replace(/\*/g, '').trim() : (idx === 0 ? 'Edit Produk' : 'Cek Kalender');
                            const ctaUrl = ctaUrlMatch ? ctaUrlMatch[1].replace(/\*/g, '').trim() : (idx === 0 ? '/hub/store' : '/hub/calendar');

                            return (
                              <div key={idx} className="bg-white/10 rounded-xl border border-white/20 p-2.5 sm:p-3 backdrop-blur-md shadow-sm flex flex-col hover:bg-white/15 transition-colors group">
                                <div className="flex flex-col mb-1.5">
                                  <div className="mb-0.5">
                                    <h4 className="text-[9px] font-black text-[#A4C4A8] uppercase tracking-wider mb-0.5">{title}</h4>
                                    <div className="text-lg sm:text-xl font-black text-white leading-tight break-words">{val}</div>
                                  </div>
                                  <p className="text-[10px] font-medium text-white/90 leading-snug">
                                    {desc}
                                  </p>
                                </div>
                                {!isLoading && ctaUrl !== '/hub/intelligence' && (
                                  <div className="flex justify-end border-t border-white/10 pt-2 mt-auto">
                                    <Link href={ctaUrl} className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-white text-[#2B4C3B] px-3 py-1 rounded-full hover:bg-[#EEF2E6] transition-colors shadow-sm group-hover:scale-105 origin-right">
                                      {ctaText} <ChevronRight size={10} />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      <div className="shrink-0 pt-2.5 sm:pt-3 flex justify-end border-t border-white/10 mt-2.5 sm:mt-3">
                        <Link href="/hub/intelligence" className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-extrabold text-[#2B4C3B] bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-[#EEF2E6] transition-all shadow-md hover:shadow-lg active:scale-95 w-fit">
                          <span>Buka</span>
                          <img src="/logos/intelligence/intelligence-black.webp" alt="Pranata Intelligence" className="h-4.5 sm:h-6 w-auto object-contain my-0.5" loading="lazy" decoding="async" />
                          <ChevronRight size={15} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
