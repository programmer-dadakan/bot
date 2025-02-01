const Tiktok = require('@tobyg74/tiktok-api-dl');

async function tiktok_downloader(url) {
  try {
    const result = await Tiktok.Downloader(url, {
      version: 'v3',
      proxy: '',
      showOriginalResponse: true,
    });

    if (result && result.result) {
      return {
        videoUrl: result.result.videoSD,
        videoHD: result.result.videoHD,
      };
    } else {
      throw new Error('Video not found in the result object structure');
    }
  } catch (error) {
    throw new Error(`Failed to download TikTok video: ${error.message}`);
  }
}

module.exports = {tiktok_downloader};
