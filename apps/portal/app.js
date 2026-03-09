// ============================================
// Al-Rafiq Control Center — Frontend Logic
// ============================================

// --- DOM Elements ---
const $ = (sel) => document.querySelector(sel);
const cards = {
    docker: $('#card-docker'),
    db: $('#card-db'),
    api: $('#card-api'),
    web: $('#card-web'),
};
const btnStart = $('#btn-start');
const btnStop = $('#btn-stop');
const logsContainer = $('#logs');
const btnClearLogs = $('#btn-clear-logs');

// --- State ---
let isStarting = false;

// ===========================
// STATUS MANAGEMENT
// ===========================

function setStatus(id, online) {
    const card = cards[id];
    if (!card) return;
    const stateEl = card.querySelector('.state');
    const stateText = card.querySelector('.state-text');

    // Remove old classes
    card.classList.remove('online', 'offline');
    stateEl.classList.remove('is-online', 'is-offline', 'is-checking');

    if (online) {
        card.classList.add('online');
        stateEl.classList.add('is-online');
        stateText.textContent = 'يعمل';
    } else {
        card.classList.add('offline');
        stateEl.classList.add('is-offline');
        stateText.textContent = 'متوقف';
    }
}

function setChecking(id) {
    const card = cards[id];
    if (!card) return;
    const stateEl = card.querySelector('.state');
    const stateText = card.querySelector('.state-text');
    stateEl.classList.remove('is-online', 'is-offline');
    stateEl.classList.add('is-checking');
    stateText.textContent = 'جاري الفحص...';
}

async function updateStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatus('docker', data.docker);
        setStatus('db', data.db);
        setStatus('api', data.api);
        setStatus('web', data.web);

        // Update button state based on platform status
        if (data.isStarting) {
            setStartLoading(true);
        }
    } catch (err) {
        // If orchestrator is down, show all as checking
        ['docker', 'db', 'api', 'web'].forEach(id => setChecking(id));
    }
}

// ===========================
// BUTTON MANAGEMENT
// ===========================

function setStartLoading(loading) {
    isStarting = loading;
    if (loading) {
        btnStart.disabled = true;
        btnStart.classList.add('is-loading');
        btnStart.querySelector('.btn-icon').textContent = '⏳';
        btnStart.querySelector('.btn-label').textContent = 'جاري التشغيل...';
    } else {
        btnStart.disabled = false;
        btnStart.classList.remove('is-loading');
        btnStart.querySelector('.btn-icon').textContent = '▶';
        btnStart.querySelector('.btn-label').textContent = 'تشغيل المنصة';
    }
}

// --- Start Button ---
btnStart.addEventListener('click', async () => {
    if (isStarting) return;
    setStartLoading(true);
    addLog('🚀 جاري بدء تشغيل المنصة...', 'info');

    try {
        const res = await fetch('/api/start', { method: 'POST' });
        const data = await res.json();

        if (res.status === 409) {
            addLog(`⚠️ ${data.message}`, 'warning');
            setStartLoading(false);
            return;
        }

        addLog('✅ تم إرسال أمر التشغيل', 'success');

        // Poll status for up to 3 minutes
        let checks = 0;
        const fastPoll = setInterval(async () => {
            checks++;
            try {
                const statusRes = await fetch('/api/status');
                const statusData = await statusRes.json();
                setStatus('docker', statusData.docker);
                setStatus('db', statusData.db);
                setStatus('api', statusData.api);
                setStatus('web', statusData.web);

                if (statusData.api && statusData.web) {
                    addLog('🎉 جميع الأنظمة تعمل الآن!', 'success');
                    clearInterval(fastPoll);
                    setStartLoading(false);
                }

                if (!statusData.isStarting && checks > 5) {
                    clearInterval(fastPoll);
                    setStartLoading(false);
                }
            } catch (e) { /* ignore */ }

            if (checks >= 60) {  // ~3 minutes
                clearInterval(fastPoll);
                setStartLoading(false);
                addLog('⚠️ انتهى وقت الانتظار. تحقق من الحالة يدوياً.', 'warning');
            }
        }, 3000);

    } catch (err) {
        addLog('❌ فشل الاتصال بالخادم — تأكد من تشغيل orchestrator.js', 'error');
        setStartLoading(false);
    }
});

// --- Stop Button ---
btnStop.addEventListener('click', async () => {
    addLog('🛑 جاري إيقاف جميع الأنظمة...', 'warning');
    btnStop.disabled = true;

    try {
        await fetch('/api/stop', { method: 'POST' });
        addLog('✅ تم إرسال أمر الإيقاف', 'success');
    } catch (err) {
        addLog('❌ فشل الاتصال بالخادم', 'error');
    }

    setTimeout(() => {
        btnStop.disabled = false;
        updateStatus();
    }, 3000);
});

// ===========================
// LOG MANAGEMENT
// ===========================

function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const time = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    entry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-msg log-${type}">${escapeHtml(message)}</span>
    `;

    logsContainer.appendChild(entry);
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Keep only last 200 entries
    while (logsContainer.children.length > 200) {
        logsContainer.removeChild(logsContainer.firstChild);
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Clear Logs ---
btnClearLogs.addEventListener('click', () => {
    logsContainer.innerHTML = '';
    addLog('🗑️ تم مسح السجلات', 'info');
});

// ===========================
// SSE — Real-time Log Stream
// ===========================

function connectSSE() {
    const evtSource = new EventSource('/api/logs');

    evtSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            addLog(data.message, data.type || 'info');
        } catch (e) {
            addLog(event.data, 'info');
        }
    };

    evtSource.onerror = () => {
        // Reconnect after 5 seconds if connection lost
        evtSource.close();
        setTimeout(connectSSE, 5000);
    };
}

// ===========================
// INITIALIZATION
// ===========================

// Initial status check
['docker', 'db', 'api', 'web'].forEach(id => setChecking(id));
updateStatus();

// Poll status every 5 seconds
setInterval(updateStatus, 5000);

// Connect to real-time logs
connectSSE();

// Welcome log
addLog('مركز التحكم جاهز — في انتظار الأوامر', 'info');
