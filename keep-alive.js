#!/usr/bin/env node
/**
 * keep-alive.js — Pings the API health endpoint every 10 minutes
 * to prevent Render free tier from sleeping.
 * Run separately: node keep-alive.js
 */

const https = require('https');

const API_URL = process.env.API_URL || 'https://rafiq-api.onrender.com/api/v1/health';
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function ping() {
    const startTime = Date.now();
    https.get(API_URL, (res) => {
        const elapsed = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ✅ Health check: ${res.statusCode} (${elapsed}ms)`);
    }).on('error', (err) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ❌ Health check failed: ${err.message}`);
    });
}

console.log(`🔄 Keep-alive started. Pinging every 10 minutes: ${API_URL}`);
ping(); // immediate first ping
setInterval(ping, INTERVAL_MS);
