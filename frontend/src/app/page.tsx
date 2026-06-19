'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  LayoutDashboard, MapPin, Users, CreditCard, Bell, TrendingUp,
  Hotel, UtensilsCrossed, Car, Home, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Clock, Activity, Zap
} from 'lucide-react'

// Dynamic import for Algeria Map (SSR disabled — uses D3)
const AlgeriaMap = dynamic(() => import('../components/AlgeriaMap'), { ssr: false })
const CommandBox = dynamic(() => import('../components/CommandBox'), { ssr: false })

// ── API Helpers ───────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchKPIs() {
  try {
    const res = await fetch(`${API}/api/analytics/kpis`, { cache: 'no-store' })
    return res.ok ? res.json() : null
  } catch { return null }
}
async function fetchGeo() {
  try {
    const res = await fetch(`${API}/api/analytics/geo-pressure`, { cache: 'no-store' })
    return res.ok ? res.json() : null
  } catch { return null }
}
async function fetchBookings() {
  try {
    const res = await fetch(`${API}/api/bookings?limit=10`, { cache: 'no-store' })
    return res.ok ? res.json() : null
  } catch { return null }
}
async function fetchAlerts() {
  try {
    const res = await fetch(`${API}/api/alerts?limit=8`, { cache: 'no-store' })
    return res.ok ? res.json() : null
  } catch { return null }
}

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    paid:      { label: 'مدفوع',    cls: 'badge-success' },
    confirmed: { label: 'مؤكد',     cls: 'badge-info' },
    pending:   { label: 'انتظار',   cls: 'badge-pending' },
    cancelled: { label: 'ملغى',     cls: 'badge-danger' },
    completed: { label: 'مكتمل',   cls: 'badge-success' },
  }
  const s = map[status] || { label: status, cls: 'badge-pending' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

// ── Service Icon ──────────────────────────────────────────────
const ServiceIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    hotel: <Hotel size={14} />, restaurant: <UtensilsCrossed size={14} />,
    rental: <Home size={14} />, transport: <Car size={14} />
  }
  return <>{icons[type] || <Hotel size={14} />}</>
}

// ── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ icon, value, label, gradient, prefix = '', suffix = '' }: any) => (
  <motion.div
    className="kpi-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="kpi-icon" style={{ background: gradient + '22', color: 'transparent',
      backgroundImage: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {icon}
    </div>
    <div className="kpi-value font-mono text-gradient">{prefix}{value?.toLocaleString('ar-DZ') || '—'}{suffix}</div>
    <div className="kpi-label">{label}</div>
  </motion.div>
)

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [geo, setGeo] = useState<any>(null)
  const [bookings, setBookings] = useState<any>(null)
  const [alerts, setAlerts] = useState<any>(null)
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [liveEvents, setLiveEvents] = useState<any[]>([])

  // ── Data Loading ──────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [k, g, b, a] = await Promise.all([fetchKPIs(), fetchGeo(), fetchBookings(), fetchAlerts()])
    if (k) setKpis(k)
    if (g) setGeo(g)
    if (b) setBookings(b)
    if (a) setAlerts(a)
    setLastUpdate(new Date())
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── WebSocket for Real-time ──────────────────────────────
  useEffect(() => {
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000') + '/ws/dashboard'
    let ws: WebSocket
    let pingInterval: NodeJS.Timeout
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      setWsStatus('connecting')
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setWsStatus('connected')
        pingInterval = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send('ping'), 30000)
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'payment_success' || msg.type === 'new_booking') {
            setLiveEvents(prev => [msg, ...prev].slice(0, 5))
            loadAll() // refresh data
          }
          if (msg.type === 'new_alert') {
            fetchAlerts().then(a => a && setAlerts(a))
          }
        } catch {}
      }

      ws.onclose = () => {
        setWsStatus('disconnected')
        clearInterval(pingInterval)
        reconnectTimeout = setTimeout(connect, 5000)
      }

      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      clearInterval(pingInterval)
      clearTimeout(reconnectTimeout)
      ws?.close()
    }
  }, [loadAll])

  // ── Navigation Items ──────────────────────────────────────
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'لوحة التحكم' },
    { id: 'map',       icon: <MapPin size={18} />,           label: 'الخريطة' },
    { id: 'bookings',  icon: <Activity size={18} />,         label: 'الحجوزات' },
    { id: 'payments',  icon: <CreditCard size={18} />,       label: 'المدفوعات' },
    { id: 'customers', icon: <Users size={18} />,            label: 'العملاء' },
    { id: 'alerts',    icon: <Bell size={18} />,             label: 'التنبيهات' },
  ]

  const unreadAlerts = alerts?.alerts?.filter((a: any) => !a.is_read)?.length || 0
  const serviceColors: Record<string, string> = {
    hotel: '#6366f1', restaurant: '#f59e0b', rental: '#22d3ee', transport: '#10b981'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0
            }}>🧭</div>
            <div className="logo-text">
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>الرفيق</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>لوحة التنفيذي</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, color: wsStatus === 'connected' ? '#10b981' : '#f59e0b' }}>
              {wsStatus === 'connected' ? 'متصل' : wsStatus === 'connecting' ? 'يتصل...' : 'منقطع'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <a key={item.id}
               className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
               onClick={() => setActiveNav(item.id)}
               href="#"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'alerts' && unreadAlerts > 0 && (
                <span style={{
                  marginRight: 'auto', background: '#f43f5e',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10
                }}>{unreadAlerts}</span>
              )}
            </a>
          ))}
        </nav>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            آخر تحديث<br />
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 11 }}>
              {lastUpdate.toLocaleTimeString('ar-DZ')}
            </span>
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 10, width: '100%' }} onClick={loadAll}>
            <RefreshCw size={12} />
            <span>تحديث</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="main-content">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>
              <span className="text-gradient">لوحة التحكم التنفيذية</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              منصة الرفيق — 58 ولاية جزائرية
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Live Events Feed */}
            <AnimatePresence>
              {liveEvents[0] && (
                <motion.div
                  key={liveEvents[0].data?.booking_id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 8, padding: '6px 12px', fontSize: 12,
                    color: '#10b981', display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <Zap size={12} />
                  {liveEvents[0].type === 'payment_success'
                    ? `دفع: ${parseFloat(liveEvents[0].data?.amount_dzd || 0).toLocaleString('ar-DZ')} دج`
                    : 'حجز جديد'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── KPI Grid ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <KpiCard
            icon={<Activity size={20} />}
            value={kpis?.kpis?.active_bookings}
            label="الحجوزات النشطة"
            gradient="linear-gradient(135deg, #6366f1, #818cf8)"
          />
          <KpiCard
            icon={<TrendingUp size={20} />}
            value={kpis?.kpis?.today_revenue_dzd}
            label="إيرادات اليوم (دج)"
            gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
            suffix=" دج"
          />
          <KpiCard
            icon={<Users size={20} />}
            value={kpis?.kpis?.total_customers}
            label="إجمالي العملاء"
            gradient="linear-gradient(135deg, #22d3ee, #6366f1)"
          />
          <KpiCard
            icon={<MapPin size={20} />}
            value={kpis?.kpis?.active_wilayas}
            label="ولايات نشطة / 58"
            gradient="linear-gradient(135deg, #10b981, #22d3ee)"
          />
          <KpiCard
            icon={<CreditCard size={20} />}
            value={kpis?.kpis?.month_revenue_dzd}
            label="إيرادات الشهر (دج)"
            gradient="linear-gradient(135deg, #8b5cf6, #6366f1)"
            suffix=" دج"
          />
          <KpiCard
            icon={<Bell size={20} />}
            value={kpis?.kpis?.unread_alerts}
            label="تنبيهات غير مقروءة"
            gradient="linear-gradient(135deg, #f43f5e, #f59e0b)"
          />
        </div>

        {/* ── Main Grid: Map + Charts ──────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 24 }}>

          {/* Algeria Map */}
          <div className="card" style={{ minHeight: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>🗺️ خريطة الضغط الجغرافي</h2>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', alignItems: 'center' }}>
                <span style={{ color: '#6366f1' }}>● بارد</span>
                <span style={{ color: '#f59e0b' }}>● دافئ</span>
                <span style={{ color: '#f43f5e' }}>● ذروة</span>
              </div>
            </div>
            <AlgeriaMap wilayas={geo?.wilayas || []} />
          </div>

          {/* Right Panel: Revenue + Service Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Service Breakdown Pie */}
            <div className="card" style={{ flex: 1 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>توزيع الخدمات</h3>
              {kpis?.service_breakdown?.length ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={kpis.service_breakdown} cx="50%" cy="50%"
                           outerRadius={60} dataKey="revenue" nameKey="type">
                        {kpis.service_breakdown.map((entry: any, i: number) => (
                          <Cell key={i} fill={Object.values(serviceColors)[i % 4] as string} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any) => [`${parseFloat(v).toLocaleString('ar-DZ')} دج`, 'الإيرادات']}
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    {kpis.service_breakdown.map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                          background: Object.values(serviceColors)[i % 4] as string }} />
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {s.type === 'hotel' ? 'فنادق' : s.type === 'restaurant' ? 'مطاعم'
                            : s.type === 'rental' ? 'كراء' : 'نقل'}
                        </span>
                        <span style={{ marginRight: 'auto', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {s.bookings}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: 13 }}>لا توجد بيانات بعد</div>
              )}
            </div>

            {/* Alert Panel */}
            <div className="card" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>🔔 التنبيهات</h3>
                {unreadAlerts > 0 && (
                  <span style={{ fontSize: 10, color: '#f59e0b' }}>{unreadAlerts} غير مقروء</span>
                )}
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {alerts?.alerts?.length ? alerts.alerts.map((alert: any, i: number) => (
                  <motion.div
                    key={alert.id || i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`alert-item ${alert.severity === 'warning' ? 'warning' : ''}`}
                    style={{ opacity: alert.is_read ? 0.6 : 1 }}
                  >
                    <div style={{ marginTop: 1 }}>
                      {alert.severity === 'warning' ? <AlertTriangle size={14} color="#f59e0b" />
                       : alert.type === 'payment_success' ? <CheckCircle size={14} color="#10b981" />
                       : alert.type === 'payment_failed' ? <XCircle size={14} color="#f43f5e" />
                       : <Clock size={14} color="#94a3b8" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{alert.title_ar}</div>
                      {alert.body_ar && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{alert.body_ar}</div>
                      )}
                    </div>
                    {!alert.is_read && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                    )}
                  </motion.div>
                )) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>
                    لا توجد تنبيهات
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Revenue Trend Chart ──────────────── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📈 منحنى الإيرادات (آخر 30 يوم)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={kpis?.revenue_trend || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}
                formatter={(v: any) => [`${parseFloat(v).toLocaleString('ar-DZ')} دج`, 'الإيرادات']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1"
                    strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Recent Bookings Table ────────────── */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>📋 آخر الحجوزات</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              المجموع: {bookings?.total || 0}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الحجز</th>
                  <th>العميل</th>
                  <th>الخدمة</th>
                  <th>الولاية</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {bookings?.bookings?.length ? bookings.bookings.map((b: any, i: number) => (
                  <motion.tr key={b.id || i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#818cf8' }}>
                        {b.booking_ref || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.full_name || 'غير محدد'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ServiceIcon type={b.service_type} />
                        <span style={{ fontSize: 12 }}>{b.service_name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.wilaya || '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#f59e0b', fontWeight: 600 }}>
                        {parseFloat(b.total_dzd || 0).toLocaleString('ar-DZ')}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginRight: 2 }}>دج</span>
                    </td>
                    <td><StatusBadge status={b.booking_status} /></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(b.created_at).toLocaleDateString('ar-DZ')}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      لا توجد حجوزات بعد. <span style={{ color: '#6366f1' }}>أضف حجزاً تجريبياً لاختبار النظام</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)', fontSize: 11 }}>
          منصة الرفيق — المساعد الذكي التنفيذي v1.0 | الجزائر 🇩🇿
        </div>
      </main>

      {/* AI Command Box */}
      <CommandBox />
    </div>
  )
}
