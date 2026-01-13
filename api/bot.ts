
// File ini berjalan sebagai Vercel Serverless Function
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { message } = body;

    // Telegram mengirim update kosong atau bukan pesan
    if (!message) return new Response('OK', { status: 200 });

    const chatId = message.chat.id;
    const text = message.text || '';
    const senderName = message.from.first_name || 'Admin';

    // 1. AMBIL TOKEN DARI DATABASE
    const { data: settings } = await supabase.from('settings').select('telegram_bot_token').single();
    const BOT_TOKEN = settings?.telegram_bot_token || '';

    if (!BOT_TOKEN) {
        console.error("Bot Token not found in database settings");
        return new Response('OK', { status: 200 });
    }

    // 2. Perintah Start / Bantuan
    if (text === '/start' || text === '❓ Bantuan') {
      await sendTelegramMessage(BOT_TOKEN, chatId, `<b>🚀 S2 CONSOLE CONNECTED!</b>\n\nHalo <b>${senderName}</b>! Bot telah terhubung ke SMKN 2 Tembilahan.\n\n<b>Gunakan tombol di bawah:</b>`, {
        keyboard: [
          [{ text: "📊 Statistik Hari Ini" }, { text: "🌐 Status Website" }],
          [{ text: "📢 Tambah Berita" }, { text: "📸 Tambah Galeri" }],
          [{ text: "❓ Bantuan" }]
        ],
        resize_keyboard: true
      });
    } 
    
    // 3. Statistik
    else if (text === "📊 Statistik Hari Ini") {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase.from('visitors').select('*', { count: 'exact', head: true }).gt('visited_at', today);
      
      await sendTelegramMessage(BOT_TOKEN, chatId, `<b>📊 LAPORAN PENGUNJUNG</b>\n\n📅 Tanggal: <b>${today}</b>\n👥 Total Visitor: <b>${count || 0} Orang</b>\n\nWebsite berjalan normal.`);
    }

    // 4. Status
    else if (text === "🌐 Status Website") {
      await sendTelegramMessage(BOT_TOKEN, chatId, `<b>🌐 STATUS INFRASTRUKTUR</b>\n\n✅ Cloud: <b>Vercel Edge</b>\n✅ DB: <b>Supabase Realtime</b>\n✅ Web: <b>Online</b>`);
    }

    // 5. Tambah Berita (Format Instruksi)
    else if (text === "📢 Tambah Berita") {
      await sendTelegramMessage(BOT_TOKEN, chatId, `<b>FORMAT POSTING BERITA:</b>\n\nKetik:\n<code>/news Judul | Isi Berita</code>`);
    }

    // 6. Simpan ke Inbox via /news
    else if (text.startsWith('/news ')) {
      await saveToInbox(senderName, text, null, body);
      await sendTelegramMessage(BOT_TOKEN, chatId, `✅ <b>BERITA MASUK INBOX!</b>\nCek Dashboard Admin untuk verifikasi.`);
    }

    // 7. Penanganan Foto (Caption Otomatis)
    else if (message.photo) {
      // Ambil foto resolusi tertinggi (terakhir di array)
      const photo = message.photo[message.photo.length - 1];
      const fileUrl = await getFileUrl(BOT_TOKEN, photo.file_id);
      
      const caption = message.caption || 'Foto Kiriman Telegram';
      
      await saveToInbox(senderName, caption, fileUrl, body);
      await sendTelegramMessage(BOT_TOKEN, chatId, `📸 <b>FOTO DITERIMA!</b>\nSudah masuk ke tab Bot Inbox di Dashboard.`);
    }

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error("Bot Error:", err);
    return new Response('Internal Server Error', { status: 200 }); 
  }
}

async function sendTelegramMessage(token: string, chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });
  } catch (e) {
    console.error("Failed to send telegram message", e);
  }
}

async function getFileUrl(token: string, fileId: string) {
  const url = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok) {
        return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
    }
  } catch (e) {
    console.error("Failed to get file URL", e);
  }
  return null;
}

async function saveToInbox(sender: string, text: string, imageUrl: string | null, raw: any) {
  try {
    await supabase.from('telegram_inbox').insert([{
      sender_name: sender,
      message_text: text,
      image_url: imageUrl,
      raw_data: raw,
      status: 'pending',
      created_at: new Date().toISOString()
    }]);
  } catch (e) {
    console.error("Failed to save to Supabase", e);
  }
}
