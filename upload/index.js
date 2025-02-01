const { Telegraf } = require('telegraf');
const {tiktok_downloader}  = require('./tiktok-api/tiktok');
require('dotenv').config(); // Menggunakan dotenv untuk menyimpan token bot

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN tidak ditemukan. Pastikan Anda sudah mengatur file .env dengan benar.');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Tanggapan untuk perintah /start
bot.start((ctx) => {
  ctx.reply('Halo! Kirimkan tautan video TikTok untuk mengunduh.');
});

// Menangani pesan yang berisi tautan TikTok
bot.on('text', async (ctx) => {
  const url = ctx.message.text;

  // Validasi sederhana untuk mendeteksi URL TikTok
  if (!url.includes('tiktok.com')) {
    return ctx.reply('Harap kirimkan tautan TikTok yang valid.');
  }

  ctx.reply('Sedang memproses tautan TikTok Anda...');

  try {
    const result = await tiktok_downloader(url);

    if (result.videoUrl) {
      await ctx.replyWithVideo({ url: result.videoUrl }, 
        { caption: 'Berikut video TikTok yang Anda minta.' });
        ctx.reply('kunjungi tikme.ddns.net untuk video hd');
    } else {
      ctx.reply('Maaf, tidak dapat menemukan video dari tautan tersebut.');
    }
  } catch (error) {
    console.error('Gagal mengunduh video TikTok:', error);
    ctx.reply('Terjadi kesalahan saat mengunduh video TikTok.');
  }
});

// bot.on('text', async (ctx) => {
//     const url = ctx.message.text;
  
//     if (!url.includes('tiktok.com')) {
//       return ctx.reply('Harap kirimkan tautan TikTok yang valid.');
//     }
  
//     ctx.reply('Sedang memproses tautan TikTok Anda...');
  
//     try {
//       const result = await tiktok_downloader(url);
//       //op
//         if (result.videoUrl) {
//         await ctx.replyWithVideo({ url: result.videoUrl }, { caption: 'Berikut video TikTok yang Anda minta.' });
//         }
  
//         if (result.videoSD) { //if (result.videoSD || result.videoHD) {
//         const responseMessage = `
//         Berikut tautan video TikTok yang Anda minta:
//         - Video SD: ${result.videoSD || 'Tidak tersedia'}
//         - Video HD: ${result.videoHD || 'Tidak tersedia'}
//         `;
//         ctx.reply(responseMessage.trim());
//       } else {
//         ctx.reply('Maaf, tidak dapat menemukan video dari tautan tersebut.');
//       }
//     } catch (error) {
//       console.error('Gagal mengunduh video TikTok:', error);
//       ctx.reply('Terjadi kesalahan saat mengunduh video TikTok.');
//     }
//   });

  
// Jalankan bot Telegram
bot.launch();

// Informasi debugging
console.log('Bot Telegram untuk TikTok downloader sedang berjalan...');

// Menangani penghentian dengan aman
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
