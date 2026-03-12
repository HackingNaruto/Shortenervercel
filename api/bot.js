const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const AROLINKS_API_KEY = process.env.API_KEY;

bot.start((ctx) => {
    ctx.reply('Arolinks Shortener Bot Ready! Post anupunga, link-ai short panni tharen.');
});

bot.on('text', async (ctx) => {
    try {
        const originalText = ctx.message.text;

        // 1. "@" line filter (Username irukura line-ai delete panrom)
        const lines = originalText.split('\n');
        const filteredLines = lines.filter(line => !line.trim().startsWith('@'));
        let processedText = filteredLines.join('\n');

        // 2. HTTP/HTTPS URLs-ai detect panna Regex
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urlsFound = processedText.match(urlRegex);

        if (urlsFound && urlsFound.length > 0) {
            // Processing message (Optionally)
            // await ctx.reply('Shortening links, please wait...');

            for (const longUrl of urlsFound) {
                try {
                    // Arolinks API Call
                    // API Format: https://arolinks.com/api?api={api_key}&url={your_url}
                    const apiUrl = `https://arolinks.com/api?api=${AROLINKS_API_KEY}&url=${encodeURIComponent(longUrl)}`;
                    
                    const response = await axios.get(apiUrl);
                    
                    // Arolinks usually returns JSON with "shortenedUrl" or similar field. 
                    // Most shorteners return it in response.data.shortenedUrl
                    if (response.data && response.data.shortenedUrl) {
                        const shortUrl = response.data.shortenedUrl;
                        processedText = processedText.replace(longUrl, shortUrl);
                    }
                } catch (err) {
                    console.error("Arolinks Error for:", longUrl, err.message);
                }
            }
            await ctx.reply(processedText, { disable_web_page_preview: true });
        } else {
            await ctx.reply(processedText || "No links or content found.");
        }

    } catch (error) {
        console.error("Main Error:", error);
        await ctx.reply("Oru error vandhuchu, thirumba try pannunga.");
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Arolinks Bot is running!');
    }
};
