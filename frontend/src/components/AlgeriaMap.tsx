'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// ── GeoJSON للجزائر — 58 ولاية (محاكاة بيانات المراكز الجغرافية) ──
const ALGERIA_WILAYAS_GEO = {
  type: "FeatureCollection",
  features: [
    { type:"Feature", id:"01", properties:{code:1,name:"أدرار",region:"جنوب"},
      geometry:{type:"Point",coordinates:[-0.2914,27.8742]}},
    { type:"Feature", id:"02", properties:{code:2,name:"الشلف",region:"شمال"},
      geometry:{type:"Point",coordinates:[1.3317,36.1647]}},
    { type:"Feature", id:"03", properties:{code:3,name:"الأغواط",region:"هضاب"},
      geometry:{type:"Point",coordinates:[2.8653,33.8000]}},
    { type:"Feature", id:"04", properties:{code:4,name:"أم البواقي",region:"هضاب"},
      geometry:{type:"Point",coordinates:[7.1126,35.8704]}},
    { type:"Feature", id:"05", properties:{code:5,name:"باتنة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[6.1740,35.5560]}},
    { type:"Feature", id:"06", properties:{code:6,name:"بجاية",region:"شمال"},
      geometry:{type:"Point",coordinates:[5.0833,36.7500]}},
    { type:"Feature", id:"07", properties:{code:7,name:"بسكرة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[5.7333,34.8500]}},
    { type:"Feature", id:"08", properties:{code:8,name:"بشار",region:"جنوب"},
      geometry:{type:"Point",coordinates:[-2.2167,31.6167]}},
    { type:"Feature", id:"09", properties:{code:9,name:"البليدة",region:"شمال"},
      geometry:{type:"Point",coordinates:[2.8277,36.4697]}},
    { type:"Feature", id:"10", properties:{code:10,name:"البويرة",region:"شمال"},
      geometry:{type:"Point",coordinates:[3.9006,36.3731]}},
    { type:"Feature", id:"11", properties:{code:11,name:"تمنراست",region:"جنوب"},
      geometry:{type:"Point",coordinates:[5.5228,22.7850]}},
    { type:"Feature", id:"12", properties:{code:12,name:"تبسة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[8.1244,35.4044]}},
    { type:"Feature", id:"13", properties:{code:13,name:"تلمسان",region:"شمال"},
      geometry:{type:"Point",coordinates:[-1.3150,34.8780]}},
    { type:"Feature", id:"14", properties:{code:14,name:"تيارت",region:"هضاب"},
      geometry:{type:"Point",coordinates:[1.3217,35.3706]}},
    { type:"Feature", id:"15", properties:{code:15,name:"تيزي وزو",region:"شمال"},
      geometry:{type:"Point",coordinates:[4.0500,36.7167]}},
    { type:"Feature", id:"16", properties:{code:16,name:"الجزائر",region:"شمال"},
      geometry:{type:"Point",coordinates:[3.0869,36.7372]}},
    { type:"Feature", id:"17", properties:{code:17,name:"الجلفة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[3.2628,34.6714]}},
    { type:"Feature", id:"18", properties:{code:18,name:"جيجل",region:"شمال"},
      geometry:{type:"Point",coordinates:[5.7658,36.8206]}},
    { type:"Feature", id:"19", properties:{code:19,name:"سطيف",region:"هضاب"},
      geometry:{type:"Point",coordinates:[5.4114,36.1900]}},
    { type:"Feature", id:"20", properties:{code:20,name:"سعيدة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[0.1456,34.8309]}},
    { type:"Feature", id:"21", properties:{code:21,name:"سكيكدة",region:"شمال"},
      geometry:{type:"Point",coordinates:[6.9069,36.8761]}},
    { type:"Feature", id:"22", properties:{code:22,name:"سيدي بلعباس",region:"شمال"},
      geometry:{type:"Point",coordinates:[-0.6308,35.1897]}},
    { type:"Feature", id:"23", properties:{code:23,name:"عنابة",region:"شمال"},
      geometry:{type:"Point",coordinates:[7.7667,36.9000]}},
    { type:"Feature", id:"24", properties:{code:24,name:"قالمة",region:"شمال"},
      geometry:{type:"Point",coordinates:[7.4326,36.4642]}},
    { type:"Feature", id:"25", properties:{code:25,name:"قسنطينة",region:"شمال"},
      geometry:{type:"Point",coordinates:[6.6147,36.3650]}},
    { type:"Feature", id:"26", properties:{code:26,name:"المدية",region:"شمال"},
      geometry:{type:"Point",coordinates:[2.7506,36.2636]}},
    { type:"Feature", id:"27", properties:{code:27,name:"مستغانم",region:"شمال"},
      geometry:{type:"Point",coordinates:[0.0833,35.9333]}},
    { type:"Feature", id:"28", properties:{code:28,name:"المسيلة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[4.5417,35.7044]}},
    { type:"Feature", id:"29", properties:{code:29,name:"معسكر",region:"هضاب"},
      geometry:{type:"Point",coordinates:[0.1400,35.3961]}},
    { type:"Feature", id:"30", properties:{code:30,name:"ورقلة",region:"جنوب"},
      geometry:{type:"Point",coordinates:[5.3333,31.9500]}},
    { type:"Feature", id:"31", properties:{code:31,name:"وهران",region:"شمال"},
      geometry:{type:"Point",coordinates:[-0.6417,35.6911]}},
    { type:"Feature", id:"32", properties:{code:32,name:"البيض",region:"هضاب"},
      geometry:{type:"Point",coordinates:[1.0178,33.6831]}},
    { type:"Feature", id:"33", properties:{code:33,name:"إليزي",region:"جنوب"},
      geometry:{type:"Point",coordinates:[8.4800,26.4800]}},
    { type:"Feature", id:"34", properties:{code:34,name:"برج بوعريريج",region:"هضاب"},
      geometry:{type:"Point",coordinates:[4.7600,36.0689]}},
    { type:"Feature", id:"35", properties:{code:35,name:"بومرداس",region:"شمال"},
      geometry:{type:"Point",coordinates:[3.4833,36.7667]}},
    { type:"Feature", id:"36", properties:{code:36,name:"الطارف",region:"شمال"},
      geometry:{type:"Point",coordinates:[8.3139,36.7672]}},
    { type:"Feature", id:"37", properties:{code:37,name:"تندوف",region:"جنوب"},
      geometry:{type:"Point",coordinates:[-8.1472,27.6742]}},
    { type:"Feature", id:"38", properties:{code:38,name:"تيسمسيلت",region:"هضاب"},
      geometry:{type:"Point",coordinates:[1.8142,35.6078]}},
    { type:"Feature", id:"39", properties:{code:39,name:"الوادي",region:"جنوب"},
      geometry:{type:"Point",coordinates:[6.8633,33.3683]}},
    { type:"Feature", id:"40", properties:{code:40,name:"خنشلة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[7.1431,35.4286]}},
    { type:"Feature", id:"41", properties:{code:41,name:"سوق أهراس",region:"شمال"},
      geometry:{type:"Point",coordinates:[7.9508,36.2847]}},
    { type:"Feature", id:"42", properties:{code:42,name:"تيبازة",region:"شمال"},
      geometry:{type:"Point",coordinates:[2.4469,36.5892]}},
    { type:"Feature", id:"43", properties:{code:43,name:"ميلة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[6.2639,36.4500]}},
    { type:"Feature", id:"44", properties:{code:44,name:"عين الدفلى",region:"شمال"},
      geometry:{type:"Point",coordinates:[1.9669,36.2633]}},
    { type:"Feature", id:"45", properties:{code:45,name:"النعامة",region:"هضاب"},
      geometry:{type:"Point",coordinates:[-0.3167,33.2667]}},
    { type:"Feature", id:"46", properties:{code:46,name:"عين تموشنت",region:"شمال"},
      geometry:{type:"Point",coordinates:[-1.1394,35.2961]}},
    { type:"Feature", id:"47", properties:{code:47,name:"غرداية",region:"جنوب"},
      geometry:{type:"Point",coordinates:[3.6739,32.4900]}},
    { type:"Feature", id:"48", properties:{code:48,name:"غليزان",region:"شمال"},
      geometry:{type:"Point",coordinates:[0.5667,35.7333]}},
    { type:"Feature", id:"49", properties:{code:49,name:"تيميمون",region:"جنوب"},
      geometry:{type:"Point",coordinates:[0.2403,29.2631]}},
    { type:"Feature", id:"50", properties:{code:50,name:"برج باجي",region:"جنوب"},
      geometry:{type:"Point",coordinates:[-0.9242,23.0561]}},
    { type:"Feature", id:"51", properties:{code:51,name:"أولاد جلال",region:"جنوب"},
      geometry:{type:"Point",coordinates:[5.0661,34.4183]}},
    { type:"Feature", id:"52", properties:{code:52,name:"بني عباس",region:"جنوب"},
      geometry:{type:"Point",coordinates:[-2.1622,30.1283]}},
    { type:"Feature", id:"53", properties:{code:53,name:"عين صالح",region:"جنوب"},
      geometry:{type:"Point",coordinates:[2.4797,27.1967]}},
    { type:"Feature", id:"54", properties:{code:54,name:"عين قزام",region:"جنوب"},
      geometry:{type:"Point",coordinates:[5.7667,19.5667]}},
    { type:"Feature", id:"55", properties:{code:55,name:"تقرت",region:"جنوب"},
      geometry:{type:"Point",coordinates:[6.0706,33.1000]}},
    { type:"Feature", id:"56", properties:{code:56,name:"جانت",region:"جنوب"},
      geometry:{type:"Point",coordinates:[9.4844,24.5547]}},
    { type:"Feature", id:"57", properties:{code:57,name:"المغير",region:"جنوب"},
      geometry:{type:"Point",coordinates:[5.9167,33.9500]}},
    { type:"Feature", id:"58", properties:{code:58,name:"المنيعة",region:"جنوب"},
      geometry:{type:"Point",coordinates:[2.8833,30.5833]}},
  ]
}

interface WilayaData {
  code: number
  name_ar: string
  region: string
  lat: number
  lng: number
  active_bookings: number
  revenue_24h: number
  intensity: number
  status: 'hot' | 'warm' | 'cold'
}

interface Props {
  wilayas: WilayaData[]
}

export default function AlgeriaMap({ wilayas }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: WilayaData | null } | null>(null)

  // Merge API data with GeoJSON
  const enrichedFeatures = ALGERIA_WILAYAS_GEO.features.map(f => {
    const apiData = wilayas.find(w => w.code === f.properties.code)
    return { ...f, apiData }
  })

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth || 600
    const height = 360

    // Projection: custom for Algeria (roughly -9°W to 12°E, 18°N to 38°N)
    const projection = d3.geoMercator()
      .center([2.5, 28.5])
      .scale(width * 1.4)
      .translate([width / 2, height / 2])

    // Draw Algeria border (approximate bounding box as background)
    svg.append('rect')
      .attr('width', width).attr('height', height)
      .attr('fill', 'transparent')

    // Draw grid lines (faint)
    const gridLines = svg.append('g').attr('class', 'grid')
    for (let lat = 19; lat <= 38; lat += 3) {
      const y = projection([2.5, lat])?.[1] || 0
      gridLines.append('line')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', 'rgba(99,102,241,0.06)').attr('stroke-width', 0.5)
    }
    for (let lng = -9; lng <= 12; lng += 3) {
      const x = projection([lng, 28])?.[0] || 0
      gridLines.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', 'rgba(99,102,241,0.06)').attr('stroke-width', 0.5)
    }

    // Color scale
    const colorScale = (intensity: number, status: string) => {
      if (!intensity) return '#1e293b'
      if (status === 'hot') return d3.interpolateRgb('#f43f5e', '#fbbf24')(intensity)
      if (status === 'warm') return d3.interpolateRgb('#6366f1', '#f59e0b')(intensity)
      return d3.interpolateRgb('#1e293b', '#6366f1')(intensity * 2)
    }

    // Draw wilaya dots
    const g = svg.append('g').attr('class', 'wilayas')

    enrichedFeatures.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates as [number, number]
      const coords = projection([lng, lat])
      if (!coords) return

      const [x, y] = coords
      const data = feature.apiData
      const intensity = data?.intensity || 0
      const status = data?.status || 'cold'
      const bookings = data?.active_bookings || 0
      const radius = data ? Math.max(6, Math.min(18, 6 + bookings * 1.5)) : 5

      // Glow for hot wilayas
      if (status === 'hot') {
        g.append('circle')
          .attr('cx', x).attr('cy', y)
          .attr('r', radius + 8)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3)
          .attr('class', 'pulse-ring')
      }

      // Main dot
      g.append('circle')
        .attr('cx', x).attr('cy', y)
        .attr('r', radius)
        .attr('fill', colorScale(intensity, status))
        .attr('stroke', status === 'hot' ? '#f43f5e' : status === 'warm' ? '#f59e0b' : 'rgba(99,102,241,0.3)')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .attr('class', 'wilaya-dot')
        .on('mouseenter', function(event) {
          d3.select(this).transition().duration(150).attr('r', radius * 1.4)
          if (data) {
            setTooltip({ x: event.offsetX, y: event.offsetY, data })
          }
        })
        .on('mouseleave', function() {
          d3.select(this).transition().duration(150).attr('r', radius)
          setTooltip(null)
        })

      // Wilaya number label (for larger circles)
      if (radius >= 8) {
        g.append('text')
          .attr('x', x).attr('y', y + 1)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
          .attr('font-size', 8).attr('fill', '#fff').attr('font-weight', '700')
          .attr('pointer-events', 'none')
          .text(feature.properties.code)
      }
    })

    // Algeria boundary (simplified as decorative line)
    svg.append('text')
      .attr('x', width / 2).attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', 'rgba(99,102,241,0.3)')
      .attr('font-family', 'monospace')
      .text('ALGERIA — 58 WILAYAS')

  }, [wilayas, enrichedFeatures])

  return (
    <div style={{ position: 'relative', width: '100%', height: 360 }}>
      <svg ref={svgRef} width="100%" height="360"
           style={{ display: 'block', borderRadius: 8 }} />

      {/* Tooltip */}
      {tooltip && tooltip.data && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 12, top: tooltip.y - 10,
          background: 'rgba(10,10,26,0.95)',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: 10, padding: '10px 14px',
          fontSize: 12, pointerEvents: 'none',
          zIndex: 100, minWidth: 160,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
            {tooltip.data.name_ar}
          </div>
          <div style={{ color: '#94a3b8', lineHeight: 1.8 }}>
            <div>🏷️ ولاية {tooltip.data.code} — {tooltip.data.region}</div>
            <div>📅 الحجوزات (24h): <span style={{ color: '#22d3ee', fontWeight: 600 }}>{tooltip.data.active_bookings}</span></div>
            <div>💰 الإيرادات: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{tooltip.data.revenue_24h.toLocaleString('ar-DZ')} دج</span></div>
            <div>🌡️ الحالة: <span style={{
              color: tooltip.data.status === 'hot' ? '#f43f5e' : tooltip.data.status === 'warm' ? '#f59e0b' : '#94a3b8',
              fontWeight: 600
            }}>{tooltip.data.status === 'hot' ? '🔥 ذروة' : tooltip.data.status === 'warm' ? '🟡 متوسط' : '❄️ هادئ'}</span></div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        background: 'rgba(10,10,26,0.8)', borderRadius: 8,
        padding: '8px 12px', fontSize: 10,
        border: '1px solid rgba(99,102,241,0.2)'
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>مستوى النشاط:</div>
        {[['#1e293b', 'لا نشاط'], ['#6366f1', 'منخفض'], ['#f59e0b', 'متوسط'], ['#f43f5e', 'ذروة']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
