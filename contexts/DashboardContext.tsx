'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Course } from '@/types'

interface DashboardContextType {
  selectedCollege: string | null
  selectedDepartment: string | null
  setSelectedCollege: (college: string | null) => void
  setSelectedDepartment: (department: string | null) => void
  allCourses: Course[]
  coursesLoading: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  // 앱 시작 시 전체 강좌 데이터를 한 번만 fetch — 이후 모든 필터링은 클라이언트에서 처리
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const supabase = createClient()
        const PAGE = 1000

        const { count } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })

        if (!count) { setCoursesLoading(false); return }

        const pages = Math.ceil(count / PAGE)
        const requests = Array.from({ length: pages }, (_, i) =>
          supabase.from('courses').select('*').range(i * PAGE, (i + 1) * PAGE - 1)
        )
        const results = await Promise.all(requests)
        const courses = results.flatMap(r => (r.data as Course[]) ?? [])
        setAllCourses(courses)
      } catch (err) {
        console.error('[DashboardContext] fetch error:', err)
      } finally {
        setCoursesLoading(false)
      }
    }
    fetchAll()
  }, []) // 마운트 시 1회만 실행

  const handleSetSelectedCollege = (college: string | null) => {
    setSelectedCollege(college)
    setSelectedDepartment(null)
  }

  return (
    <DashboardContext.Provider value={{
      selectedCollege,
      selectedDepartment,
      setSelectedCollege: handleSetSelectedCollege,
      setSelectedDepartment,
      allCourses,
      coursesLoading,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider')
  return context
}
