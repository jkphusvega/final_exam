# 프롬프트 문서
## 인천대학교 2026-1학기 전체 교과목 대시보드

> **제출자:** 김종경  
> **학번:** 202402788  
> **제출일:** 2026년 6월 11일  
> **AI 도구:** Claude Sonnet 4.6 (Antigravity / Claude Code)

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | 인천대학교 2026-1학기 전체 교과목 대시보드 |
| 데이터 | 종합강의시간표_1학기_전체.csv (2,313개 강좌) |
| GitHub | https://github.com/jkphusvega/final_exam |
| 배포 | Vercel |

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 데이터베이스 | Supabase (PostgreSQL) |
| UI | Tailwind CSS + shadcn/ui |
| 차트 | Recharts |
| AI 분석 | Google Gemini API (`@google/generative-ai`) |
| 상태관리 | React Context API |
| 배포 | Vercel |

---

## Phase 0 — 패키지 설치 및 환경 설정

```
Phase 0: 패키지 설치 및 환경 설정

현재 디렉토리 구조와 package.json을 먼저 확인하고, 아래 작업을 순서대로 진행해라.

1. 다음 패키지를 설치하라:
   - recharts @types/recharts
   - @google/generative-ai
   - lucide-react
   - clsx tailwind-merge
   - class-variance-authority

2. shadcn/ui를 초기화하고 아래 컴포넌트를 설치하라:
   npx shadcn@latest init (설정: TypeScript, tailwind, app router, src 없음)
   npx shadcn@latest add button card table badge skeleton dialog breadcrumb scroll-area separator tooltip

3. .env.local 파일이 있는지 확인하라. 없으면 아래 내용으로 생성하라:
   NEXT_PUBLIC_SUPABASE_URL=여기에_입력
   NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_입력
   GEMINI_API_KEY=여기에_입력

4. lib/utils.ts 파일이 없으면 shadcn 표준 cn 유틸리티로 생성하라.

완료 후 "✅ Phase 0 완료" + 변경 파일 목록을 보고하라.
```

---

## Phase 1 — Supabase 테이블 생성 & 데이터 검증

```
Phase 1: Supabase 테이블 생성 & 데이터 검증

아래 SQL DDL을 Supabase SQL Editor에 실행할 수 있도록 제공하라.

CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  대학 TEXT, 학부학과 TEXT, 이수구분 TEXT, 교과목코드 TEXT,
  교과목명 TEXT, 분반 TEXT, 학점 INTEGER, 담당교수 TEXT,
  수업방법 TEXT, 요일 TEXT, 시작시간 TEXT, 종료시간 TEXT,
  강의실 TEXT, 수강정원 INTEGER, 수강인원 INTEGER, 원어강의 TEXT
);
GRANT SELECT ON TABLE courses TO anon, authenticated;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 읽기 허용" ON courses FOR SELECT TO anon, authenticated USING (true);

CSV 임포트 후 총 행 수가 2,313개인지 확인할 것.
types/index.ts 생성 후 Course 타입 정의.
완료 후 "✅ Phase 1 완료" + 변경 파일 목록을 보고하라.
```

---

## Phase 2 — 레이아웃 & 사이드바 & Context API

```
Phase 2: 전체 레이아웃 & 사이드바 & Context API

1. Context API 생성: contexts/DashboardContext.tsx
   - 선택된 대학(selectedCollege), 선택된 학과(selectedDepartment) 및 setter 포함

2. 사이드바: components/Sidebar.tsx
   - 대학 순서 준수: 대학전체, 기초교육원, 인문대학, 자연과학대학, 사회과학대학,
     글로벌경영대학, 공과대학, 정보기술대학, 경영대학, 예술체육대학, 사범대학,
     도시과학대학, 생명과학기술대학, 융합자유전공대학, 동북아국제통상물류학부, 법학부
   - Supabase에서 각 대학의 학과 목록 가져와 표시
   - 소속 학과 모두 펼쳐진 상태로 구성 (요구사항)

3. 헤더: components/Header.tsx
   - 브레드크럼: 전체 > 선택된 대학 > 선택된 학과
   - 우측: "AI 강의 분석" 버튼 (INU Yellow)

4. 푸터: components/Footer.tsx
   - "Designed & Developed by 김종경"
   - 링크: 인천대학교 홈페이지, INU 포털, 이러닝

5. 대시보드 레이아웃: app/(dashboard)/layout.tsx

완료 후 "✅ Phase 2 완료" + 변경 파일 목록을 보고하라.
```

---

## Phase 3 — 통계 카드 + 이수구분 차트

```
Phase 3: 메인 통계 카드 + 이수구분 차트

1. lib/data.ts 서버 액션 작성:
   - getStats(college?, department?) → 총 강좌수, 수강인원, 수강률, 원어강의 비율
   - getCoursesByCategory() → 이수구분별 강좌수
   - getAvgEnrollmentByCategory() → 이수구분별 평균 수강인원

2. StatsCards.tsx — 4개 카드 (총 강좌수, 총 수강인원, 평균 수강률, 원어 강의 비율)
   - shadcn Card, 큰 숫자 폰트, lucide 아이콘

3. CategoryCharts.tsx — 수평 BarChart 2개 (Recharts, 툴팁 필수)

4. page.tsx에 배치

완료 후 "✅ Phase 3 완료" + 변경 파일 목록을 보고하라.
```

---

## Phase 4 — 수업방법·학점 도넛 차트 + 요일·시간 바 차트

```
Phase 4: 수업방법·학점 도넛 차트 + 요일·시간 바 차트

1. lib/data.ts 추가:
   - getTeachingMethods() — 수업방법별 강좌수
   - getCreditDistribution() — 학점별 강좌수
   - getCoursesByDay() — 요일별 강좌수 (월~토)
   - getCoursesByTime() — 시간대별 강좌수 (6개 구간)

2. DistributionCharts.tsx — PieChart 도넛형 2개 (수업방법, 학점), 우측 범례 포함
3. TimeCharts.tsx — 수평 BarChart 2개 (요일, 시간대), 툴팁 필수

완료 후 "✅ Phase 4 완료" + 변경 파일 목록을 보고하라.
```

---

## Phase 5 — 대학별 요약 테이블 + 상세 강좌 테이블

```
Phase 5: 대학별 분석 요약 테이블 + 상세 강좌 정보 테이블

1. getCollegeSummary() — 대학별 강좌수, 수강인원, 평균 수강률 (AGENTS.md 순서 정렬)
2. getCourses(college?, department?, page, pageSize, search) — 페이지네이션 + 검색

3. CollegeSummaryTable.tsx
   - 컬럼: 대학명, 강좌 수, 수강인원 합계, 평균 수강률
   - 수강률 기준 Badge 색상 강조

4. CourseTable.tsx
   - 10개씩 페이지네이션, 교과목명 검색 (debounce 300ms)
   - 컬럼: 대학, 학과, 교과목명, 이수구분, 학점, 담당교수, 요일/시간, 수강/정원, 수강률

완료 후 "✅ Phase 5 완료" + 변경 파일 목록을 보고하라.
```

---

## Phase 6 — AI 강의 분석 (Gemini API)

```
Phase 6: AI 강의 분석 기능 (Gemini API)

1. app/api/ai-analysis/route.ts
   - POST { college, department } 수신
   - Supabase에서 해당 범위 통계 데이터 수집
   - GEMINI_API_KEY로 gemini-2.0-flash-lite 모델 호출
   - 프롬프트: 데이터 요약 / 주요 트렌드 / 문제점 및 개선 제언 형식
   - 응답: { analysis: string } 반환

2. AIAnalysisModal.tsx
   - shadcn Dialog, 로딩 스피너
   - 결과 마크다운 렌더링
   - "분석 결과 다운로드" → .md 파일 저장
   - 파일명: AI_분석_[대학/학과명]_2026-1학기.md

3. Header.tsx의 "AI 강의 분석" 버튼에 모달 연결

완료 후 "✅ Phase 6 완료" + 변경 파일 목록을 보고하라.
```

---

## Phase 7 — UI 마감 & Vercel 배포

```
Phase 7: UI 마감 & Vercel 배포

1. 동적 페이지 제목 확인 (전체/대학/학과에 따라 변경)
2. 브레드크럼 클릭 동작 확인
3. 모든 차트 툴팁 동작 확인
4. Footer 링크 3개, 이름 확인
5. Skeleton 로딩 처리 확인
6. npx tsc --noEmit 에러 수정
7. Vercel 환경변수 3개 설정 안내 및 배포

완료 후 "✅ Phase 7 완료" + Vercel URL 보고하라.
```

---

## Phase 8 — 숫자 카운트업 애니메이션 + INU 브랜드 컬러

```
Phase 8: 숫자 카운트업 애니메이션 + INU 공식 브랜드 컬러 적용

1. hooks/useCountUp.ts 생성
   - requestAnimationFrame + easeOutQuart 이징
   - target 값이 바뀔 때 애니메이션 트리거

2. StatsCards.tsx에 useCountUp 적용 (훅은 반드시 컴포넌트 최상단에서 호출)

3. INU 공식 컬러 CSS 변수 추가 (globals.css):
   --inu-blue: #003087
   --inu-yellow: #ffa600
   --inu-blue-50: #e8eef7 등

4. 전체 컴포넌트에 INU 컬러 일괄 적용:
   - Header: INU Blue 배경, INU Yellow AI 버튼
   - Sidebar: 선택 항목 INU Blue 하이라이트
   - 차트: INU Blue 기본, INU Yellow 강조
   - Footer: 진한 INU Blue 배경

완료 후 "✅ Phase 8 완료" + 변경 파일 목록을 보고하라.
```

---

## 추가 기능 및 버그 수정 프롬프트

### 사이드바 DB 매핑 버그 수정

```
/api/debug-colleges 엔드포인트 결과를 확인하니 DB의 대학(원) 컬럼에
'동북아국제통상물류학부'와 '법학부' 값이 없었다.
실제 DB 값은 다음과 같음:
  - '단과대구분없음' → 동북아국제통상물류학부 (58개)
  - '단과대구분없음(법학)' → 법학부 (30개)

Sidebar.tsx의 DB_TO_DISPLAY_COLLEGE와 data.ts의 DISPLAY_TO_DB_COLLEGES,
DB_TO_DISPLAY 매핑을 실제 DB 값에 맞게 수정하라.
```

### React Rules of Hooks 에러 수정

```
StatsCards.tsx에서 "Expected static flag was missing" 에러 발생.
원인: if (loading || !stats) { return ... } 조건부 early return 이후에
useCountUp 훅 4개를 호출하고 있어 Rules of Hooks 위반.
훅 4개를 컴포넌트 최상단으로 이동하고, stats가 null일 때는 0을 전달하도록 수정하라.
```

### 차트 클릭 → 테이블 필터 연동

```
이수구분 바 차트, 요일 바 차트, 시간대 바 차트를 클릭하면
하단 상세 강좌 테이블이 해당 조건으로 자동 필터링되도록 구현하라.

- CategoryCharts.tsx: onCategoryClick prop 추가, Bar에 cursor="pointer" 및 onClick 핸들러
- TimeCharts.tsx: onDayClick, onTimeClick prop 추가
- data.ts getCourses(): category, day, timeRange 필터 파라미터 추가
- page.tsx: categoryFilter, dayFilter, timeFilter state 관리
- 테이블 위 필터 칩(badge) 표시, X 버튼으로 해제, "전체 해제" 링크
- 차트 클릭 시 테이블 섹션으로 자동 스크롤
- 대학/학과 변경 시 모든 필터 초기화

Recharts v3에서 Bar onClick의 data는 data.payload에 있을 수 있으므로
data.category ?? data.payload?.category 형태로 폴백 처리할 것.
```

### 주간 시간표 히트맵

```
월~금 × 9시~20시 격자로 강의 밀도를 시각화하는 히트맵을 구현하라.

1. lib/data.ts에 getTimetableGrid(college?, department?) 추가
   - 시간표(시간) 컬럼 파싱: [강의실:요일(HH:MM-HH:MM)] 형식
   - { hour, 월, 화, 수, 목, 금 } 배열 반환

2. TimetableGrid.tsx 컴포넌트
   - INU Blue 계열 강도로 셀 색상 (연한 파랑 → 진한 남색)
   - 셀에 강좌 수 숫자 표시
   - 마우스 오버 시 "화요일 15:00 — 739개 강좌" 툴팁
   - 우상단 범례 (강좌 적음 → 많음)
   - 대학/학과 변경 시 자동 갱신, 백그라운드 로딩 (hasLoadedOnce 패턴)
```

### 수강률 이상 강좌 알림

```
주간 시간표 히트맵과 좌우 반반(lg:grid-cols-2)으로 나란히 배치할
EnrollmentAlerts 컴포넌트를 구현하라.

- "정원 초과" 탭: 수강률 > 100% 강좌, 높은 순 정렬, 빨간색
- "수강 저조" 탭: 수강률 < 50% 강좌, 낮은 순 정렬, 주황색
- 탭 버튼에 전체 개수 뱃지 표시
- limit 없이 전체 목록 스크롤로 조회 가능 (maxHeight: 420px)
- 하단 "전체 N개 강좌" 표시
- 백그라운드 로딩 (hasLoadedOnce 패턴)
- getTimetableGrid와 Promise.all로 동시 로드
```

### 단과대별 강좌 수 상위 학과 표

```
사이드바에서 단과대를 선택했을 때 (학과 미선택 상태),
해당 단과대의 강좌 수 상위 학과 목록을 표로 표시하라.

- getTopDeptsByCollege(college, topN=10) 함수 추가
- CollegeTopDepts.tsx 컴포넌트
  - 제목: "[대학명] 강좌 수 상위 학과"
  - 컬럼: 순위, 학과(부), 강좌 수, 수강인원 합계, 평균 수강률(%)
  - 헤더 INU Blue, 평균 수강률 bold 표시
- CollegeSummaryTable 위에 배치
- 전체 선택 또는 학과 선택 시 미노출
```

### 브레드크럼 클릭 연동

```
Header.tsx의 브레드크럼 링크를 실제로 동작하도록 수정하라.
- "전체" 클릭 → setSelectedCollege(null), setSelectedDepartment(null)
- 단과대명 클릭 (학과 선택 상태) → setSelectedDepartment(null)만 실행
- 현재 마지막 단계는 BreadcrumbPage로 클릭 불가 처리 (UX 표준)
```

---

## 구현 결과 요약

### 필수 기능 (기본 점수)

| 요구사항 | 구현 여부 |
|---|---|
| CSV → Supabase 연동 (2,313개) | ✅ |
| 사이드바 대학 순서 (인천대학교대학순서.png 기준) | ✅ |
| 사이드바 소속 학과 모두 펼쳐진 상태 | ✅ |
| 총 강좌수 · 수강인원 · 수강률 · 원어강의 비율 카드 | ✅ |
| 이수구분별 강좌수 · 평균 수강인원 차트 | ✅ |
| 수업방법 유형 분포 · 학점 구성 비율 차트 | ✅ |
| 요일별 · 시간별 강좌 수 차트 | ✅ |
| 대학(원)별 강좌 분석 요약 | ✅ |
| 상세 강좌 정보 (검색 · 페이지네이션) | ✅ |
| 인터랙티브 그래프 (마우스 오버 툴팁) | ✅ |
| AI 강의 분석 (Gemini API) | ✅ |
| 대학/학과 선택 후 AI 분석 연동 | ✅ |
| 분석 결과 .md 다운로드 | ✅ |
| 브레드크럼 (Breadcrumb) | ✅ |
| Footer 이름 (김종경) | ✅ |
| Footer 링크 3개 | ✅ |

### 추가 기능 (창의성 점수)

| 기능 | 설명 |
|---|---|
| INU 브랜드 컬러 시스템 | 공식 CMYK 값 기반 HEX 변환 적용 |
| 숫자 카운트업 애니메이션 | easeOutQuart 이징, requestAnimationFrame |
| 차트 클릭 → 테이블 필터 연동 | 이수구분 · 요일 · 시간대 필터 칩 + 복합 필터 |
| 주간 시간표 히트맵 | 월~금 × 9시~20시 강의 밀도 시각화 |
| 수강률 이상 강좌 알림 | 정원 초과 · 수강 저조 강좌 목록 (전체 스크롤) |
| 단과대별 강좌 수 상위 학과 | 단과대 선택 시 학과 랭킹 표 자동 노출 |
| 백그라운드 로딩 | 데이터 변경 시 스켈레톤 없이 자연스러운 전환 |
| AI 강의 분석 파일명 자동 설정 | 선택된 대학/학과명 포함 .md 파일 다운로드 |
