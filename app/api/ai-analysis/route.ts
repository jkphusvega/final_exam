import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  getStats,
  getCoursesByCategory,
  getTeachingMethods,
  getCreditDistribution,
  getCoursesByDay,
} from '@/lib/data'

export async function POST(request: Request) {
  try {
    const { college, department } = await request.json()

    // 1. Get statistics data from DB
    const [stats, categories, methods, credits, days] = await Promise.all([
      getStats(college, department),
      getCoursesByCategory(college, department),
      getTeachingMethods(college, department),
      getCreditDistribution(college, department),
      getCoursesByDay(college, department),
    ])

    const dataJson = JSON.stringify({
      stats,
      categories,
      methods,
      credits,
      days,
    }, null, 2)

    // 2. Initialize Gemini API Client
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === '여기에_입력') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되어 있지 않습니다.' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

    const targetName = department || college || '대학 전체'
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    })

    const prompt = `당신은 대학 교육과정 분석 전문가입니다.
아래는 인천대학교 2026학년도 1학기 [${targetName}]의 강좌 운영 현황 데이터입니다.
${dataJson}

당신은 반드시 아래에 제시된 출력 포맷 템플릿과 완전히 동일한 구조와 섹션명, 마크다운 문법(헤더 #, ##, ###, 볼드체 **, 글머리 기호 *)을 사용하여 보고서를 작성해야 합니다. 데이터 요약의 수치들은 JSON의 실제 값을 그대로 혹은 계산하여 반영하세요.

출력 포맷 템플릿:
=== AI 강의 데이터 분석 보고서 ===
분석 대상: ${targetName}
일자: ${today}
작성 모델: Gemini 3.1 Flash-Lite

# [분석 보고서] 2026학년도 1학기 인천대학교 교육과정 및 강좌 운영 분석

**작성일:** ${today}
**분석 대상:** 인천대학교 2026학년도 1학기 ${targetName} 강좌 및 수강 데이터

---

## 1. 데이터 요약
제공된 데이터를 기반으로 ${targetName}의 교육과정 운영 현황을 요약합니다.
*   **강좌 규모:** 총 [JSON의 stats.totalCourses 결과]개의 강좌가 개설되어 운영 중입니다.
*   **수강 규모:** 총 [JSON의 stats.totalEnrollment 결과]명의 학생들이 수강하고 있으며, 평균 수강률은 [JSON의 stats.avgAttendanceRate 결과]%입니다.
*   **글로벌 역량:** 전체 강좌 중 원어(영어) 강의 비율은 [JSON의 stats.foreignLectureRate 결과]%입니다.

---

## 2. 주요 특징 및 트렌드 분석

### 1) 이수구분 및 학점 구성 특성
*   **이수구분별 분포:** [JSON의 categories를 바탕으로 가장 높은 비중을 차지하는 이수구분 및 주요 비중 설명. 특히 getAvgEnrollmentByCategory 결과를 반영하여 특정 이수구분의 평균 수강인원이 높다면 상세 기술]
*   **학점 구성:** [JSON의 credits 데이터(예: 3학점 등) 구성비 설명]

### 2) 수업방법 비중 및 시사점
*   **수업방법별 분포:** [JSON의 methods 데이터를 반영하여 대면수업 등 비중 설명 및 시사점 기술]

### 3) 요일 및 시간대별 강좌 배치 현황
*   **요일별 분포:** [JSON의 days 데이터를 기반으로 요일별 강좌 수 쏠림 현상(예: 화/수 집중, 금요일 급감 등) 설명]
*   **시간대별 분포:** [시간대별 강좌 수 데이터를 기반으로 특정 시간대 쏠림 현상 설명]

---

## 3. 문제점 및 개선 아이디어 제언

### [수강율 극대화 및 효율적 운영]
*   [평균 수강인원이 과도하게 높은 강좌군에 대한 분반 개설이나 혼합형(Blended) 수업 도입 아이디어 등 구체적 제언]

### [원어 강의 활성화]
*   [현재 원어 강의 비율을 향상하기 위한 인센티브 설계, 전공 핵심 내 원어 강좌 개설 권장 등 제언]

### [요일/시간대 분산 전략]
*   [특정 요일(예: 금요일)이나 시간대(예: 오후 늦은 시간) 쏠림 현상을 완화하기 위한 학기 시간표 최적화, 특화 프로그램 도입 등 제언]

---
*본 보고서는 2026학년도 1학기 학사 운영의 효율성을 제고하고, 학생 중심의 최적화된 교육 환경을 마련하기 위한 기초 자료로 활용되길 바랍니다.*`

    const result = await model.generateContent(prompt)
    const analysisText = result.response.text()

    return NextResponse.json({ analysis: analysisText })
  } catch (error: any) {
    console.error('AI Analysis failed:', error)
    const msg = error.message || ''
    
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Quota exceeded')) {
      return NextResponse.json(
        { error: 'Gemini API 무료 티어 요청 한도(Quota)를 초과했습니다. 약 30초~1분 뒤에 다시 시도해 주세요.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'AI 분석 도중 서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

