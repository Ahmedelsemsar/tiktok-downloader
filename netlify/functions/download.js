const https = require('https');

exports.handler = async function (event, context) {
    const url = event.queryStringParameters.url;

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL is required' })
        };
    }

    try {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;

        const data = await new Promise((resolve, reject) => {
            https.get(apiUrl, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(body)); } 
                    catch (e) { reject(e); }
                });
            }).on('error', (err) => reject(err));
        });

        if (data && data.code === 0 && data.data) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    data: {
                        title: data.data.title,
                        author: { unique_id: data.data.author?.unique_id || 'TikTok User' },
                        cover: data.data.cover,
                        play: data.data.play,
                        hdplay: data.data.hdplay || data.data.play,
                        music: data.data.music || data.data.play
                    }
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Failed to fetch video data' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};