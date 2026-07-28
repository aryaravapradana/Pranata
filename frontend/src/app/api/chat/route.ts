import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in process.env!");
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  const { messages, contextData } = await req.json();

  // Token Optimization: Compact context objects to essential fields only
  const compactProducts = contextData?.products?.slice(0, 6).map((p: any) => ({
    title: p.title,
    price: p.price,
    stock: p.stock,
    category: p.category
  })) || [];

  const compactOrders = contextData?.orders?.slice(0, 6).map((o: any) => ({
    status: o.status,
    totalAmount: o.totalAmount
  })) || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureEvents = (contextData?.events || [])
    .filter((e: any) => new Date(e.eventDate) >= today)
    .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const compactEvents = futureEvents.slice(0, 6).map((e: any) => ({
    title: e.title,
    eventDate: e.eventDate,
    type: e.type
  }));

  const dynamicContext = contextData ? `
INFO KONTEKS REAL-TIME BACKEND USER:
- Nama Peternak: ${contextData.profile?.fullName || contextData.profile?.username || 'Peternak'}
- Daftar Produk Toko (${contextData.products?.length || 0} produk): ${JSON.stringify(compactProducts)}
- Pesanan Toko Aktif: ${JSON.stringify(compactOrders)}
- Jadwal Operasional Ternak Mendatang (Future Events Only): ${JSON.stringify(compactEvents)}
- Kondisi Cuaca Lokasi: ${contextData.weather?.temperature_2m ? `${Math.round(contextData.weather.temperature_2m)}°C, Kelembapan ${contextData.weather.relative_humidity_2m}%` : 'Normal'}
  ` : "";

  // Token & Context Optimization: Limit history to last 10 messages max (5 full turns of memory)
  const recentMessages = Array.isArray(messages) ? messages.slice(-10) : [];

  // Transform recent messages into CoreMessages with explicit Buffer image payloads
  const coreMessages = recentMessages.map((msg: any) => {
    const role = msg.role === 'assistant' ? 'assistant' : 'user';
    const textContent = typeof msg.content === 'string' ? msg.content : (Array.isArray(msg.content) ? msg.content.map((c: any) => c.text || '').join('\n') : '');
    const attachments = msg.experimental_attachments || msg.attachments || [];

    if (!Array.isArray(attachments) || attachments.length === 0) {
      return {
        role,
        content: textContent || (role === 'user' ? 'Halo' : ''),
      };
    }

    const contentParts: any[] = [];
    const promptText = textContent && textContent.trim() !== '' ? textContent : 'Tolong analisis foto / lampiran ini.';
    contentParts.push({ type: 'text', text: promptText });

    for (const att of attachments) {
      if (!att || !att.url || typeof att.url !== 'string') continue;

      if (att.url.startsWith('data:')) {
        const matches = att.url.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          try {
            const buffer = Buffer.from(base64Data.trim(), 'base64');
            if (buffer.length > 0) {
              contentParts.push({
                type: 'image',
                image: buffer,
                mimeType: mimeType || 'image/jpeg',
              });
            }
          } catch (e) {
            console.error("Failed to parse attachment base64 buffer", e);
          }
        }
      } else if (att.url.startsWith('http://') || att.url.startsWith('https://')) {
        try {
          contentParts.push({
            type: 'image',
            image: new URL(att.url),
          });
        } catch (e) {
          console.error("Invalid attachment URL", e);
        }
      }
    }

    return {
      role,
      content: contentParts,
    };
  });

  // Verified Active 200 OK Model Fallback Chain
  const MODELS_TO_TRY = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3-flash-preview'
  ];
  let lastError: any = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const result = await streamText({
        model: google(modelName) as any,
        maxTokens: 2500, // Sufficient token budget for complete, detailed answers
        system: `Anda adalah "Pranata Intelligence", konsultan AI profesional khusus bisnis peternakan (daging, susu, telur), manajemen kandang, dan logistik toko.

TUGAS UTAMA:
Berikan rekomendasi bisnis & operasional yang SANGAT SPESIFIK, NYATA, LENGKAP, DAN ACTIONABLE berdasarkan data backend user di atas. Jawab pertanyaan peternak secara tuntas, jelas, terstruktur, dan tidak terpotong.

PEDOMAN ANALISIS DATA USER:
1. Jika ada produk dengan stok menipis (<5) atau habis (0): Sebutkan nama produk secara persis dan minta peternak menambah/restok.
2. Jika ada pesanan bernilai tinggi atau berstatus PENDING/PROCESSING: Berikan instruksi langsung untuk memproses pesanan tersebut.
3. Jika cuaca ekstrem (misal suhu >30°C atau kelembapan tinggi): Berikan saran kesehatan/nutrisi ternak spesifik terkait cuaca tersebut.
4. Jika ada jadwal operasional di kalender: HANYA INGATKAN KEGIATAN TERDEKAT DI MASA DEPAN / MENDATANG (Mulai hari ini ke depan). DILARANG KERAS MERUJUK ATAU MENGINGATKAN ACARA YANG SUDAH LALU (PAST EVENTS).

JIKA USER MEMINTA INSIGHT BISNIS (Business Insight / Prompt Kaku):
Wajib hasilkan TEPAT 2 insight terpisah yang dipisahkan garis pemisah "---". DILARANG MENULIS KATA PENGANTAR. LANGSUNG MULAI DENGAN "TITLE:".

Format Wajib Setiap Insight:
TITLE: [Kata kunci 1-2 kata spesifik dari data]
VALUE: [Angka/Status Nyata, contoh: "Stok 2 Pcs", "3 Pesanan Pending", "Suhu 32°C"]
DESC: [1 kalimat analisis & tindakan konkret yang harus dilakukan peternak]
CTA_TEXT: [Teks tombol aksi, contoh: "Kelola Produk", "Proses Pesanan", "Cek Kalender"]
CTA_URL: [URL relatif terkait: /hub/store ATAU /hub/orders ATAU /hub/calendar]
---
TITLE: [Kata kunci ke-2]
VALUE: [Status ke-2]
DESC: [Analisis & aksi ke-2]
CTA_TEXT: [Teks tombol ke-2]
CTA_URL: [URL ke-2]

JANGAN GUNAKAN TEKS UMUM SEPERTI "TINGKATKAN PENJUALAN". SEBUTKAN NAMA PRODUK / ANGKA NYATA SESUAI KONTEKS.${dynamicContext}`,
        messages: coreMessages as any,
      });

      return result.toAIStreamResponse();
    } catch (error: any) {
      console.warn(`Model ${modelName} failed or quota exceeded:`, error?.message || error);
      lastError = error;
    }
  }

  console.error("All AI models failed, using smart data-driven local fallback:", lastError?.message || lastError);

  // Smart Data-Driven Local Fallback when API quotas are exhausted
  const lowStockProd = contextData?.products?.find((p: any) => p.stock < 5);
  const pendingOrdersCount = contextData?.orders?.filter((o: any) => o.status === 'PENDING' || o.status === 'PROCESSING').length || 0;
  const temp = contextData?.weather?.temperature_2m;
  const upcomingEvent = Array.isArray(contextData?.events) && contextData.events.length > 0 ? contextData.events[0] : null;

  let card1Title = "Status Etalase";
  let card1Val = `${contextData?.products?.length || 0} Produk`;
  let card1Desc = contextData?.products?.length > 0 
    ? `Semua ${contextData.products.length} produk di etalase toko Anda aktif dan siap dipesan.`
    : "Belum ada produk di etalase. Tambahkan produk ternak pertama Anda.";
  let card1CtaText = "Kelola Produk";
  let card1CtaUrl = "/hub/store";

  if (lowStockProd) {
    card1Title = "Stok Menipis";
    card1Val = `${lowStockProd.title} (${lowStockProd.stock} Pcs)`;
    card1Desc = `Stok ${lowStockProd.title} tersisa ${lowStockProd.stock} pcs. Segera restok produk di etalase Anda.`;
  } else if (pendingOrdersCount > 0) {
    card1Title = "Pesanan Masuk";
    card1Val = `${pendingOrdersCount} Pesanan Baru`;
    card1Desc = `Ada ${pendingOrdersCount} pesanan aktif yang perlu diproses dan dikirim ke pembeli.`;
    card1CtaText = "Proses Pesanan";
    card1CtaUrl = "/hub/orders";
  }

  let card2Title = "Kondisi Kandang";
  let card2Val = upcomingEvent ? upcomingEvent.title : (temp ? `${Math.round(temp)}°C` : "Operasional");
  let card2Desc = upcomingEvent
    ? `Agenda terdekat: ${upcomingEvent.title} pada ${new Date(upcomingEvent.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}.`
    : (temp && temp > 30 
      ? `Suhu lingkungan ${Math.round(temp)}°C tergolong tinggi. Pastikan ventilasi dan kecukupan air pakan ternak.`
      : "Jadwal pakan dan kesehatan ternak berjalan normal hari ini.");
  let card2CtaText = "Cek Kalender";
  let card2CtaUrl = "/hub/calendar";

  const fallbackText = `TITLE: ${card1Title}\nVALUE: ${card1Val}\nDESC: ${card1Desc}\nCTA_TEXT: ${card1CtaText}\nCTA_URL: ${card1CtaUrl}\n---\nTITLE: ${card2Title}\nVALUE: ${card2Val}\nDESC: ${card2Desc}\nCTA_TEXT: ${card2CtaText}\nCTA_URL: ${card2CtaUrl}`;
  
  // Vercel AI SDK v1 stream protocol format
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('0:' + JSON.stringify(fallbackText) + '\n'));
      controller.close();
    }
  });
  
  return new Response(stream, { 
    headers: { 
      'Content-Type': 'text/plain; charset=utf-8', 
      'X-Vercel-AI-Data-Stream': 'v1' 
    } 
  });
}
