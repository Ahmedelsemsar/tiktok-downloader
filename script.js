
 // Paste link automatically from clipboard
async function pasteLink() {
    try {
        const text = await navigator.clipboard.readText();

        if (text) {
            document.getElementById('tiktokUrl').value = text;
        } else {
            alert('الحافظة فارغة');
        }
    } catch (err) {
        alert('يرجى السماح بالوصول للحافظة أو لصق الرابط يدوياً');
    }
}

// Download TikTok Video Function via Netlify Local Function
async function downloadVideo() {
    const inputUrl = document.getElementById('tiktokUrl');
    const btn = document.getElementById('downloadBtn');
    const resultDiv = document.getElementById('result');

    const tiktokUrl = inputUrl.value.trim();

    if (!tiktokUrl) {
        alert('من فضلك أدخل رابط تيك توك صحيح');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = 'جاري المعالجة...';
    resultDiv.innerHTML = '';

    try {
        // الاتصال بسيرفر Netlify
        const response = await fetch(
            `/.netlify/functions/download?url=${encodeURIComponent(tiktokUrl)}`
        );

        const resData = await response.json();

        if (!response.ok) {
            throw new Error(resData.error || 'فشل جلب البيانات');
        }

        const data = resData.data;

        if (data && data.play) {
            const videoLink = data.play;
            const title = data.title || 'فيديو تيك توك';
            const author = data.author?.unique_id || 'TikTok';
            const cover = data.cover || '';

            resultDiv.innerHTML = `
                <div class="video-card">
                    <h3>${title}</h3>
                    <p>صاحب الفيديو: <strong>${author}</strong></p>

                    ${cover ? `<img src="${cover}" alt="Video Cover">` : ''}

                    <a
                        href="${videoLink}"
                        target="_blank"
                        download
                        class="btn-download-now"
                    >
                        تحميل الفيديو بدون علامة مائية
                        <svg class="dl-icon" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H4l8 8 8-8z"
                            />
                        </svg>
                    </a>
                </div>
            `;
        } else {
            alert('تعذر جلب الفيديو، تأكد من صحة الرابط.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء الاتصال بالسيرفر، جرب مرة أخرى.');
    } finally {
        btn.disabled = false;

        btn.innerHTML = `
            تحميل الفيديو
            <svg class="dl-icon" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H4l8 8 8-8z"
                />
            </svg>
        `;
    }
}
