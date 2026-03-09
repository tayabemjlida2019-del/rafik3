const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const net = require('net');

const PORT = 3010;
const PORTAL_PATH = path.join(__dirname, 'apps', 'portal');

// --- State ---
let currentProcess = null;
let sseClients = [];
let isStarting = false;

// --- Helpers ---
const checkPort = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer()
            .once('error', () => resolve(true))
            .once('listening', () => {
                server.close();
                resolve(false);
            }).listen(port);
    });
};

function broadcastLog(message, type = 'info') {
    const data = JSON.stringify({ time: new Date().toISOString(), message, type });
    sseClients.forEach(res => {
        res.write(`data: ${data}\n\n`);
    });
}

function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(body));
    });
}

// --- MIME Types ---
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

// --- Server ---
const server = http.createServer(async (req, res) => {
    // CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- SSE Logs Endpoint ---
    if (req.url === '/api/logs' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        res.write(`data: ${JSON.stringify({ time: new Date().toISOString(), message: 'متصل بخادم السجلات ✅', type: 'success' })}\n\n`);
        sseClients.push(res);
        req.on('close', () => {
            sseClients = sseClients.filter(c => c !== res);
        });
        return;
    }

    // --- API: Status ---
    if (req.url === '/api/status' && req.method === 'GET') {
        const [db, api, web] = await Promise.all([
            checkPort(5432),
            checkPort(3001),
            checkPort(3005),
        ]);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ docker: true, db, api, web, isStarting }));
        return;
    }

    // --- API: Start ---
    if (req.url === '/api/start' && req.method === 'POST') {
        if (currentProcess) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'المنصة قيد التشغيل بالفعل' }));
            return;
        }

        isStarting = true;
        broadcastLog('🚀 جاري بدء تشغيل المنصة...', 'info');

        const ps = spawn('powershell', [
            '-ExecutionPolicy', 'Bypass',
            '-File', path.join(__dirname, 'rafiq.ps1')
        ], {
            cwd: __dirname,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: false,
        });

        currentProcess = ps;

        ps.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(l => l.trim());
            lines.forEach(line => broadcastLog(line.trim(), 'info'));
        });

        ps.stderr.on('data', (data) => {
            const lines = data.toString().split('\n').filter(l => l.trim());
            lines.forEach(line => broadcastLog(line.trim(), 'error'));
        });

        ps.on('close', (code) => {
            isStarting = false;
            currentProcess = null;
            if (code === 0) {
                broadcastLog('🎉 اكتمل تشغيل المنصة بنجاح!', 'success');
            } else {
                broadcastLog(`⚠️ انتهت العملية برمز خروج: ${code}`, 'warning');
            }
        });

        ps.on('error', (err) => {
            isStarting = false;
            currentProcess = null;
            broadcastLog(`❌ خطأ في التشغيل: ${err.message}`, 'error');
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'تم بدء التشغيل' }));
        return;
    }

    // --- API: Stop ---
    if (req.url === '/api/stop' && req.method === 'POST') {
        broadcastLog('🛑 جاري إيقاف جميع الأنظمة...', 'warning');

        // Kill the current running process if any
        if (currentProcess) {
            currentProcess.kill('SIGTERM');
            currentProcess = null;
        }

        exec('docker-compose down', { cwd: __dirname }, (err, stdout, stderr) => {
            isStarting = false;
            if (err) {
                broadcastLog(`❌ خطأ في الإيقاف: ${err.message}`, 'error');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: err.message }));
            } else {
                broadcastLog('✅ تم إيقاف جميع الأنظمة بنجاح', 'success');
                if (stdout.trim()) broadcastLog(stdout.trim(), 'info');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'تم الإيقاف' }));
            }
        });
        return;
    }

    // --- Static File Serving ---
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
        const urlPath = req.url.split('?')[0]; // Remove query string
        let filePath = path.join(PORTAL_PATH, urlPath === '/' ? 'index.html' : urlPath);

        // Security: prevent path traversal
        if (!filePath.startsWith(PORTAL_PATH)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                // Fallback to index.html for SPA-like behavior
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(500);
                    res.end('Server error');
                }
            } else {
                const ext = path.extname(filePath);
                res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
                res.end(content);
            }
        });
        return;
    }

    // --- 404 ---
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   🚀 Al-Rafiq Orchestrator is running    ║`);
    console.log(`  ║   📍 http://localhost:${PORT}              ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
});
