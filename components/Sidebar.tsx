'use client'

import React, { useEffect, useState } from 'react'
import { useDashboard } from '@/contexts/DashboardContext'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { BookOpen, ChevronRight } from 'lucide-react'

// Fixed college order as per AGENTS.md
const COLLEGE_ORDER = [
  '대학전체',
  '기초교육원',
  '인문대학',
  '자연과학대학',
  '사회과학대학',
  '글로벌경영대학',
  '공과대학',
  '정보기술대학',
  '경영대학',
  '예술체육대학',
  '사범대학',
  '도시과학대학',
  '생명과학기술대학',
  '융합자유전공대학',
  '동북아국제통상물류학부',
  '법학부',
]

// DB 실제값 → 사이드바 표시명
// '단과대구분없음' = 동북아국제통상물류학부, '단과대구분없음(법학)' = 법학부
const DB_TO_DISPLAY_COLLEGE: Record<string, string> = {
  '교양':                 '기초교육원',
  '글로벌정경대학':       '글로벌경영대학',
  '단과대구분없음':       '동북아국제통상물류학부',
  '단과대구분없음(법학)': '법학부',
}

function resolveCollegeName(rawCollege: string): string {
  const key = rawCollege.trim()
  return DB_TO_DISPLAY_COLLEGE[key] ?? key
}

export default function Sidebar() {
  const { selectedCollege, selectedDepartment, setSelectedCollege, setSelectedDepartment } =
    useDashboard()
  const [collegeDepts, setCollegeDepts] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedColleges, setExpandedColleges] = useState<Record<string, boolean>>({})

  // Fetch ALL courses with pagination (1,000 rows per page) then extract unique college/dept pairs
  useEffect(() => {
    const fetchStructure = async () => {
      const supabase = createClient()
      const PAGE_SIZE = 1000
      let page = 0
      let allRows: { college: string; dept: string }[] = []
      let hasMore = true

      while (hasMore) {
        const from = page * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        // Use select('*') to avoid column-name quoting issues in the REST API
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .range(from, to)

        if (error || !data || data.length === 0) {
          hasMore = false
          break
        }

        data.forEach((row: any) => {
          const rawCollege: string = row['대학(원)'] ?? ''
          const dept: string = row['학과(부)'] ?? ''
          if (rawCollege) {
            allRows.push({ college: rawCollege, dept })
          }
        })

        if (data.length < PAGE_SIZE) {
          hasMore = false
        } else {
          page++
        }
      }

      // Build map: displayCollegeName → Set<deptName>
      const tempMap: Record<string, Set<string>> = {}

      allRows.forEach(({ college: rawCollege, dept }) => {
        const displayCollege = resolveCollegeName(rawCollege)
        if (!tempMap[displayCollege]) tempMap[displayCollege] = new Set()
        // 교양 dept는 기초교육원에만 포함
        if (dept && !(dept === '교양' && displayCollege !== '기초교육원')) {
          // 학과(부) 값도 NFC 정규화 후 추가
          tempMap[displayCollege].add(dept.normalize('NFC').trim())
        }
      })

      const finalMap: Record<string, string[]> = {}
      Object.keys(tempMap).forEach((col) => {
        finalMap[col] = Array.from(tempMap[col]).sort()
      })

      setCollegeDepts(finalMap)

      // 요구사항: 소속 학과는 모두 펼쳐진 상태로 구성
      const initExpanded: Record<string, boolean> = {}
      COLLEGE_ORDER.forEach((c) => { initExpanded[c] = true })
      setExpandedColleges(initExpanded)

      setLoading(false)
    }

    fetchStructure()
  }, [])

  // Auto-expand the selected college when context changes
  useEffect(() => {
    if (selectedCollege) {
      setExpandedColleges((prev) => ({ ...prev, [selectedCollege]: true }))
    }
  }, [selectedCollege])

  const handleCollegeClick = (college: string) => {
    if (college === '대학전체') {
      setSelectedCollege(null)
      setSelectedDepartment(null)
    } else {
      setExpandedColleges((prev) => ({ ...prev, [college]: !prev[college] }))
      setSelectedCollege(college)
      setSelectedDepartment(null)
    }
  }

  const handleDeptClick = (college: string, dept: string) => {
    setSelectedCollege(college)
    setSelectedDepartment(dept)
  }

  return (
    <aside
      className="hidden md:flex flex-col bg-white border-r border-slate-200 shadow-sm shrink-0"
      style={{ width: '256px', height: '100vh', overflow: 'hidden' }}
    >
      {/* Logo — fixed height, never shrinks */}
      <div
        className="shrink-0 bg-[#003087] border-b border-[#00256b] flex items-center justify-center"
        style={{ minHeight: '110px', padding: '24px' }}
      >
        <img
          src="/INU_signiture_ko_en_A.svg"
          alt="인천대학교"
          className="h-20 w-auto object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Scrollable nav list */}
      <nav className="flex-1 overflow-y-auto" style={{ minHeight: 0, padding: '12px' }}>
        {loading ? (
          <div className="px-3 py-4 text-xs text-slate-400 animate-pulse">
            학과 목록 불러오는 중...
          </div>
        ) : (
          <div className="space-y-0.5">
            {COLLEGE_ORDER.map((college) => {
              const isAll = college === '대학전체'
              const isCollegeSelected =
                isAll
                  ? selectedCollege === null
                  : selectedCollege === college && selectedDepartment === null
              const depts = collegeDepts[college] || []
              const isExpanded = expandedColleges[college] ?? false

              return (
                <div key={college}>
                  {/* College row */}
                  <button
                    onClick={() => handleCollegeClick(college)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-between group border-l-[3px]',
                      isCollegeSelected
                        ? 'bg-[#e8eef7] text-[#003087] border-l-[#003087] shadow-sm'
                        : 'border-transparent hover:bg-[#e8eef7] text-slate-600 hover:text-[#003087]'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen
                        className={cn(
                          'w-4 h-4 shrink-0',
                          isCollegeSelected
                            ? 'text-[#003087]'
                            : 'text-slate-400 group-hover:text-[#003087]'
                        )}
                      />
                      <span className="truncate">{college}</span>
                    </div>
                    {!isAll && depts.length > 0 && (
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 transition-transform duration-200 opacity-50 group-hover:opacity-100',
                          isExpanded ? 'rotate-90 text-[#003087] opacity-100' : ''
                        )}
                      />
                    )}
                  </button>

                  {/* Department rows — shown when expanded */}
                  {!isAll && isExpanded && depts.length > 0 && (
                    <div className="ml-5 pl-3 border-l border-slate-200 mt-0.5 mb-1 space-y-0.5">
                      {depts.map((dept) => {
                        const isDeptSelected =
                          selectedCollege === college && selectedDepartment === dept
                        return (
                          <button
                            key={dept}
                            onClick={() => handleDeptClick(college, dept)}
                            title={dept}
                            className={cn(
                              'w-full text-left px-2 py-1.5 rounded-md text-xs transition-all duration-150 truncate block border-l-[3px]',
                              isDeptSelected
                                ? 'bg-[#e8eef7] text-[#003087] border-l-[#003087] font-bold'
                                : 'border-transparent text-slate-500 hover:text-[#003087] hover:bg-[#e8eef7]'
                            )}
                          >
                            {dept}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </nav>
    </aside>
  )
}
