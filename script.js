// VIDOX Engine JS Core

function clearInput() {
    document.getElementById('tiktokUrl').value = '';
}

async function pasteLink() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            document.getElementById('tiktokUrl').value = text;
        } else {
            alert('الحافظة فارغة');
        }
    } catch (err) {
        alert('يرجى لصق الرابط يدوياً');
    }
}

// Language Switcher Toggle
let currentLang = 'ar';
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.getElementById('langToggle').innerText = currentLang === 'ar' ? 'EN' : 'AR';
    
    if(currentLang === 'en') {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
        document.getElementById('txtTitle').innerHTML = 'Your video. <span class="cyan-gradient">Your way.</span>';
        document.getElementById('txtSubtitle').innerText = 'A simple, clear, and modern way to work with supported video links.';
        document.getElementById('btnText').innerText = 'Analyze Link';
    } else {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
        document.getElementById('txtTitle').innerHTML = 'تعامل مع فيديوهاتك <span class="cyan-gradient">بسهولة</span>';
        document.getElementById('txtSubtitle').innerText = 'أداة سهلة وسريعة للتعامل مع روابط الفيديوهات المدعومة، من مكان واحد.';
        document.getElementById('btnText').innerText = 'تحليل الرابط';
    }
}

// Download Process
async function downloadVideo() {
    const inputUrl = document.getElementById('tiktokUrl').value.trim();
    const btn = document.getElementById('downloadBtn');
    const resultDiv = document.getElementById('result');

    if (!inputUrl) {
        alert(currentLang === 'ar' ? 'من فضلك أدخل رابط فيديو صحيح' : 'Please enter a valid URL');
        return;
    }

    btn.disabled = true;
    document.getElementById('btnText').innerText = currentLang === 'ar' ? 'جاري التحليل...' : 'Analyzing...';
    resultDiv.innerHTML = '';

    try {
        const response = await fetch(`/.netlify/functions/download?url=${encodeURIComponent(inputUrl)}`);
        const resData = await response.json();

        if (!response.ok) throw new Error(resData.error || 'Failed');

        const data = resData.data;

        if (data && data.play) {
            const title = data.title || 'TikTok Video';
            const author = data.author?.unique_id || 'TikTok User';
            const cover = data.cover || '';
            const normalPlay = data.play;
            const hdPlay = data.hdplay || data.play;
            const musicPlay = data.music || data.play;

            resultDiv.innerHTML = `
                <div style="background: #111A29; border: 1px solid #1E2D45; border-radius: 12px; padding: 20px; margin-top: 25px; text-align: center;">
                    <h3 style="color: #fff; font-size: 16px; margin-bottom: 10px;">${title}</h3>
                    <p style="color: #8E9BAE; font-size: 14px; margin-bottom: 15px;">@${author}</p>
                    ${cover ? `<img src="${cover}" style="width: 120px; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">` : ''}

                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="showAdBeforeDownload('${hdPlay}', 'VIDOX_HD_${Date.now()}.mp4')" style="background: linear-gradient(135deg, #42DDF5, #1B82F6); color: #000; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 800; cursor: pointer;">
                            👑 تحميل HD (السريع)
                        </button>
                        <button onclick="forceDownload('${normalPlay}', 'VIDOX_Normal_${Date.now()}.mp4')" style="background: #1E2D45; color: #fff; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                            📥 تحميل عادي
                        </button>
                        <button onclick="forceDownload('${musicPlay}', 'VIDOX_Audio_${Date.now()}.mp3')" style="background: rgba(66, 221, 245, 0.15); color: #42DDF5; border: 1px solid #42DDF5; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                            🎵 تحميل MP3
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        alert(currentLang === 'ar' ? 'تعذر جلب البيانات، تأكد من صحة الرابط.' : 'Failed to fetch video data.');
    } finally {
        btn.disabled = false;
        document.getElementById('btnText').innerText = currentLang === 'ar' ? 'تحليل الرابط' : 'Analyze Link';
    }
}

// Ad Modal Flow for HD
let pendingHdUrl = '', pendingHdName = '';

function showAdBeforeDownload(url, name) {
    pendingHdUrl = url;
    pendingHdName = name;
    
    const modal = document.getElementById('adModal');
    const timer = document.getElementById('countdownTimer');
    const finalBtn = document.getElementById('finalHdBtn');
    
    modal.style.display = 'flex';
    let sec = 5;

    const interval = setInterval(() => {
        sec--;
        if (sec > 0) {
            timer.innerText = `يرجى الانتظار (${sec}) ثوانٍ...`;
        } else {
            clearInterval(interval);
            timer.innerText = `الرابط جاهز للتحميل! 🎉`;
            finalBtn.disabled = false;
            finalBtn.className = 'btn-primary';
            finalBtn.style.background = 'linear-gradient(135deg, #42DDF5, #1B82F6)';
            finalBtn.style.color = '#000';
            finalBtn.innerText = '👑 تحميل الفيديو الآن';
            finalBtn.onclick = () => {
                closeAdModal();
                forceDownload(pendingHdUrl, pendingHdName);
            };
        }
    }, 1000);
}

function closeAdModal() {
    document.getElementById('adModal').style.display = 'none';
}

// iOS & Universal Direct Download Fix
async function forceDownload(fileUrl, filename) {
    try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
    } catch (e) {
        window.open(fileUrl, '_blank');
    }
}

// Legal Content Pages for AdSense Qualification
const legalTexts = {
    privacy: `
        <h2>سياسة الخصوصية (Privacy Policy)</h2>
        <p>نحن في منصة VIDOX نحترم خصوصيتك للغاية. لا نقوم بتخزين أو الاحتفاظ ببيانات الفيديو أو الروابط التي تدخلها في سيرفراتنا.</p>
        <p>جميع عمليات المعالجة تتم بشكل لحظي، ولا نطلب تسجيلاً أو معلومات شخصية للاستخدام.</p>
    `,
    terms: `
        <h2>شروط الاستخدام (Terms of Use)</h2>
        <p>أداة VIDOX مخصصة للاستخدام الشخصي والقانوني فقط بالنسبة للمحتوى المصرح لك بالوصول إليه.</p>
        <p>المستخدم مسؤول مسؤولية كاملة عن مراعاة حقوق الملكية الفكرية وشروط منصة TikTok.</p>
    `,
    contact: `
        <h2>اتصل بنا (Contact Us)</h2>
        <p>إذا كان لديك أي استفسار أو اقتراح، يمكنك التواصل مع المطور والمؤسس لمنصة VIDOX:</p>
        <p style="margin-top: 10px;"><strong>المطور / Developer:</strong> Ahmed Elsemsar 👑</p>
        <p><strong>البريد الإلكتروني:</strong> support@vidox.app</p>
    `
};

function openLegal(type) {
    document.getElementById('legalBody').innerHTML = legalTexts[type];
    document.getElementById('legalModal').style.display = 'flex';
}

function closeLegalModal() {
    document.getElementById('legalModal').style.display = 'none';
}