const { Telegraf, Markup } = require('telegraf');
const { tiktok_downloader } = require('./tiktok-api/tiktok');
const fs = require('fs');
require('dotenv').config();

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN tidak ditemukan. Pastikan Anda sudah mengatur file .env dengan benar.');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Fungsi untuk menulis log ke file
const writeLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync('bot_log.txt', logMessage);
};

// Tanggapan untuk perintah /start
bot.start((ctx) => {
  ctx.reply('Halo! Kirimkan tautan video TikTok untuk mendapatkan tombol unduhan.');
  writeLog(`User ${ctx.from.username || ctx.from.id} memulai bot.`);
});

bot.on('text', async (ctx) => {
  const url = ctx.message.text;
  const userId = ctx.from.username || ctx.from.id;

  writeLog(`User ${userId} mengirimkan: ${url}`);

  if (!url.includes('tiktok.com')) {
    ctx.reply('Harap kirimkan tautan TikTok yang valid.');
    writeLog(`User ${userId} mengirimkan tautan tidak valid.`);
    return;
  }

  ctx.reply('Sedang memproses tautan TikTok Anda...');
  writeLog(`Sedang memproses tautan dari user ${userId}...`);

  try {
    const result = await tiktok_downloader(url);

    if (result.videoSD || result.videoHD) {
      // Buat tombol inline keyboard dengan tautan asli
      const buttons = [];
      if (result.videoSD) buttons.push([Markup.button.url('Download SD', result.videoSD)]);
      if (result.videoHD) buttons.push([Markup.button.url('Download HD', result.videoHD)]);

      ctx.reply(
        'Klik tombol di bawah untuk mengunduh video:',
        Markup.inlineKeyboard(buttons)
      );

      writeLog(`Berhasil mengirim tombol unduhan ke user ${userId}`);
    } else {
      ctx.reply('Maaf, tidak dapat menemukan tautan unduhan untuk video ini.');
      writeLog(`Gagal menemukan video untuk user ${userId}.`);
    }
  } catch (error) {
    console.error('Gagal mengunduh video TikTok:', error);
    ctx.reply('Terjadi kesalahan saat mengambil tautan unduhan.');
    writeLog(`Error saat memproses tautan dari user ${userId}: ${error.message}`);
  }
});

// Jalankan bot Telegram
bot.launch();
console.log('Bot Telegram untuk TikTok downloader sedang berjalan...');
writeLog('Bot Telegram telah dimulai.');

// Menangani penghentian dengan aman
process.once('SIGINT', () => {
  writeLog('Bot dihentikan (SIGINT).');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  writeLog('Bot dihentikan (SIGTERM).');
  bot.stop('SIGTERM');
});
