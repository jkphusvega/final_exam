'use server'

import { createClient } from '@/lib/supabase/server'
import { Course } from '@/types'

// -------------------------------------------------------------------
// PostgREST CANNOT filter columns with parentheses in the name
// (e.g. 대학(원)) because it interprets ( ) as embedded resource syntax.
// Solution: always fetch ALL rows with select('*') and filter in JS.
// -------------------------------------------------------------------

// display name → DB 실제 대학(원) 값 목록
// '단과대구분없음' = 동북아국제통상물류학부, '단과대구분없음(법학)' = 법학부
const DISPLAY_TO_DB_COLLEGES: Record<string, string[]> = {
  '기초교육원':             ['교양'],
  '글로벌경영대학':         ['글로벌정경대학'],
  '동북아국제통상물류학부': ['단과대구분없음'],
  '법학부':                 ['단과대구분없음(법학)'],
}

// DB 실제값 → canonical display name
const DB_TO_DISPLAY: Record<string, string> = {
  '교양':                 '기초교육원',
  '글로벌정경대학':       '글로벌경영대학',
  '단과대구분없음':       '동북아국제통상물류학부',
  '단과대구분없음(법학)': '법학부',
}

function resolveDisplayName(rawDbValue: string): string {
  const key = rawDbValue.trim()
  return DB_TO_DISPLAY[key] ?? key
}

function matchesCollege(rawDbValue: string, displayName: string): boolean {
  const key = rawDbValue.trim()
  const allowed = DISPLAY_TO_DB_COLLEGES[displayName]
  if (allowed) return allowed.includes(key)
  return key === displayName
}

// Fetch every row from courses table (paginated, 1 000/page)
async function fetchAllCourses(): Promise<Course[]> {
  const supabase = await createClient()
  const all: Course[] = []
  const PAGE = 1000
  let page = 0

  while (true) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .range(page * PAGE, page * PAGE + PAGE - 1)

    if (error) {
      console.error('[data.ts] fetchAllCourses error:', JSON.stringify(error))
      break
    }
    if (!data || data.length === 0) break

    all.push(...(data as unknown as Course[]))
    if (data.length < PAGE) break
    page++
  }

  console.log(`[data.ts] fetchAllCourses → ${all.length} rows (${page + 1} page(s))`)
  return all
}

export async function fetchFilteredCourses(
  college?: string | null,
  department?: string | null,
): Promise<Course[]> {
  const all = await fetchAllCourses()

  let result = all

  if (college) {
    result = result.filter((c) => matchesCollege((c as any)['대학(원)'] ?? '', college))
    console.log(`[data.ts] filter college="${college}" → ${result.length} rows`)
  }

  if (department) {
    result = result.filter((c) => c['학과(부)'] === department)
  }

  return result
}


// ─────────────────────────────────────────────────────────────
// 단일 fetch로 모든 대시보드 메트릭을 한번에 계산
// page.tsx에서 7개 함수를 개별 호출하던 것을 이 함수 하나로 대체
// ─────────────────────────────────────────────────────────────
export async function getAllDashboardData(
  college?: string | null,
  department?: string | null,
) {
  const courses = await fetchFilteredCourses(college, department)
  const total = courses.length

  // ── 통계 카드 ──
  let enrollmentSum = 0, attendanceSum = 0, attendanceCount = 0, foreignCount = 0
  courses.forEach(c => {
    enrollmentSum += c.수강 || 0
    const limit = c.정원 || 0, current = c.수강 || 0
    if (limit > 0) { attendanceSum += (current / limit) * 100; attendanceCount++ }
    if (c.원어강의 === 'Y' || c.원어강의 === '원어') foreignCount++
  })
  const stats = {
    totalCourses: total,
    totalEnrollment: enrollmentSum,
    avgAttendanceRate: attendanceCount > 0 ? attendanceSum / attendanceCount : 0,
    foreignLectureRate: total > 0 ? (foreignCount / total) * 100 : 0,
  }

  // ── 이수구분 ──
  const catCountMap: Record<string, number> = {}
  const catSumMap: Record<string, number> = {}
  const catCntMap: Record<string, number> = {}
  courses.forEach(c => {
    const cat = c.이수구분 || '기타'
    catCountMap[cat] = (catCountMap[cat] || 0) + 1
    catSumMap[cat] = (catSumMap[cat] || 0) + (c.수강 || 0)
    catCntMap[cat] = (catCntMap[cat] || 0) + 1
  })
  const categoryCounts = Object.entries(catCountMap).map(([category, count]) => ({ category, count }))
  const categoryAvgEnrollments = Object.keys(catSumMap).map(category => ({
    category,
    avgEnrollment: parseFloat((catSumMap[category] / catCntMap[category]).toFixed(1)),
  }))

  // ── 수업방법 ──
  const methodMap: Record<string, number> = {}
  courses.forEach(c => { const m = c.수업방법 || '미지정'; methodMap[m] = (methodMap[m] || 0) + 1 })
  const teachingMethods = Object.entries(methodMap).map(([name, value]) => ({ name, value }))

  // ── 학점 분포 ──
  const creditMap: Record<string, number> = {}
  courses.forEach(c => {
    const cr = c.학점 != null ? `${c.학점}학점` : '미지정'
    creditMap[cr] = (creditMap[cr] || 0) + 1
  })
  const creditDistribution = Object.entries(creditMap).map(([name, value]) => ({ name, value }))

  // ── 요일별 ──
  const DAYS = ['월', '화', '수', '목', '금', '토']
  const dayMap: Record<string, number> = Object.fromEntries(DAYS.map(d => [d, 0]))
  courses.forEach(c => {
    const s = (c as any)['시간표(교시)'] || ''
    DAYS.forEach(d => { if (s.includes(d)) dayMap[d]++ })
  })
  const coursesByDay = DAYS.map(day => ({ day, count: dayMap[day] }))

  // ── 시간대별 ──
  const timeGroups = [
    { name: '9시 이전',    min: 0,       max: 8 * 60 + 59, count: 0 },
    { name: '09:00-10:59', min: 9 * 60,  max: 10 * 60 + 59, count: 0 },
    { name: '11:00-12:59', min: 11 * 60, max: 12 * 60 + 59, count: 0 },
    { name: '13:00-14:59', min: 13 * 60, max: 14 * 60 + 59, count: 0 },
    { name: '15:00-16:59', min: 15 * 60, max: 16 * 60 + 59, count: 0 },
    { name: '17:00 이후',  min: 17 * 60, max: 24 * 60,       count: 0 },
  ]
  courses.forEach(c => {
    const m = ((c as any)['시간표(시간)'] || '').match(/(\d{2}):(\d{2})/)
    if (m) {
      const mins = parseInt(m[1]) * 60 + parseInt(m[2])
      for (const g of timeGroups) { if (mins >= g.min && mins <= g.max) { g.count++; break } }
    }
  })
  const coursesByTime = timeGroups.map(g => ({ timeRange: g.name, count: g.count }))

  // ── 시간표 히트맵 ──
  const GRID_DAYS = ['월', '화', '수', '목', '금']
  const HOURS = [9,10,11,12,13,14,15,16,17,18,19,20]
  const grid: Record<string, Record<number, number>> = {}
  GRID_DAYS.forEach(d => { grid[d] = {}; HOURS.forEach(h => { grid[d][h] = 0 }) })
  courses.forEach(c => {
    const s = (c as any)['시간표(시간)'] ?? ''
    const segs = [...s.matchAll(/([월화수목금토])([^월화수목금토]*)/g)]
    for (const seg of segs) {
      const day = seg[1]; if (!grid[day]) continue
      for (const t of [...seg[2].matchAll(/\((\d{2}):(\d{2})/g)]) {
        const h = parseInt(t[1]); if (grid[day][h] !== undefined) grid[day][h]++
      }
    }
  })
  const timetableGrid = HOURS.map(hour => ({
    hour, 월: grid['월'][hour], 화: grid['화'][hour],
    수: grid['수'][hour], 목: grid['목'][hour], 금: grid['금'][hour],
  }))

  // ── 수강률 이상 강좌 ──
  const withRate = courses
    .filter(c => (c.정원 || 0) > 0)
    .map(c => ({
      교과목명: c.교과목명,
      학과: (c as any)['학과(부)'] as string,
      담당교수: c.담당교수,
      수강: c.수강 || 0,
      정원: c.정원 || 0,
      rate: ((c.수강 || 0) / (c.정원 || 1)) * 100,
    }))
  const overEnrolled = withRate.filter(c => c.rate > 100).sort((a, b) => b.rate - a.rate)
  const underEnrolled = withRate.filter(c => c.rate < 50).sort((a, b) => a.rate - b.rate)

  return {
    stats,
    categoryCounts,
    categoryAvgEnrollments,
    teachingMethods,
    creditDistribution,
    coursesByDay,
    coursesByTime,
    timetableGrid,
    enrollmentAlerts: {
      overEnrolled, overTotal: overEnrolled.length,
      underEnrolled, underTotal: underEnrolled.length,
    },
  }
}

export async function getStats(college?: string | null, department?: string | null) {
  const courses = await fetchFilteredCourses(college, department)
  
  const totalCourses = courses.length
  if (totalCourses === 0) {
    return {
      totalCourses: 0,
      totalEnrollment: 0,
      avgAttendanceRate: 0,
      foreignLectureRate: 0,
    }
  }

  let totalEnrollment = 0
  let attendanceSum = 0
  let attendanceCount = 0
  let foreignCount = 0

  courses.forEach((c) => {
    // 수강인원
    totalEnrollment += c.수강 || 0

    // 수강률 계산: (수강인원 / 수강정원) * 100, 정원이 0인 경우 제외
    const limit = c.정원 || 0
    const current = c.수강 || 0
    if (limit > 0) {
      attendanceSum += (current / limit) * 100
      attendanceCount++
    }

    // 원어강의 비율: Y 또는 원어
    const isForeign = c.원어강의 === 'Y' || c.원어강의 === '원어'
    if (isForeign) {
      foreignCount++
    }
  })

  const avgAttendanceRate = attendanceCount > 0 ? attendanceSum / attendanceCount : 0
  const foreignLectureRate = (foreignCount / totalCourses) * 100

  return {
    totalCourses,
    totalEnrollment,
    avgAttendanceRate,
    foreignLectureRate,
  }
}

export async function getCoursesByCategory(college?: string | null, department?: string | null) {
  const courses = await fetchFilteredCourses(college, department)
  const map: Record<string, number> = {}

  courses.forEach((c) => {
    const cat = c.이수구분 || '기타'
    map[cat] = (map[cat] || 0) + 1
  })

  return Object.entries(map).map(([category, count]) => ({
    category,
    count,
  }))
}

export async function getAvgEnrollmentByCategory(college?: string | null, department?: string | null) {
  const courses = await fetchFilteredCourses(college, department)
  const sumMap: Record<string, number> = {}
  const countMap: Record<string, number> = {}

  courses.forEach((c) => {
    const cat = c.이수구분 || '기타'
    sumMap[cat] = (sumMap[cat] || 0) + (c.수강 || 0)
    countMap[cat] = (countMap[cat] || 0) + 1
  })

  return Object.keys(sumMap).map((category) => ({
    category,
    avgEnrollment: parseFloat((sumMap[category] / countMap[category]).toFixed(1)),
  }))
}

export async function getTeachingMethods(college?: string | null, department?: string | null) {
  const courses = await fetchFilteredCourses(college, department)
  const map: Record<string, number> = {}

  courses.forEach((c) => {
    const method = c.수업방법 || '미지정'
    map[method] = (map[method] || 0) + 1
  })

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }))
}

export async function getCreditDistribution(college?: string | null, department?: string | null) {
  const courses = await fetchFilteredCourses(college, department)
  const map: Record<string, number> = {}

  courses.forEach((c) => {
    const cr = c.학점 !== undefined && c.학점 !== null ? `${c.학점}학점` : '미지정'
    map[cr] = (map[cr] || 0) + 1
  })

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }))
}

export async function getCoursesByDay(college?: string | null, department?: string | null) {
  const courses = await fetchFilteredCourses(college, department)
  const days = ['월', '화', '수', '목', '금', '토']
  const map: Record<string, number> = {
    '월': 0, '화': 0, '수': 0, '목': 0, '금': 0, '토': 0
  }

  courses.forEach((c) => {
    const schedule = c['시간표(교시)'] || c['시간표(시간)'] || ''
    days.forEach((day) => {
      if (schedule.includes(day)) {
        map[day]++
      }
    })
  })

  return days.map((day) => ({
    day,
    count: map[day],
  }))
}

export async function getCoursesByTime(college?: string | null, department?: string | null) {
  const courses = await fetchFilteredCourses(college, department)
  const groups = [
    { name: '9시 이전', min: 0, max: 9 * 60 - 1, count: 0 },
    { name: '09:00-10:59', min: 9 * 60, max: 11 * 60 - 1, count: 0 },
    { name: '11:00-12:59', min: 11 * 60, max: 13 * 60 - 1, count: 0 },
    { name: '13:00-14:59', min: 13 * 60, max: 15 * 60 - 1, count: 0 },
    { name: '15:00-16:59', min: 15 * 60, max: 17 * 60 - 1, count: 0 },
    { name: '17:00 이후', min: 17 * 60, max: 24 * 60, count: 0 }
  ]

  courses.forEach((c) => {
    const timeStr = c['시간표(시간)'] || ''
    const match = timeStr.match(/(\d{2}):(\d{2})/)
    if (match) {
      const hour = parseInt(match[1], 10)
      const minute = parseInt(match[2], 10)
      const timeInMinutes = hour * 60 + minute

      for (const group of groups) {
        if (timeInMinutes >= group.min && timeInMinutes <= group.max) {
          group.count++
          break
        }
      }
    }
  })

  return groups.map((g) => ({
    timeRange: g.name,
    count: g.count,
  }))
}

export async function getCollegeSummary() {
  const courses = await fetchAllCourses()

  const COLLEGE_ORDER = [
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

  const statsMap: Record<string, { count: number; enrollment: number; attendanceSum: number; attendanceCount: number }> = {}
  COLLEGE_ORDER.forEach(col => {
    statsMap[col] = { count: 0, enrollment: 0, attendanceSum: 0, attendanceCount: 0 }
  })

  courses.forEach(c => {
    const rawDb = (c as any)['대학(원)'] ?? ''
    const displayName = resolveDisplayName(rawDb)
    if (!statsMap[displayName]) return

    statsMap[displayName].count++
    statsMap[displayName].enrollment += c.수강 || 0
    const limit = c.정원 || 0
    const current = c.수강 || 0
    if (limit > 0) {
      statsMap[displayName].attendanceSum += (current / limit) * 100
      statsMap[displayName].attendanceCount++
    }
  })

  return COLLEGE_ORDER.map(col => {
    const stats = statsMap[col]
    const avgAttendanceRate = stats.attendanceCount > 0 ? stats.attendanceSum / stats.attendanceCount : 0
    return {
      collegeName: col,
      courseCount: stats.count,
      totalEnrollment: stats.enrollment,
      avgAttendanceRate: parseFloat(avgAttendanceRate.toFixed(1)),
    }
  })
}

// 시간표(시간) 문자열에서 { day, hour } 목록 추출
function parseScheduleTimes(schedule: string): { day: string; hour: number }[] {
  const result: { day: string; hour: number }[] = []
  if (!schedule) return result
  // 요일 뒤에 나오는 텍스트를 그룹핑해서 시간 블록 추출
  const segments = [...schedule.matchAll(/([월화수목금토])([^월화수목금토]*)/g)]
  for (const seg of segments) {
    const day = seg[1]
    const times = [...seg[2].matchAll(/\((\d{2}):(\d{2})/g)]
    for (const t of times) {
      result.push({ day, hour: parseInt(t[1]) })
    }
  }
  return result
}

export async function getTimetableGrid(
  college?: string | null,
  department?: string | null,
) {
  const courses = await fetchFilteredCourses(college, department)
  const DAYS = ['월', '화', '수', '목', '금']
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  const grid: Record<string, Record<number, number>> = {}
  DAYS.forEach(d => { grid[d] = {}; HOURS.forEach(h => { grid[d][h] = 0 }) })

  courses.forEach(c => {
    const schedule = (c as any)['시간표(시간)'] ?? ''
    parseScheduleTimes(schedule).forEach(({ day, hour }) => {
      if (grid[day] && grid[day][hour] !== undefined) grid[day][hour]++
    })
  })

  return HOURS.map(hour => ({
    hour,
    월: grid['월'][hour],
    화: grid['화'][hour],
    수: grid['수'][hour],
    목: grid['목'][hour],
    금: grid['금'][hour],
  }))
}

export async function getEnrollmentAlerts(
  college?: string | null,
  department?: string | null,
) {
  const courses = await fetchFilteredCourses(college, department)

  const withRate = courses
    .filter(c => (c.정원 || 0) > 0)
    .map(c => ({
      교과목명: c.교과목명,
      학과: (c as any)['학과(부)'] as string,
      담당교수: c.담당교수,
      수강: c.수강 || 0,
      정원: c.정원 || 0,
      rate: ((c.수강 || 0) / (c.정원 || 1)) * 100,
    }))

  const overEnrolled = withRate.filter(c => c.rate > 100).sort((a, b) => b.rate - a.rate)
  const underEnrolled = withRate.filter(c => c.rate < 50).sort((a, b) => a.rate - b.rate)

  return {
    overEnrolled,
    overTotal: overEnrolled.length,
    underEnrolled,
    underTotal: underEnrolled.length,
  }
}

export async function getTopDeptsByCollege(college: string, topN = 10) {
  const courses = await fetchFilteredCourses(college, null)

  const map: Record<string, { count: number; enrollment: number; attendanceSum: number; attendanceCount: number }> = {}

  courses.forEach((c) => {
    const dept = (c as any)['학과(부)']?.trim() || '기타'
    if (!map[dept]) map[dept] = { count: 0, enrollment: 0, attendanceSum: 0, attendanceCount: 0 }
    map[dept].count++
    map[dept].enrollment += c.수강 || 0
    const limit = c.정원 || 0
    const current = c.수강 || 0
    if (limit > 0) {
      map[dept].attendanceSum += (current / limit) * 100
      map[dept].attendanceCount++
    }
  })

  return Object.entries(map)
    .map(([dept, s]) => ({
      dept,
      courseCount: s.count,
      totalEnrollment: s.enrollment,
      avgAttendanceRate: s.attendanceCount > 0 ? parseFloat((s.attendanceSum / s.attendanceCount).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.courseCount - a.courseCount)
    .slice(0, topN)
}

export async function getCourses(
  college?: string | null,
  department?: string | null,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  category?: string | null,
  day?: string | null,
  timeRange?: string | null,
) {
  let courses = await fetchFilteredCourses(college, department)

  if (category) {
    courses = courses.filter(c => c.이수구분 === category)
  }

  if (day) {
    courses = courses.filter(c => ((c as any)['시간표(교시)'] ?? '').includes(day))
  }

  if (timeRange) {
    const TIME_RANGES: Record<string, [number, number]> = {
      '9시 이전':    [0,    8 * 60 + 59],
      '09:00-10:59': [9 * 60, 10 * 60 + 59],
      '11:00-12:59': [11 * 60, 12 * 60 + 59],
      '13:00-14:59': [13 * 60, 14 * 60 + 59],
      '15:00-16:59': [15 * 60, 16 * 60 + 59],
      '17:00 이후':  [17 * 60, 24 * 60],
    }
    const range = TIME_RANGES[timeRange]
    if (range) {
      courses = courses.filter(c => {
        const match = ((c as any)['시간표(시간)'] ?? '').match(/(\d{2}):(\d{2})/)
        if (!match) return false
        const mins = parseInt(match[1]) * 60 + parseInt(match[2])
        return mins >= range[0] && mins <= range[1]
      })
    }
  }

  if (search) {
    const cleanSearch = search.trim().toLowerCase()
    courses = courses.filter(c =>
      c.교과목명?.toLowerCase().includes(cleanSearch) ||
      c.담당교수?.toLowerCase().includes(cleanSearch) ||
      c.학수번호?.toLowerCase().includes(cleanSearch)
    )
  }

  const total = courses.length
  const startIndex = (page - 1) * pageSize
  const paginatedCourses = courses.slice(startIndex, startIndex + pageSize)

  return {
    courses: paginatedCourses,
    total
  }
}


