# AGENTS.md — 프로젝트 고정 규칙 + 단계별 작업 지시

> 이 파일은 Antigravity가 매 작업마다 자동으로 읽는 **고정 규칙**이다.
> Phase 프롬프트는 이 파일 하단에 있으며, 채팅에 **한 Phase씩 순서대로** 복사해서 입력한다.
> 각 Phase 완료 확인 후 다음 Phase를 입력한다.

---

## 프로젝트
인천대학교 2026-1학기 전체 교과목 대시보드.

## 기술 스택 (고정)
- Next.js 16 (App Router) + TypeScript
- Supabase (PostgreSQL) — DB/백엔드
- Tailwind CSS + shadcn/ui
- Recharts (모든 그래프는 인터랙티브 툴팁 필수)
- 상태관리: React Context API
- Gemini API (`@google/generative-ai`) — AI 강의 분석
- 배포: Vercel

## 환경변수 규칙 (중요)
- `NEXT_PUBLIC_SUPABASE_URL` — API URL에서 `/rest/v1/` 제거한 base 도메인만 사용
  예) `https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key 사용
- `GEMINI_API_KEY` — Google AI Studio 발급 키 (서버사이드 전용, `NEXT_PUBLIC_` 붙이지 말 것)
- 모든 키는 `.env.local` 에 저장, 하드코딩 금지

## Supabase 패키지
- `@supabase/supabase-js` (핵심 클라이언트)
- `@supabase/ssr` (App Router 서버사이드)

## ⚠️ Supabase PostgREST 제약사항 (절대 무시 금지)
Supabase PostgREST는 컬럼명에 괄호가 포함된 경우 (`대학(원)`, `학과(부)`, `시간표(교시)` 등)
임베디드 리소스 문법으로 해석하여 **필터 쿼리가 오류를 일으킨다.**

**해결책: 항상 `select('*')`로 전체 행을 가져온 뒤 JavaScript에서 필터링한다.**
절대 `.eq('대학(원)', value)` 형태의 PostgREST 필터를 사용하지 말 것.

## ⚠️ Supabase DB 실제 컬럼값 매핑 (중요)
CSV 임포트 결과 일부 대학의 `대학(원)` 컬럼값이 표시명과 다르다. **반드시 아래 매핑을 사용하라:**

| 사이드바 표시명 | DB 실제 `대학(원)` 값 |
|---|---|
| 기초교육원 | `교양` |
| 글로벌경영대학 | `글로벌정경대학` |
| 동북아국제통상물류학부 | `단과대구분없음` |
| 법학부 | `단과대구분없음(법학)` |
| 그 외 대학 | 표시명과 동일 |

`lib/data.ts`의 `DISPLAY_TO_DB_COLLEGES`와 `DB_TO_DISPLAY` 맵을 항상 이 기준으로 유지할 것.

## ⚠️ 데이터 페칭 구조 (성능 최적화 — 변경 금지)
`lib/data.ts`에 `getAllDashboardData(college?, department?)` 함수가 있다.
이 함수는 `fetchFilteredCourses`를 **단 1회** 호출한 뒤 모든 메트릭(통계, 차트, 히트맵, 수강률 이상 강좌)을
JavaScript에서 한 번에 계산하여 반환한다.

`page.tsx`에서 개별 함수(`getStats`, `getCoursesByCategory` 등)를 따로 호출하지 말 것.
모든 메트릭은 `getAllDashboardData` 단일 호출로 처리한다.
(예외: `getCollegeSummary`, `getCourses`(페이지네이션 테이블), `getTopDeptsByCollege`는 별도 호출)

## ⚠️ React Rules of Hooks (절대 준수)
- 훅(`useState`, `useEffect`, `useCountUp` 등)은 **컴포넌트 최상단**에서 항상 호출해야 한다.
- `if (...) { return ... }` 조건부 early return **이후**에 훅을 호출하면 런타임 에러 발생.
- 데이터가 null일 때는 훅에 `0` 또는 기본값을 전달하고, early return은 훅 호출 이후에 배치할 것.

## Supabase 테이블 및 보안 정책 규칙
테이블 생성/액세스 시 항상 적용:
```sql
GRANT SELECT ON TABLE 테이블명 TO anon, authenticated;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 읽기 허용" ON courses FOR SELECT TO anon, authenticated USING (true);
```

## 공통 규칙
- 모듈화·재사용 컴포넌트 우선, 타입 안정성 확보
- 한국어 UI
- 작업 전 현재 디렉토리/파일 구조를 먼저 확인하고 진행
- **각 Phase 완료 시 "✅ Phase N 완료" + 변경 파일 목록 보고, 내 확인 전까지 다음 단계 진행 금지**

## INU 브랜드 컬러 (고정 — 임의 변경 금지)
| 변수 | HEX | 용도 |
|---|---|---|
| INU Blue | `#003087` | 헤더, 사이드바, 주요 강조, 차트 기본색 |
| INU Blue 진하게 | `#00256b` | 푸터, 어두운 배경 |
| INU Blue 연하게 | `#e8eef7` | 선택 항목 배경 |
| INU Yellow | `#ffa600` | AI 버튼, 차트 하이라이트, 강조 포인트 |

## Gemini AI 모델 (고정)
- 코드에서 사용하는 모델 ID: `gemini-3.1-flash-lite`
- UI 및 보고서 헤더에 표시하는 이름: `Gemini 3.1 Flash-Lite`
- 변경하지 말 것

## 대학 사이드바 순서 (고정 — 반드시 이 순서 준수)
1. 대학전체
2. 기초교육원
3. 인문대학
4. 자연과학대학
5. 사회과학대학
6. 글로벌경영대학
7. 공과대학
8. 정보기술대학
9. 경영대학
10. 예술체육대학
11. 사범대학
12. 도시과학대학
13. 생명과학기술대학
14. 융합자유전공대학
15. 동북아국제통상물류학부
16. 법학부

## 현재 컴포넌트 목록 (기존 파일 수정 시 참고)
```
components/
  AIAnalysisModal.tsx     — Gemini AI 분석 모달 (다운로드 포함)
  CategoryCharts.tsx      — 이수구분별 차트 (클릭 필터 연동)
  CollegeSummaryTable.tsx — 대학별 요약 테이블
  CollegeTopDepts.tsx     — 단과대 선택 시 상위 학과 테이블
  CourseTable.tsx         — 상세 강좌 테이블 (검색, 페이지네이션)
  DistributionCharts.tsx  — 수업방법·학점 도넛 차트
  EnrollmentAlerts.tsx    — 수강률 이상 강좌 알림 (정원초과/저조)
  Footer.tsx
  Header.tsx              — 브레드크럼 + AI 버튼
  Sidebar.tsx             — 대학/학과 네비게이션
  StatsCards.tsx          — 통계 카드 4개 (카운트업 애니메이션)
  TimeCharts.tsx          — 요일·시간대 차트 (클릭 필터 연동)
  TimetableGrid.tsx       — 주간 시간표 히트맵
hooks/
  useCountUp.ts           — 숫자 카운트업 애니메이션 (easeOutQuart)
```

## Course 타입 실제 컬럼 구조 (types/index.ts 기준)
CSV 임포트 시 컬럼명이 한글+괄호 형태로 그대로 저장된다. 아래가 실제 필드명이다:
```ts
"순번", "학기", "대학(원)", "학과(부)", "학년", "이수구분", "이수영역",
"학수번호", "교과목명", "교과목명(영문)", "담당교수", "소속", "강의실",
"시간표(교시)", "시간표(시간)", "교시유형", "학점", "시수", "이론", "실습",
"정원", "수강", "수강(남)", "수강(여)", "재수강", "수업구분", "수업유형",
"집중이수제", "성적평가", "원어강의", "원어강의구분", "원어강사료지급",
"캡스톤디자인", "수강대상", "수업방법", "비고"
```

## 데이터 검증 기준
- CSV 임포트 후 총 행 수: **2,313개** (일부 에러 행 제외된 결과)

## Footer 필수 요소 (고정)
- 이름: 김종경
- 인천대학교 홈페이지: https://www.inu.ac.kr
- INU 포털: https://portal.inu.ac.kr
- 이러닝: https://cyber.inu.ac.kr

---

# ════════════════════════════════════════
# PHASE 프롬프트 (한 번에 하나씩 순서대로 입력)
# ════════════════════════════════════════

---

## ▶ PHASE 0 프롬프트

```
Phase 0: 패키지 설치 및 환경 설정

현재 디렉토리 구조와 package.json을 먼저 확인하고 아래 작업을 순서대로 진행해라.

1. 다음 패키지를 설치하라:
   - recharts @types/recharts
   - @google/generative-ai
   - lucide-react
   - clsx tailwind-merge class-variance-authority

2. shadcn/ui 초기화 및 컴포넌트 설치:
   npx shadcn@latest init
   npx shadcn@latest add button card table badge skeleton dialog breadcrumb scroll-area separator tooltip input

3. .env.local 파일 확인. 없으면 생성하고 안내:
   NEXT_PUBLIC_SUPABASE_URL=여기에_입력
   NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_입력
   GEMINI_API_KEY=여기에_입력

4. lib/utils.ts에 shadcn 표준 cn() 유틸리티 생성 (없는 경우).

완료 후 "✅ Phase 0 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 1 프롬프트

```
Phase 1: Supabase 테이블 생성 & 데이터 검증

중요: PostgREST는 괄호가 포함된 컬럼명을 필터에 사용할 수 없다.
항상 select('*')로 전체 조회 후 JS에서 필터링할 것.

1. Supabase SQL Editor에서 아래 SQL을 실행하라:

CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY
);
GRANT SELECT ON TABLE courses TO anon, authenticated;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 읽기 허용" ON courses FOR SELECT TO anon, authenticated USING (true);

2. Supabase Dashboard → Table Editor에서 CSV(종합강의시간표_1학기_전체.csv) 임포트 후
   행 수가 2,313개인지 확인하라.

3. 임포트 후 SELECT * FROM courses LIMIT 1 로 실제 컬럼명을 확인하라.
   컬럼명은 한글+괄호 형태(예: 대학(원), 학과(부), 시간표(교시))로 저장될 수 있다.

4. types/index.ts에 실제 컬럼명 기준으로 Course 인터페이스를 정의하라.
   AGENTS.md의 "Course 타입 실제 컬럼 구조" 섹션을 참고하라.

5. lib/supabase/client.ts (브라우저용), lib/supabase/server.ts (서버용) 생성.

완료 후 "✅ Phase 1 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 2 프롬프트

```
Phase 2: 전체 레이아웃 & 사이드바 & Context API

1. contexts/DashboardContext.tsx
   - selectedCollege: string | null
   - selectedDepartment: string | null
   - setter: setSelectedCollege (college 변경 시 department 자동 초기화), setSelectedDepartment

2. components/Sidebar.tsx
   - AGENTS.md 대학 순서 엄수 (16개 항목)
   - DB 컬럼값과 표시명이 다른 대학들은 AGENTS.md의 "DB 실제 컬럼값 매핑" 표를 참고하라:
     교양→기초교육원, 글로벌정경대학→글로벌경영대학,
     단과대구분없음→동북아국제통상물류학부, 단과대구분없음(법학)→법학부
   - Supabase에서 select('*')로 전체 조회 후 JS에서 대학/학과 목록 추출 (PostgREST 제약 참고)
   - 소속 학과 처음부터 모두 펼쳐진 상태 (요구사항)
   - 선택 시 DashboardContext 업데이트, INU Blue 하이라이트

3. components/Header.tsx
   - 상단 유틸리티바: INU Blue 배경, PORTAL·HOMEPAGE 링크
   - 메인바: 제목, Breadcrumb (전체 > 대학 > 학과, 각 단계 클릭 시 해당 레벨로 이동)
   - 우측: "AI 강의 분석" 버튼 (INU Yellow, hover 시 위로 살짝 뜨는 애니메이션)

4. components/Footer.tsx
   - 배경: #00256b, 이름: 김종경
   - 링크: 인천대학교 홈페이지 / INU 포털 / 이러닝

5. app/(dashboard)/layout.tsx — DashboardProvider, 사이드바+메인 레이아웃, Header, Footer
6. app/layout.tsx — lang="ko"

완료 후 "✅ Phase 2 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 3 프롬프트

```
Phase 3: 데이터 레이어 + 통계 카드 + 이수구분 차트

중요: 모든 메트릭을 단일 fetch로 처리하는 getAllDashboardData 함수를 만든다.
개별 함수(getStats 등)를 page.tsx에서 따로 호출하지 말 것.

1. lib/data.ts ('use server') 작성:

   [핵심 구조]
   - fetchAllCourses(): 1,000개씩 페이지네이션하여 전체 조회 (select('*') 사용)
   - fetchFilteredCourses(college?, department?): fetchAllCourses 후 JS에서 필터
     (AGENTS.md DB 매핑 참고: 교양→기초교육원 등)
   - getAllDashboardData(college?, department?): fetchFilteredCourses 1회 호출 후
     아래 모든 결과를 한 번에 계산하여 반환:
     { stats, categoryCounts, categoryAvgEnrollments, teachingMethods,
       creditDistribution, coursesByDay, coursesByTime, timetableGrid, enrollmentAlerts }
   - getCollegeSummary(): 대학별 요약 (전체 데이터 기준, AGENTS.md 순서)
   - getCourses(college?, department?, page, pageSize, search, category?, day?, timeRange?):
     페이지네이션 + 검색 + 다중 필터

   수강률 계산: (수강 / 정원) * 100, 정원 0 제외
   원어강의 비율: 원어강의 값이 'Y' 또는 '원어'인 행

2. hooks/useCountUp.ts 생성 (easeOutQuart, requestAnimationFrame)

3. components/StatsCards.tsx
   - useCountUp 훅 4개는 컴포넌트 최상단에서 호출 (React Rules of Hooks 엄수)
   - stats가 null이면 0 전달, early return은 훅 호출 이후에 배치
   - 4개 카드: 총 강좌수, 총 수강인원, 평균 수강률, 원어 강의 비율
   - 아이콘 배경: INU Blue (#003087), 좌측 border: 4px solid INU Blue

4. components/CategoryCharts.tsx
   - 수평 BarChart 2개 (이수구분별 강좌수, 이수구분별 평균 수강인원)
   - 최댓값 막대는 INU Yellow (#ffa600) 강조
   - activeCategory prop 받아서 클릭된 항목 하이라이트 (opacity 0.4로 비활성 처리)
   - onCategoryClick prop: onClick={(data: any) => onCategoryClick?.(data.category ?? data.payload?.category)}

5. app/(dashboard)/page.tsx
   - 'use client', DashboardContext 사용
   - getAllDashboardData 단일 호출로 모든 메트릭 로드
   - categoryFilter, dayFilter, timeFilter state 관리
   - 제목: 선택된 대학/학과에 따라 동적 변경

완료 후 "✅ Phase 3 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 4 프롬프트

```
Phase 4: 수업방법·학점 도넛 차트 + 요일·시간 바 차트

(getAllDashboardData가 이미 teachingMethods, creditDistribution,
coursesByDay, coursesByTime를 반환하므로 별도 data.ts 함수 추가 불필요)

1. components/DistributionCharts.tsx
   - 도넛 PieChart 2개 (수업방법 유형 분포, 학점 구성 비율)
   - 범례 우측 배치, 비율 % 표시
   - Tooltip: contentStyle 배경 #1e293b, itemStyle color #f1f5f9로 가독성 확보
   - formatter: (value, _, entry) => [값, entry.name] 형태로 항목명 표시

2. components/TimeCharts.tsx
   - 수평 BarChart 2개 (요일별 강좌수, 시간대별 강좌수)
   - 최댓값 막대 INU Yellow 강조
   - activeDay, activeTime prop: 클릭된 항목 하이라이트, 나머지 opacity 0.4
   - onDayClick: onClick={(data: any) => onDayClick?.(data.day ?? data.payload?.day)}
   - onTimeClick: onClick={(data: any) => onTimeClick?.(data.timeRange ?? data.payload?.timeRange)}

3. page.tsx에 DistributionCharts, TimeCharts 추가
   - dayFilter, timeFilter 연결
   - 필터 칩: INU Blue (#003087) 배경, ✕ 버튼, "전체 해제" 링크

완료 후 "✅ Phase 4 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 5 프롬프트

```
Phase 5: 대학별 요약 테이블 + 상세 강좌 테이블 + 추가 컴포넌트

1. components/CollegeSummaryTable.tsx
   - 컬럼: 대학명 | 강좌 수 | 수강인원 합계 | 평균 수강률(%)
   - 헤더: INU Blue 배경, 흰색 텍스트
   - 수강률 기준 Badge 색상: ≥90% green, 75-89% blue, 50-74% amber, <50% red

2. components/CourseTable.tsx
   - 컬럼: 대학 | 학과 | 교과목명 | 이수구분 | 학점 | 담당교수 | 요일/시간 | 수강/정원 | 수강률
   - 수업방법 컬럼은 포함하지 말 것 (거의 미지정이라 제외됨)
   - 10개씩 페이지네이션, 교과목명/교수/학수번호 검색 (debounce 300ms)
   - loading && hasLoadedOnce 시 opacity-50으로 stale 데이터 유지 (스켈레톤 재표시 금지)

3. components/CollegeTopDepts.tsx
   - 단과대 선택 시 (학과 미선택) 표시: "[대학명] 강좌 수 상위 학과"
   - 컬럼: 순위 | 학과(부) | 강좌 수 | 수강인원 합계 | 평균 수강률(%)
   - 헤더 INU Blue, getTopDeptsByCollege(college, 10) 호출

4. components/TimetableGrid.tsx
   - 월~금 × 9시~20시 히트맵 (INU Blue 계열 강도)
   - 각 셀: 강좌 수 숫자 표시, hover 시 툴팁
   - 우상단 범례
   - hasLoadedOnce 패턴으로 백그라운드 로딩

5. components/EnrollmentAlerts.tsx
   - 정원 초과(>100%) / 수강 저조(<50%) 탭 구성
   - 전체 목록 스크롤 (limit 없음, maxHeight: 420px)
   - 탭 버튼에 전체 개수 뱃지
   - hasLoadedOnce 패턴으로 백그라운드 로딩

6. page.tsx 배치 순서:
   StatsCards → CategoryCharts → DistributionCharts → TimeCharts
   → [히트맵 + 수강률 알림 lg:grid-cols-2]
   → CollegeTopDepts (단과대 선택 시만)
   → CollegeSummaryTable → CourseTable

완료 후 "✅ Phase 5 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 6 프롬프트

```
Phase 6: AI 강의 분석 기능 (Gemini API)

1. app/api/ai-analysis/route.ts
   - POST { college, department } 수신
   - getStats, getCoursesByCategory, getTeachingMethods, getCreditDistribution,
     getCoursesByDay 호출하여 통계 데이터 수집
   - 모델: gemini-3.1-flash-lite (UI 표시명도 "Gemini 3.1 Flash-Lite")
   - 보고서 형식: 데이터 요약 / 주요 특징 및 트렌드 분석 / 문제점 및 개선 제언
   - 보고서 상단 헤더:
     === AI 강의 데이터 분석 보고서 ===
     분석 대상: [대상명]
     일자: [현재 날짜]
     작성 모델: Gemini 3.1 Flash-Lite
   - 응답: { analysis: string }
   - 에러 처리: API 키 없음, 429 quota 초과 (재시도 안내)

2. components/AIAnalysisModal.tsx
   - shadcn Dialog (max-w-5xl)
   - 로딩: 스피너 + "Gemini 3.1 Flash-Lite 모델이 데이터를 분석 중입니다..."
   - 결과: 마크다운 커스텀 렌더링 (h1~h3, 굵게, 목록, 구분선)
   - 다운로드: .md 파일 (파일명: AI_분석_[대상명]_2026-1학기.md)
   - 모달 열릴 때 자동으로 API 호출 시작

3. Header.tsx의 AI 버튼에 모달 연결, DashboardContext의 선택 대학/학과 전달

완료 후 "✅ Phase 6 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 7 프롬프트

```
Phase 7: UI 마감 & Vercel 배포

1. 전체 점검:
   - 페이지 제목 동적 변경 확인 (전체/대학/학과)
   - 브레드크럼 클릭 동작 확인 (전체 클릭 → 초기화, 대학 클릭 → 학과만 해제)
   - 모든 차트 툴팁 동작 확인
   - 차트 클릭 → 테이블 필터 연동 확인
   - Footer 이름(김종경), 링크 3개 확인
   - 사이드바 소속 학과 모두 펼쳐진 상태 확인

2. npx tsc --noEmit 실행, 에러 수정

3. Vercel 배포:
   - GitHub 저장소 연동
   - 환경변수 3개 설정: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY
   - 배포 후 URL 확인

완료 후 "✅ Phase 7 완료" + Vercel URL을 보고하라.
```

---

## 참고 파일
- `대시보드01~08.png` — 예시 UI (이 디자인과 유사하게 제작)
- `인천대학교대학순서.png` — 사이드바 대학 순서 (위 고정 규칙에 이미 반영됨)
- `AI 강의 데이터 종합 분석 예시.md` — AI 분석 결과 형식 참고
