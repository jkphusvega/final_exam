'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface DeptRow {
  dept: string
  courseCount: number
  totalEnrollment: number
  avgAttendanceRate: number
}

interface CollegeTopDeptsProps {
  college: string
  data: DeptRow[]
  loading: boolean
}

export default function CollegeTopDepts({ college, data, loading }: CollegeTopDeptsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#003087] inline-block" />
        {college} 강좌 수 상위 학과
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">데이터가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#003087] text-white">
                <th className="text-left px-4 py-2.5 rounded-tl-lg w-8 font-semibold"></th>
                <th className="text-left px-4 py-2.5 font-semibold">학과(부)</th>
                <th className="text-right px-4 py-2.5 font-semibold">강좌 수</th>
                <th className="text-right px-4 py-2.5 font-semibold">수강인원 합계</th>
                <th className="text-right px-4 py-2.5 rounded-tr-lg font-semibold">평균 수강률(%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={row.dept}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="px-4 py-2.5 text-slate-400 font-medium text-xs">{idx + 1}</td>
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{row.dept}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {row.courseCount.toLocaleString()}개
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {row.totalEnrollment.toLocaleString()}명
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#003087]">
                    {Math.min(row.avgAttendanceRate, 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
