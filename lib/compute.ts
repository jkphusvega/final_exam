// 클라이언트에서 캐싱된 Course[] 데이터를 계산하는 순수 함수 모음
// 네트워크 호출 없음 — 모든 연산은 메모리에서 즉시 처리

import { Course } from '@/types'

const DISPLAY_TO_DB: Record<string, string[]> = {
  '기초교육원':             ['교양'],
  '글로벌경영대학':         ['글로벌정경대학'],
  '동북아국제통상물류학부': ['단과대구분없음'],
  '법학부':                 ['단과대구분없음(법학)'],
}

const DB_TO_DISPLAY: Record<string, string> = {
  '교양':                 '기초교육원',
  '글로벌정경대학':       '글로벌경영대학',
  '단과대구분없음':       '동북아국제통상물류학부',
  '단과대구분없음(법학)': '법학부',
}

export function resolveCollegeName(raw: string): string {
  return DB_TO_DISPLAY[raw?.trim()] ?? raw?.trim() ?? ''
}

export function filterCourses(
  courses: Course[],
  college?: string | null,
  department?: string | null,
): Course[] {
  let result = courses
  if (college) {
    const allowed = new Set(DISPLAY_TO_DB[college] ?? [college])
    result = result.filter(c => allowed.has((c as any)['대학(원)']?.trim() ?? ''))
  }
  if (department) {
    result = result.filter(c => (c as any)['학과(부)'] === department)
  }
  return result
}

export function computeStats(courses: Course[]) {
  const total = courses.length
  if (total === 0) return { totalCourses: 0, totalEnrollment: 0, avgAttendanceRate: 0, foreignLectureRate: 0 }
  let enrollment = 0, attSum = 0, attCnt = 0, foreignCnt = 0
  courses.forEach(c => {
    enrollment += c.수강 || 0
    const limit = c.정원 || 0, current = c.수강 || 0
    if (limit > 0) { attSum += (current / limit) * 100; attCnt++ }
    if (c.원어강의 === 'Y' || c.원어강의 === '원어') foreignCnt++
  })
  return {
    totalCourses: total,
    totalEnrollment: enrollment,
    avgAttendanceRate: attCnt > 0 ? attSum / attCnt : 0,
    foreignLectureRate: (foreignCnt / total) * 100,
  }
}

export function computeCategoryCounts(courses: Course[]) {
  const map: Record<string, number> = {}
  courses.forEach(c => { const k = c.이수구분 || '기타'; map[k] = (map[k] || 0) + 1 })
  return Object.entries(map).map(([category, count]) => ({ category, count }))
}

export function computeCategoryAvgEnrollments(courses: Course[]) {
  const sum: Record<string, number> = {}, cnt: Record<string, number> = {}
  courses.forEach(c => {
    const k = c.이수구분 || '기타'
    sum[k] = (sum[k] || 0) + (c.수강 || 0)
    cnt[k] = (cnt[k] || 0) + 1
  })
  return Object.keys(sum).map(category => ({
    category,
    avgEnrollment: parseFloat((sum[category] / cnt[category]).toFixed(1)),
  }))
}

export function computeTeachingMethods(courses: Course[]) {
  const map: Record<string, number> = {}
  courses.forEach(c => { const k = c.수업방법 || '미지정'; map[k] = (map[k] || 0) + 1 })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

export function computeCreditDistribution(courses: Course[]) {
  const map: Record<string, number> = {}
  courses.forEach(c => {
    const k = c.학점 != null ? `${c.학점}학점` : '미지정'
    map[k] = (map[k] || 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

export function computeCoursesByDay(courses: Course[]) {
  const DAYS = ['월', '화', '수', '목', '금', '토']
  const map: Record<string, number> = Object.fromEntries(DAYS.map(d => [d, 0]))
  courses.forEach(c => {
    const s = (c as any)['시간표(교시)'] || ''
    DAYS.forEach(d => { if (s.includes(d)) map[d]++ })
  })
  return DAYS.map(day => ({ day, count: map[day] }))
}

export function computeCoursesByTime(courses: Course[]) {
  const groups = [
    { name: '9시 이전',    min: 0,        max: 8 * 60 + 59,  count: 0 },
    { name: '09:00-10:59', min: 9 * 60,   max: 10 * 60 + 59, count: 0 },
    { name: '11:00-12:59', min: 11 * 60,  max: 12 * 60 + 59, count: 0 },
    { name: '13:00-14:59', min: 13 * 60,  max: 14 * 60 + 59, count: 0 },
    { name: '15:00-16:59', min: 15 * 60,  max: 16 * 60 + 59, count: 0 },
    { name: '17:00 이후',  min: 17 * 60,  max: 24 * 60,       count: 0 },
  ]
  courses.forEach(c => {
    const m = ((c as any)['시간표(시간)'] || '').match(/(\d{2}):(\d{2})/)
    if (m) {
      const mins = parseInt(m[1]) * 60 + parseInt(m[2])
      for (const g of groups) { if (mins >= g.min && mins <= g.max) { g.count++; break } }
    }
  })
  return groups.map(g => ({ timeRange: g.name, count: g.count }))
}

export function computeTimetableGrid(courses: Course[]) {
  const DAYS = ['월', '화', '수', '목', '금']
  const HOURS = [9,10,11,12,13,14,15,16,17,18,19,20]
  const grid: Record<string, Record<number, number>> = {}
  DAYS.forEach(d => { grid[d] = {}; HOURS.forEach(h => { grid[d][h] = 0 }) })
  courses.forEach(c => {
    const segs = [...((c as any)['시간표(시간)'] ?? '').matchAll(/([월화수목금토])([^월화수목금토]*)/g)]
    for (const seg of segs) {
      const day = seg[1]; if (!grid[day]) continue
      for (const t of [...seg[2].matchAll(/\((\d{2}):(\d{2})/g)]) {
        const h = parseInt(t[1]); if (grid[day][h] !== undefined) grid[day][h]++
      }
    }
  })
  return HOURS.map(hour => ({
    hour, 월: grid['월'][hour], 화: grid['화'][hour],
    수: grid['수'][hour], 목: grid['목'][hour], 금: grid['금'][hour],
  }))
}

export function computeEnrollmentAlerts(courses: Course[]) {
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
  return { overEnrolled, overTotal: overEnrolled.length, underEnrolled, underTotal: underEnrolled.length }
}

const COLLEGE_ORDER = [
  '기초교육원','인문대학','자연과학대학','사회과학대학','글로벌경영대학',
  '공과대학','정보기술대학','경영대학','예술체육대학','사범대학',
  '도시과학대학','생명과학기술대학','융합자유전공대학','동북아국제통상물류학부','법학부',
]

export function computeCollegeSummary(allCourses: Course[]) {
  const map: Record<string, { count: number; enrollment: number; attSum: number; attCnt: number }> = {}
  COLLEGE_ORDER.forEach(c => { map[c] = { count: 0, enrollment: 0, attSum: 0, attCnt: 0 } })
  allCourses.forEach(c => {
    const name = resolveCollegeName((c as any)['대학(원)'] ?? '')
    if (!map[name]) return
    map[name].count++
    map[name].enrollment += c.수강 || 0
    const limit = c.정원 || 0, current = c.수강 || 0
    if (limit > 0) { map[name].attSum += (current / limit) * 100; map[name].attCnt++ }
  })
  return COLLEGE_ORDER.map(col => ({
    collegeName: col,
    courseCount: map[col].count,
    totalEnrollment: map[col].enrollment,
    avgAttendanceRate: map[col].attCnt > 0
      ? parseFloat((map[col].attSum / map[col].attCnt).toFixed(1)) : 0,
  }))
}

export function computeTopDepts(courses: Course[], topN = 10) {
  const map: Record<string, { count: number; enrollment: number; attSum: number; attCnt: number }> = {}
  courses.forEach(c => {
    const dept = (c as any)['학과(부)']?.trim() || '기타'
    if (!map[dept]) map[dept] = { count: 0, enrollment: 0, attSum: 0, attCnt: 0 }
    map[dept].count++
    map[dept].enrollment += c.수강 || 0
    const limit = c.정원 || 0, current = c.수강 || 0
    if (limit > 0) { map[dept].attSum += (current / limit) * 100; map[dept].attCnt++ }
  })
  return Object.entries(map)
    .map(([dept, s]) => ({
      dept,
      courseCount: s.count,
      totalEnrollment: s.enrollment,
      avgAttendanceRate: s.attCnt > 0 ? parseFloat((s.attSum / s.attCnt).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.courseCount - a.courseCount)
    .slice(0, topN)
}

const TIME_RANGES: Record<string, [number, number]> = {
  '9시 이전':    [0,       8 * 60 + 59],
  '09:00-10:59': [9 * 60,  10 * 60 + 59],
  '11:00-12:59': [11 * 60, 12 * 60 + 59],
  '13:00-14:59': [13 * 60, 14 * 60 + 59],
  '15:00-16:59': [15 * 60, 16 * 60 + 59],
  '17:00 이후':  [17 * 60, 24 * 60],
}

export function filterAndPaginateCourses(
  courses: Course[],
  search: string,
  page: number,
  pageSize: number,
  category?: string | null,
  day?: string | null,
  timeRange?: string | null,
) {
  let result = courses
  if (category) result = result.filter(c => c.이수구분 === category)
  if (day) result = result.filter(c => ((c as any)['시간표(교시)'] ?? '').includes(day))
  if (timeRange) {
    const range = TIME_RANGES[timeRange]
    if (range) {
      result = result.filter(c => {
        const m = ((c as any)['시간표(시간)'] ?? '').match(/(\d{2}):(\d{2})/)
        if (!m) return false
        const mins = parseInt(m[1]) * 60 + parseInt(m[2])
        return mins >= range[0] && mins <= range[1]
      })
    }
  }
  if (search) {
    const s = search.trim().toLowerCase()
    result = result.filter(c =>
      c.교과목명?.toLowerCase().includes(s) ||
      c.담당교수?.toLowerCase().includes(s) ||
      c.학수번호?.toLowerCase().includes(s)
    )
  }
  const total = result.length
  const paginated = result.slice((page - 1) * pageSize, page * pageSize)
  return { courses: paginated, total }
}
