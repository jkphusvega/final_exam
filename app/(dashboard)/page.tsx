'use client'

import { useMemo, useState } from 'react'
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
  filterCourses,
  computeStats,
  computeCategoryCounts,
  computeCategoryAvgEnrollments,
  computeTeachingMethods,
  computeCreditDistribution,
  computeCoursesByDay,
  computeCoursesByTime,
  computeTimetableGrid,
  computeEnrollmentAlerts,
  computeCollegeSummary,
  computeTopDepts,
  filterAndPaginateCourses,
} from '@/lib/compute'

const PAGE_SIZE = 10

export default function DashboardPage() {
  const { selectedCollege, selectedDepartment, allCourses, coursesLoading } = useDashboard()

  // 필터 상태
  const [coursePage, setCoursePage] = useState(1)
  const [courseSearch, setCourseSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [dayFilter, setDayFilter] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<string | null>(null)

  // 대학/학과 변경 시 필터 초기화
  const prevKey = useMemo(() => `${selectedCollege}::${selectedDepartment}`, [selectedCollege, selectedDepartment])
  useMemo(() => {
    setCategoryFilter(null)
    setDayFilter(null)
    setTimeFilter(null)
    setCoursePage(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevKey])

  // ── 선택된 대학/학과로 필터링 ──
  const filteredCourses = useMemo(
    () => filterCourses(allCourses, selectedCollege, selectedDepartment),
    [allCourses, selectedCollege, selectedDepartment]
  )

  // ── 메트릭 계산 (즉시, 네트워크 없음) ──
  const stats             = useMemo(() => computeStats(filteredCourses), [filteredCourses])
  const categoryCounts    = useMemo(() => computeCategoryCounts(filteredCourses), [filteredCourses])
  const categoryAvg       = useMemo(() => computeCategoryAvgEnrollments(filteredCourses), [filteredCourses])
  const teachingMethods   = useMemo(() => computeTeachingMethods(filteredCourses), [filteredCourses])
  const creditDistribution= useMemo(() => computeCreditDistribution(filteredCourses), [filteredCourses])
  const coursesByDay      = useMemo(() => computeCoursesByDay(filteredCourses), [filteredCourses])
  const coursesByTime     = useMemo(() => computeCoursesByTime(filteredCourses), [filteredCourses])
  const timetableGrid     = useMemo(() => computeTimetableGrid(filteredCourses), [filteredCourses])
  const enrollmentAlerts  = useMemo(() => computeEnrollmentAlerts(filteredCourses), [filteredCourses])
  const collegeSummary    = useMemo(() => computeCollegeSummary(allCourses), [allCourses])
  const topDepts          = useMemo(
    () => selectedCollege && !selectedDepartment ? computeTopDepts(filteredCourses) : [],
    [filteredCourses, selectedCollege, selectedDepartment]
  )

  // ── 상세 강좌 테이블 (검색·필터·페이지네이션 모두 클라이언트) ──
  const { courses, total: totalCoursesCount } = useMemo(
    () => filterAndPaginateCourses(filteredCourses, courseSearch, coursePage, PAGE_SIZE, categoryFilter, dayFilter, timeFilter),
    [filteredCourses, courseSearch, coursePage, categoryFilter, dayFilter, timeFilter]
  )

  // ── 동적 제목 ──
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

  const handleCategoryClick = (cat: string) => {
    setCategoryFilter(p => p === cat ? null : cat)
    setCoursePage(1)
    document.getElementById('course-table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const handleDayClick = (day: string) => {
    setDayFilter(p => p === day ? null : day)
    setCoursePage(1)
    document.getElementById('course-table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const handleTimeClick = (tr: string) => {
    setTimeFilter(p => p === tr ? null : tr)
    setCoursePage(1)
    document.getElementById('course-table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl w-full mx-auto">
      {/* 페이지 제목 */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {/* 통계 카드 */}
      <StatsCards stats={coursesLoading ? null : stats} loading={coursesLoading} />

      {/* 이수구분 차트 */}
      <CategoryCharts
        categoryCounts={categoryCounts}
        categoryAvgEnrollments={categoryAvg}
        loading={coursesLoading}
        activeCategory={categoryFilter}
        onCategoryClick={handleCategoryClick}
      />

      {/* 수업방법·학점 도넛 차트 */}
      <DistributionCharts
        teachingMethods={teachingMethods}
        creditDistribution={creditDistribution}
        loading={coursesLoading}
      />

      {/* 요일·시간 차트 */}
      <TimeCharts
        coursesByDay={coursesByDay}
        coursesByTime={coursesByTime}
        loading={coursesLoading}
        activeDay={dayFilter}
        activeTime={timeFilter}
        onDayClick={handleDayClick}
        onTimeClick={handleTimeClick}
      />

      {/* 히트맵 + 수강률 이상 강좌 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TimetableGrid data={timetableGrid} loading={coursesLoading} />
        <EnrollmentAlerts
          overEnrolled={enrollmentAlerts.overEnrolled}
          overTotal={enrollmentAlerts.overTotal}
          underEnrolled={enrollmentAlerts.underEnrolled}
          underTotal={enrollmentAlerts.underTotal}
          loading={coursesLoading}
        />
      </div>

      {/* 단과대 선택 시 상위 학과 */}
      {selectedCollege && !selectedDepartment && (
        <CollegeTopDepts
          college={selectedCollege}
          data={topDepts}
          loading={coursesLoading}
        />
      )}

      {/* 대학별 요약 */}
      <CollegeSummaryTable summary={collegeSummary} loading={coursesLoading} />

      {/* 상세 강좌 테이블 */}
      <div id="course-table-section">
        {(categoryFilter || dayFilter || timeFilter) && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm text-slate-500">필터:</span>
            {categoryFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003087] text-white">
                이수구분 · {categoryFilter}
                <button onClick={() => { setCategoryFilter(null); setCoursePage(1) }} className="ml-1 hover:opacity-70">✕</button>
              </span>
            )}
            {dayFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003087] text-white">
                요일 · {dayFilter}요일
                <button onClick={() => { setDayFilter(null); setCoursePage(1) }} className="ml-1 hover:opacity-70">✕</button>
              </span>
            )}
            {timeFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003087] text-white">
                시간대 · {timeFilter}
                <button onClick={() => { setTimeFilter(null); setCoursePage(1) }} className="ml-1 hover:opacity-70">✕</button>
              </span>
            )}
            <span className="text-xs text-slate-400">총 {totalCoursesCount}개 강좌</span>
            <button
              onClick={() => { setCategoryFilter(null); setDayFilter(null); setTimeFilter(null); setCoursePage(1) }}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors underline"
            >
              전체 해제
            </button>
          </div>
        )}
        <CourseTable
          courses={courses}
          totalCount={totalCoursesCount}
          page={coursePage}
          pageSize={PAGE_SIZE}
          search={courseSearch}
          onPageChange={setCoursePage}
          onSearchChange={(s) => { setCourseSearch(s); setCoursePage(1) }}
          loading={coursesLoading}
        />
      </div>
    </div>
  )
}
