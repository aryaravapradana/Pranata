import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(req: Request) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });

  const { messages, contextData } = await req.json();

  // Token Optimization: Compact context objects to essential fields only
  const compactProducts = contextData?.products?.slice(0, 4).map((p: any) => ({
    title: p.title,
    price: p.price,
    stock: p.stock,
    category: p.category
  })) || [];

  const compactOrders = contextData?.orders?.slice(0, 4).map((o: any) => ({
    status: o.status,
    totalAmount: o.totalAmount
  })) || [];

  const dynamicContext = contextData ? `
INFO KONTEKS (HEMAT TOKEN):
- User: ${contextData.profile?.fullName || contextData.profile?.username || 'Peternak'}
- Produk Toko (${contextData.products?.length || 0} items): ${JSON.stringify(compactProducts)}
- Total Produk Market: ${contextData.allMarketplaceCount || 0}
- Pesanan Toko: ${JSON.stringify(compactOrders)}
- Cuaca: ${contextData.weather?.temperature_2m ? `${Math.round(contextData.weather.temperature_2m)}°C` : 'N/A'}
  ` : "";

  // Token Optimization: Limit history to last 6 messages max
  const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];

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

  try {
    const result = await streamText({
      model: google('gemini-3.6-flash') as any,
      maxTokens: 500, // Reduced for FinOps token efficiency
      system: `Anda adalah "Pranata Intelligence", konsultan AI peternakan, manajemen kandang, logistik, dan bisnis peternak.

TUGAS:
1. Diagnosis penyakit ternak (Veterinary).
2. Saran operasional kandang & pakan (Management & Business).

INFORMASI PLATFORM PRANATA:
- Marketplace: Jual beli Daging, Susu, Telur. (TIDAK ADA ternak hidup/sayur/buah/alat).
- Fitur: Marketplace, Calendar, AI Veterinary, Store Manager.
- Keterbatasan: Tidak ada IoT/sensor otomatis, tidak ada ternak hidup.

FORMATTING:
- Jawab singkat, padat, ramah, dan to the point.
- Gunakan markdown bullet points dan **bold**. JANGAN buat paragraf panjang.${dynamicContext}`,
      messages: coreMessages as any,
    });

    return result.toAIStreamResponse();
  } catch (error: any) {
    console.error("AI Insight Error:", error?.message || error);
    if (error?.stack) console.error(error.stack);
    
    const errorDetails = error?.message ? ` (${error.message})` : "";
    const fallbackText = `TITLE: Perhatian API\nVALUE: Limit / Key Invalid\nDESC: AI Insight offline${errorDetails}. Pastikan GEMINI_API_KEY di .env.local valid (dari Google AI Studio).\nCTA_TEXT: Mengerti\nCTA_URL: /hub\n---\nTITLE: Info Status\nVALUE: Mode Fallback\nDESC: Aplikasi tetap berfungsi normal, silakan lanjutkan pengelolaan toko Anda.\nCTA_TEXT: Lihat Etalase\nCTA_URL: /hub/store`;
    
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
}
