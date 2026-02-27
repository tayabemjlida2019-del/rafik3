function updateStatus() {
    fetch('/api/status')
        .then(res => res.json())
        .then(data => {
            setStatus('docker', data.docker);
            setStatus('db', data.db);
            setStatus('api', data.api);
            setStatus('web', data.web);
        })
        .catch(err => console.error('Status check failed', err));
}

function setStatus(id, online) {
    const card = document.getElementById(`card-${id}`);
    const state = card.querySelector('.state');

    if (online) {
        state.innerText = 'يعمل بنجاح ✅';
        state.className = 'state online';
        card.style.borderColor = '#10b981';
    } else {
        state.innerText = 'متوقف ❌';
        state.className = 'state offline';
        card.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    }
}

document.getElementById('btn-start').addEventListener('click', () => {
    const btn = document.getElementById('btn-start');
    btn.disabled = true;
    btn.innerText = '⏳ جاري التشغيل...';
    btn.style.opacity = '0.6';

    addLog('🚀 جاري بدء تشغيل المنصة... يرجى الانتظار');
    addLog('📦 تشغيل Docker Compose...');

    fetch('/api/start', { method: 'POST' })
        .then(res => {
            if (res.ok) {
                addLog('✅ تم إرسال أمر التشغيل بنجاح');
                addLog('⏳ يتم الآن تشغيل الخدمات... قد يستغرق الأمر دقيقة واحدة');
                // Start checking status more frequently for 2 minutes
                let checks = 0;
                const fastPoll = setInterval(() => {
                    checks++;
                    fetch('/api/status')
                        .then(r => r.json())
                        .then(data => {
                            setStatus('docker', data.docker);
                            setStatus('db', data.db);
                            setStatus('api', data.api);
                            setStatus('web', data.web);

                            if (data.api && data.web) {
                                addLog('🎉 جميع الأنظمة تعمل الآن! يمكنك فتح الموقع.');
                                clearInterval(fastPoll);
                                btn.disabled = false;
                                btn.innerText = 'تشغيل المنصة بالكامل';
                                btn.style.opacity = '1';
                            }
                        });

                    if (checks >= 40) {  // Stop after ~2 minutes
                        clearInterval(fastPoll);
                        btn.disabled = false;
                        btn.innerText = 'تشغيل المنصة بالكامل';
                        btn.style.opacity = '1';
                        addLog('⚠️ انتهى وقت الانتظار. تحقق من الحالة يدوياً.');
                    }
                }, 3000);
            }
        })
        .catch(err => {
            addLog('❌ خطأ في إرسال أمر التشغيل: ' + err.message);
            btn.disabled = false;
            btn.innerText = 'تشغيل المنصة بالكامل';
            btn.style.opacity = '1';
        });
});

document.getElementById('btn-stop').addEventListener('click', () => {
    addLog('🛑 جاري إيقاف جميع الأنظمة...');
    fetch('/api/stop', { method: 'POST' })
        .then(() => {
            addLog('✅ تم إرسال أمر الإيقاف');
        });
});

function addLog(msg) {
    const logs = document.getElementById('logs');
    const time = new Date().toLocaleTimeString('ar-DZ');
    logs.innerHTML += `<div>[${time}] ${msg}</div>`;
    logs.scrollTop = logs.scrollHeight;
}

// Poll status every 5 seconds
setInterval(updateStatus, 5000);
updateStatus();
