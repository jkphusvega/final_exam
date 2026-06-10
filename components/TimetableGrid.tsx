'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const DAYS = ['월', '화', '수', '목', '금']
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

interface GridRow {
  hour: number
  월: number; 화: number; 수: number; 목: number; 금: number
}

interface TimetableGridProps {
  data: GridRow[]
  loading: boolean
}

export default function TimetableGrid({ data, loading }: TimetableGridProps) {
  const [tooltip, setTooltip] = useState<{ day: string; hour: number; count: number; x: number; y: number } | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  React.useEffect(() => {
    if (!loading) setHasLoadedOnce(true)
  }, [loading])

  if (loading && !hasLoadedOnce) {
    return (
      <Card className="glass-card">
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="w-full h-64" /></CardContent>
      </Card>
    )
  }

  const allCounts = data.flatMap(row => DAYS.map(d => row[d as keyof GridRow] as number))
  const maxCount = Math.max(...allCounts, 1)

  // INU Blue 계열로 강도 표현
  function getCellStyle(count: number) {
    if (count === 0) return { backgroundColor: '#f8fafc', color: '#cbd5e1' }
    const intensity = count / maxCount
    // 낮은 강도: #e8eef7 → 높은 강도: #003087
    const r = Math.round(0 + (1 - intensity) * 232)
    const g = Math.round(48 + (1 - intensity) * (238 - 48))
    const b = Math.round(135 + (1 - intensity) * (247 - 135))
    const textColor = intensity > 0.5 ? '#ffffff' : '#003087'
    return { backgroundColor: `rgb(${r},${g},${b})`, color: textColor }
  }

  return (
    <Card className="glass-card hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-[#003087]">
          주간 수업 시간표 히트맵
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>강좌 적음</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 1.0].map((v, i) => {
              const intensity = v
              const r = Math.round(0 + (1 - intensity) * 232)
              const g = Math.round(48 + (1 - intensity) * (238 - 48))
              const b = Math.round(135 + (1 - intensity) * (247 - 135))
              return <div key={i} className="w-5 h-4 rounded-sm" style={{ backgroundColor: `rgb(${r},${g},${b})` }} />
            })}
          </div>
          <span>강좌 많음</span>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className={`overflow-x-auto transition-opacity duration-200 ${loading && hasLoadedOnce ? 'opacity-40 pointer-events-none' : ''}`}>
          <table className="w-full border-collapse select-none">
            <thead>
              <tr>
                <th className="w-14 text-xs text-slate-400 font-medium pb-2" />
                {DAYS.map(day => (
                  <th key={day} className="text-center text-sm font-bold text-[#003087] pb-2 px-1">
                    {day}요일
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.hour}>
                  <td className="text-xs text-slate-400 font-medium text-right pr-3 py-0.5 whitespace-nowrap">
                    {row.hour}:00
                  </td>
                  {DAYS.map(day => {
                    const count = row[day as keyof GridRow] as number
                    const style = getCellStyle(count)
                    return (
                      <td
                        key={day}
                        className="py-0.5 px-0.5 cursor-default"
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect()
                          setTooltip({ day, hour: row.hour, count, x: rect.left + rect.width / 2, y: rect.top })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <div
                          className="rounded-md h-9 flex items-center justify-center text-xs font-bold transition-all duration-150 hover:scale-105 hover:shadow-md"
                          style={style}
                        >
                          {count > 0 ? count : ''}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 툴팁 */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg text-xs font-semibold text-white shadow-xl"
            style={{
              backgroundColor: '#0f172a',
              left: tooltip.x,
              top: tooltip.y - 44,
              transform: 'translateX(-50%)',
            }}
          >
            {tooltip.day}요일 {tooltip.hour}:00 — <span className="text-[#ffa600]">{tooltip.count}개</span> 강좌
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3 text-center">
          셀 위에 마우스를 올리면 해당 시간대 강좌 수를 확인할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  )
}
