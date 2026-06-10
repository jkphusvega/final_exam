'use client'

import React, { useEffect, useState } from 'react'
import { useDashboard } from '@/contexts/DashboardContext'
import StatsCards from '@/components/StatsCards'
import CategoryCharts from '@/components/CategoryCharts'
import DistributionCharts from '@/components/DistributionCharts'
import TimeCharts from '@/components/TimeCharts'
import CollegeSummaryTable from '@/components/CollegeSummaryTable'
import CollegeTopDepts from '@/components/CollegeTopDepts'
import TimetableGrid from '@/components/TimetableGrid'
import EnrollmentAlerts from '@/components/EnrollmentAlerts'
import CourseTable from '@/components/CourseTable'
import {
  getStats,
  getCoursesByCategory,
  getAvgEnrollmentByCategory,
  getTeachingMethods,
  getCreditDistribution,
  getCoursesByDay,
  getCoursesByTime,
  getCollegeSummary,
  getTopDeptsByCollege,
  getTimetableGrid,
  getEnrollmentAlerts,
  getCourses,
} from '@/lib/data'

export default function DashboardPage() {
  const { selectedCollege, selectedDepartment } = useDashboard()
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)
  const [isInitialMetrics, setIsInitialMetrics] = useState(true)
  
  // Dashboard overall data states
  const [stats, setStats] = useState<any>(null)
  const [categoryCounts, setCategoryCounts] = useState<any[]>([])
  const [categoryAvgEnrollments, setCategoryAvgEnrollments] = useState<any[]>([])
  const [teachingMethods, setTeachingMethods] = useState<any[]>([])
  const [creditDistribution, setCreditDistribution] = useState<any[]>([])
  const [coursesByDay, setCoursesByDay] = useState<any[]>([])
  const [coursesByTime, setCoursesByTime] = useState<any[]>([])
  const [collegeSummary, setCollegeSummary] = useState<any[]>([])
  const [topDepts, setTopDepts] = useState<any[]>([])
  const [topDeptsLoading, setTopDeptsLoading] = useState(false)
  const [timetableData, setTimetableData] = useState<any[]>([])
  const [timetableLoading, setTimetableLoading] = useState(true)
  const [alertsData, setAlertsData] = useState<{ overEnrolled: any[]; overTotal: number; underEnrolled: any[]; underTotal: number }>({ overEnrolled: [], overTotal: 0, underEnrolled: [], underTotal: 0 })
  const [alertsLoading, setAlertsLoading] = useState(true)

  // Course table states
  const [courses, setCourses] = useState<any[]>([])
  const [totalCoursesCount, setTotalCoursesCount] = useState(0)
  const [coursePage, setCoursePage] = useState(1)
  const [courseSearch, setCourseSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [dayFilter, setDayFilter] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<string | null>(null)

  // Load static summary and initial metrics
  useEffect(() => {
    const loadStaticData = async () => {
      setSummaryLoading(true)
      try {
        const summaryData = await getCollegeSummary()
        setCollegeSummary(summaryData)
      } catch (err) {
        console.error('Failed to load college summary:', err)
      } finally {
        setSummaryLoading(false)
      }
    }
    loadStaticData()
  }, [])

  // Load metrics when dashboard selection changes
  useEffect(() => {
    const loadMetricsData = async () => {
      if (isInitialMetrics) {
        setMetricsLoading(true)
      }
      try {
        const [
          statsData,
          countsData,
          avgEnrollmentData,
          methodsData,
          creditsData,
          dayData,
          timeData,
        ] = await Promise.all([
          getStats(selectedCollege, selectedDepartment),
          getCoursesByCategory(selectedCollege, selectedDepartment),
          getAvgEnrollmentByCategory(selectedCollege, selectedDepartment),
          getTeachingMethods(selectedCollege, selectedDepartment),
          getCreditDistribution(selectedCollege, selectedDepartment),
          getCoursesByDay(selectedCollege, selectedDepartment),
          getCoursesByTime(selectedCollege, selectedDepartment),
        ])

        setStats(statsData)
        setCategoryCounts(countsData)
        setCategoryAvgEnrollments(avgEnrollmentData)
        setTeachingMethods(methodsData)
        setCreditDistribution(creditsData)
        setCoursesByDay(dayData)
        setCoursesByTime(timeData)
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err)
      } finally {
        setMetricsLoading(false)
        setIsInitialMetrics(false)
      }
    }

    loadMetricsData()
    setCoursePage(1)
    setCategoryFilter(null)
    setDayFilter(null)
    setTimeFilter(null)
  }, [selectedCollege, selectedDepartment])

  // 시간표 그리드 + 수강률 이상 강좌 로드
  useEffect(() => {
    const load = async () => {
      setTimetableLoading(true)
      setAlertsLoading(true)
      try {
        const [timetable, alerts] = await Promise.all([
          getTimetableGrid(selectedCollege, selectedDepartment),
          getEnrollmentAlerts(selectedCollege, selectedDepartment),
        ])
        setTimetableData(timetable)
        setAlertsData(alerts)
      } catch (err) {
        console.error('Failed to load timetable/alerts:', err)
      } finally {
        setTimetableLoading(false)
        setAlertsLoading(false)
      }
    }
    load()
  }, [selectedCollege, selectedDepartment])

  // 단과대 선택 시 상위 학과 데이터 로드
  useEffect(() => {
    if (!selectedCollege || selectedDepartment) {
      setTopDepts([])
      return
    }
    const load = async () => {
      setTopDeptsLoading(true)
      try {
        const data = await getTopDeptsByCollege(selectedCollege)
        setTopDepts(data)
      } catch (err) {
        console.error('Failed to load top depts:', err)
      } finally {
        setTopDeptsLoading(false)
      }
    }
    load()
  }, [selectedCollege, selectedDepartment])

  // Load paginated course list when filters, page, or search changes
  useEffect(() => {
    const loadTableData = async () => {
      setTableLoading(true)
      try {
        const result = await getCourses(
          selectedCollege,
          selectedDepartment,
          coursePage,
          10,
          courseSearch,
          categoryFilter,
          dayFilter,
          timeFilter,
        )
        setCourses(result.courses)
        setTotalCoursesCount(result.total)
      } catch (err) {
        console.error('Failed to load courses list:', err)
      } finally {
        setTableLoading(false)
      }
    }

    loadTableData()
  }, [selectedCollege, selectedDepartment, coursePage, courseSearch, categoryFilter, dayFilter, timeFilter])

  // Dynamic Page Title
  const title = selectedDepartment
    ? `${selectedDepartment} 교과목 대시보드`
    : selectedCollege
    ? `${selectedCollege} 교과목 대시보드`
    : '전체 교과목 대시보드'

  const subtitle = selectedDepartment
    ? `${selectedCollege} > ${selectedDepartment} 교과목의 운영 현황 통계`
    : selectedCollege
    ? `${selectedCollege} 소속 학과 교과목의 운영 현황 통계`
    : '인천대학교 2026학년도 1학기 전체 교과목의 운영 현황 통계'

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl w-full mx-auto">
      {/* Page Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={metricsLoading} />

      {/* Category Charts */}
      <CategoryCharts
        categoryCounts={categoryCounts}
        categoryAvgEnrollments={categoryAvgEnrollments}
        loading={metricsLoading}
        activeCategory={categoryFilter}
        onCategoryClick={(cat) => {
          setCategoryFilter((prev) => (prev === cat ? null : cat))
          setCoursePage(1)
          document.getElementById('course-table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      />

      {/* Distribution Charts */}
      <DistributionCharts
        teachingMethods={teachingMethods}
        creditDistribution={creditDistribution}
        loading={metricsLoading}
      />

      {/* Time Charts */}
      <TimeCharts
        coursesByDay={coursesByDay}
        coursesByTime={coursesByTime}
        loading={metricsLoading}
        activeDay={dayFilter}
        activeTime={timeFilter}
        onDayClick={(day) => { setDayFilter(p => p === day ? null : day); setCoursePage(1); document.getElementById('course-table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        onTimeClick={(tr) => { setTimeFilter(p => p === tr ? null : tr); setCoursePage(1); document.getElementById('course-table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
      />

      {/* 단과대 선택 시 상위 학과 표 */}
      {selectedCollege && !selectedDepartment && (
        <CollegeTopDepts
          college={selectedCollege}
          data={topDepts}
          loading={topDeptsLoading}
        />
      )}

      {/* 주간 시간표 히트맵 + 수강률 이상 강좌 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TimetableGrid data={timetableData} loading={timetableLoading} />
        <EnrollmentAlerts
          overEnrolled={alertsData.overEnrolled}
          overTotal={alertsData.overTotal}
          underEnrolled={alertsData.underEnrolled}
          underTotal={alertsData.underTotal}
          loading={alertsLoading}
        />
      </div>

      {/* College Summary Table */}
      <CollegeSummaryTable summary={collegeSummary} loading={summaryLoading} />

      {/* Detailed Course Table */}
      <div id="course-table-section">
      {(categoryFilter || dayFilter || timeFilter) && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm text-slate-500">필터:</span>
          {categoryFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003087] text-white">
              이수구분 · {categoryFilter}
              <button onClick={() => { setCategoryFilter(null); setCoursePage(1) }} className="ml-1 hover:opacity-70 transition-opacity">✕</button>
            </span>
          )}
          {dayFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003087] text-white">
              요일 · {dayFilter}요일
              <button onClick={() => { setDayFilter(null); setCoursePage(1) }} className="ml-1 hover:opacity-70 transition-opacity">✕</button>
            </span>
          )}
          {timeFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003087] text-white">
              시간대 · {timeFilter}
              <button onClick={() => { setTimeFilter(null); setCoursePage(1) }} className="ml-1 hover:opacity-70 transition-opacity">✕</button>
            </span>
          )}
          <span className="text-xs text-slate-400">총 {totalCoursesCount}개 강좌</span>
          <button onClick={() => { setCategoryFilter(null); setDayFilter(null); setTimeFilter(null); setCoursePage(1) }} className="text-xs text-slate-400 hover:text-red-400 transition-colors underline">
            전체 해제
          </button>
        </div>
      )}
      <CourseTable
        courses={courses}
        totalCount={totalCoursesCount}
        page={coursePage}
        pageSize={10}
        search={courseSearch}
        onPageChange={setCoursePage}
        onSearchChange={setCourseSearch}
        loading={tableLoading}
      />
      </div>
    </div>
  )
}
