# 인천대학교 2026-1학기 교과목 대시보드 개발 프롬프트

---

### 프로젝트 및 Supabase 세팅

Supabase에서 새 프로젝트 생성 후 API URL, Publishable Key, Anon Key, Service Role Key 복사

---

### 코드베이스 구성

터미널에서 실행:

> npx create-next-app@latest .

---

### Supabase 연결 패키지 설치

> npm install @supabase/supabase-js @supabase/ssr

---

### 환경변수 등록

`.env.local` 파일을 만들고 아래 키를 등록:

```
NEXT_PUBLIC_SUPABASE_URL=your_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=your_SERVICE_ROLE_KEY
GEMINI_API_KEY=your_GEMINI_API_KEY
```

---

### Supabase 초기화 파일 제작

프롬프트:

> 1. 필요한 파일
> lib/supabase/server.ts : 서버 컴포넌트용 Supabase 클라이언트 (createClient)
> lib/supabase/client.ts : 클라이언트 컴포넌트용 Supabase 클라이언트 (createClient)
>
> 2. 아래 패키지가 이미 설치됨
> @supabase/supabase-js / @supabase/ssr
>
> 3. 환경변수에 Supabase 키가 추가되어 있음
> NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 등
>
> 이외 화면이나 로직은 수정하지 말고, 필요한 초기화 코드만 작성

---

### Supabase 연결 확인 및 보안 정책 반영

프롬프트:

> Supabase 연결을 확인하고 등록된 테이블 정보를 알려줘.
> courses 테이블 정보를 자세히 알려줘.

프롬프트:

> 앞으로 테이블을 생성할 때와 액세스할 때 아래 사항을 항상 적용하도록 AGENTS.md에 반영하자.
> anon과 authenticated 역할(Role)이 PostgREST API를 통해 이 테이블에 접근할 수 있도록
> 명시적인 GRANT SQL 문(SELECT 등)을 반드시 포함해 줘.
> 또한, RLS(Row Level Security)를 활성화해줘.

---

### 추가 패키지 설치

> npm install recharts @google/generative-ai lucide-react clsx tailwind-merge class-variance-authority

> npx shadcn@latest init
> npx shadcn@latest add button card table badge skeleton dialog breadcrumb scroll-area separator tooltip input

---

### CSV 데이터 임포트

Supabase Dashboard → Table Editor에서 `종합강의시간표_1학기_전체.csv` 임포트.
임포트 후 총 행 수가 2,313개인지 확인.

**주의:** Supabase PostgREST는 컬럼명에 괄호가 포함된 경우(예: 대학(원), 학과(부))
필터 쿼리를 사용할 수 없다. 반드시 `select('*')`로 전체 조회 후 JavaScript에서 필터링한다.

---

### 전체 레이아웃 및 사이드바 구성

프롬프트:

> contexts/DashboardContext.tsx를 만들어 selectedCollege, selectedDepartment 상태를 전역 관리해줘.
> college가 바뀌면 department는 자동 초기화되도록 해.
>
> components/Sidebar.tsx를 만들어줘.
> 아래 순서로 16개 대학을 고정 배치해:
> 대학전체, 기초교육원, 인문대학, 자연과학대학, 사회과학대학, 글로벌경영대학,
> 공과대학, 정보기술대학, 경영대학, 예술체육대학, 사범대학, 도시과학대학,
> 생명과학기술대학, 융합자유전공대학, 동북아국제통상물류학부, 법학부
>
> DB의 대학(원) 실제값과 표시명이 다른 대학은 아래와 같이 매핑해:
> 교양 → 기초교육원 / 글로벌정경대학 → 글로벌경영대학
> 단과대구분없음 → 동북아국제통상물류학부 / 단과대구분없음(법학) → 법학부
>
> 소속 학과는 처음부터 모두 펼쳐진 상태로 구성하고,
> 선택 항목은 INU Blue(#003087)로 하이라이트해줘.

---

### 헤더, 푸터 구성

프롬프트:

> components/Header.tsx를 만들어줘.
> 상단바: INU Blue(#003087) 배경, PORTAL·HOMEPAGE 바로가기 링크
> 메인바: 대시보드 제목, 브레드크럼(전체 > 대학 > 학과, 각 단계 클릭 시 해당 레벨로 이동)
> 우측: 'AI 강의 분석' 버튼 — INU Yellow(#ffa600), hover 시 위로 살짝 뜨는 애니메이션
>
> components/Footer.tsx를 만들어줘.
> 배경: #00256b / 이름: 김종경
> 링크: 인천대학교 홈페이지(https://www.inu.ac.kr) / INU 포털(https://portal.inu.ac.kr) / 이러닝(https://cyber.inu.ac.kr)

---

### 클라이언트 캐싱 아키텍처 구성

프롬프트:

> 앱 시작 시 Supabase에서 전체 강좌 데이터(2,313개)를 한 번만 fetch해서
> DashboardContext에 캐싱하도록 구성해줘.
>
> 방법:
> 1. count를 먼저 확인하고 (head: true)
> 2. 필요한 페이지 수만큼 Promise.all로 병렬 요청해서
> 3. allCourses: Course[], coursesLoading: boolean 을 Context에서 관리해
>
> 이후 대학/학과 선택에 따른 필터링과 모든 계산은
> lib/compute.ts에 순수 함수로 구현하고
> page.tsx에서 useMemo로 즉시 처리해서 네트워크 호출 없이 반응하도록 해.
>
> compute.ts에 구현할 함수:
> filterCourses / computeStats / computeCategoryCounts / computeCategoryAvgEnrollments /
> computeTeachingMethods / computeCreditDistribution / computeCoursesByDay /
> computeCoursesByTime / computeTimetableGrid / computeEnrollmentAlerts /
> computeCollegeSummary / computeTopDepts / filterAndPaginateCourses

---

### 메인 대시보드 구성 (1) — 통계 카드 + 이수구분 차트

프롬프트:

> components/StatsCards.tsx를 만들어줘.
> 4개 카드: 총 강좌수 / 총 수강인원 / 평균 수강률 / 원어 강의 비율
> 아이콘 배경 INU Blue, 카드 좌측 border 4px solid INU Blue
> loading 시 shadcn Skeleton 표시
>
> components/CategoryCharts.tsx를 만들어줘.
> 수평 BarChart 2개: 이수구분별 강좌수 / 이수구분별 평균 수강인원
> 최댓값 막대 INU Yellow(#ffa600) 강조, 나머지 INU Blue
> 막대를 클릭하면 하단 상세 강좌 테이블이 해당 이수구분으로 자동 필터되도록 해.
> (Recharts v3: onClick 시 data.category ?? data.payload?.category 형태로 폴백 처리)

---

### 메인 대시보드 구성 (2) — 수업방법·학점·요일·시간 차트

프롬프트:

> components/DistributionCharts.tsx를 만들어줘.
> 도넛 PieChart 2개: 수업방법 유형 분포 / 학점 구성 비율
> 범례 우측 배치, 비율 % 표시
> Tooltip: 배경 #1e293b, 텍스트 #f1f5f9, formatter에서 entry.name으로 항목명 표시
>
> components/TimeCharts.tsx를 만들어줘.
> 수평 BarChart 2개: 요일별 강좌수(월~토) / 시간대별 강좌수
> 시간대 구간: 9시 이전 / 09:00-10:59 / 11:00-12:59 / 13:00-14:59 / 15:00-16:59 / 17:00 이후
> 막대를 클릭하면 하단 테이블이 해당 요일 또는 시간대로 자동 필터되도록 해.
> 필터 칩을 테이블 위에 표시하고 ✕로 해제, '전체 해제' 링크도 추가해.

---

### 메인 대시보드 구성 (3) — 주간 시간표 히트맵

프롬프트:

> components/TimetableGrid.tsx를 만들어줘.
> 월~금 × 9시~20시 격자로 강의 밀도를 시각화하는 히트맵이야.
> 시간표(시간) 컬럼의 [강의실:요일(HH:MM-HH:MM)] 형식을 파싱해서 데이터를 만들어.
> INU Blue 계열 강도로 셀 색상: 강좌 적음은 연파랑, 많을수록 진남색
> 각 셀에 강좌 수 표시, 마우스 오버 시 '화요일 15:00 — N개 강좌' 툴팁
> 우상단에 범례(강좌 적음 → 많음) 표시

---

### 메인 대시보드 구성 (4) — 수강률 이상 강좌 알림

프롬프트:

> components/EnrollmentAlerts.tsx를 만들어줘.
> TimetableGrid와 좌우 반반(lg:grid-cols-2)으로 나란히 배치할 컴포넌트야.
>
> '정원 초과' 탭: 수강률 > 100% 강좌, 높은 순 정렬, 빨간색 테마
> '수강 저조' 탭: 수강률 < 50% 강좌, 낮은 순 정렬, 주황색 테마
> 탭 버튼에 전체 개수 뱃지 표시
> limit 없이 전체 목록을 스크롤로 조회 가능하게 해줘 (maxHeight: 420px)

---

### 메인 대시보드 구성 (5) — 대학별 요약 + 단과대 상위 학과 + 상세 강좌 테이블

프롬프트:

> components/CollegeSummaryTable.tsx를 만들어줘.
> 컬럼: 대학명 / 강좌 수 / 수강인원 합계 / 평균 수강률(%)
> 헤더 INU Blue 배경 / 수강률 기준 Badge 색상 강조(≥90% 초록, 75~89% 파랑, <50% 빨강)
>
> components/CollegeTopDepts.tsx를 만들어줘.
> 단과대를 선택했을 때만 CollegeSummaryTable 위에 노출되는 표야.
> '[대학명] 강좌 수 상위 학과' 제목, 컬럼: 순위 / 학과(부) / 강좌 수 / 수강인원 합계 / 평균 수강률(%)
>
> components/CourseTable.tsx를 만들어줘.
> 컬럼: 대학 / 학과 / 교과목명 / 이수구분 / 학점 / 담당교수 / 요일·시간 / 수강/정원 / 수강률
> 수업방법 컬럼은 포함하지 말 것 (거의 미지정이라 제외)
> 10개씩 페이지네이션, 교과목명·교수·학수번호 검색 (debounce 300ms)
> 모든 필터링·검색·페이지네이션은 서버 호출 없이 클라이언트에서 처리해.
> 데이터 변경 시 스켈레톤 재표시 금지 — opacity-50으로 기존 데이터 유지

---

### AI 강의 분석 구성

프롬프트:

> app/api/ai-analysis/route.ts를 만들어줘.
> POST { college, department }를 받아서 해당 범위의 통계 데이터를 Supabase에서 수집하고
> Gemini API(모델: gemini-3.1-flash-lite)로 분석 보고서를 생성해.
>
> 보고서 형식:
> === AI 강의 데이터 분석 보고서 ===
> 분석 대상 / 일자 / 작성 모델: Gemini 3.1 Flash-Lite
> ## 1. 데이터 요약
> ## 2. 주요 특징 및 트렌드 분석
>   ### 1) 이수구분 및 학점 구성 특성
>   ### 2) 수업방법 비중 및 시사점
>   ### 3) 요일 및 시간대별 강좌 배치 현황
> ## 3. 문제점 및 개선 아이디어 제언
>
> 에러 처리: API 키 없음 / 429 quota 초과 시 재시도 안내

프롬프트:

> components/AIAnalysisModal.tsx를 만들어줘.
> shadcn Dialog (max-w-5xl), 모달이 열리면 자동으로 API 호출 시작.
> 로딩 시 스피너 + 'Gemini 3.1 Flash-Lite 모델이 분석 중입니다...' 표시.
> 결과는 마크다운 커스텀 렌더링(h1~h3, 볼드, 목록, 구분선).
> 하단에 '분석 결과 다운로드' 버튼 — AI_분석_[대상명]_2026-1학기.md 파일로 저장.
> Header.tsx의 'AI 강의 분석' 버튼에 연결하고 DashboardContext의 선택 대학/학과를 전달해.

---

### INU 브랜드 컬러 적용

프롬프트:

> 인천대학교 공식 CMYK 값 기반으로 변환한 HEX 컬러를 전체 컴포넌트에 적용해줘.
> INU Blue #003087 — 헤더, 사이드바, 차트 기본색, 테이블 헤더
> INU Blue 진하게 #00256b — 푸터, 어두운 배경
> INU Blue 연하게 #e8eef7 — 선택 항목 배경
> INU Yellow #ffa600 — AI 버튼, 차트 최대값 하이라이트
>
> npx tsc --noEmit 실행해서 TypeScript 에러 없는지 확인해줘.

---

### Vercel 배포

GitHub 저장소 생성 후 push. Vercel 대시보드에서 아래 환경변수 3개 설정:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GEMINI_API_KEY
```

Deploy 클릭 후 배포 URL 확인.

---

## 구현 결과

### 기본 기능 체크리스트

| 요구사항 | 결과 |
|---|---|
| CSV → Supabase 연동 (2,313개 행) | ✅ |
| 사이드바 대학 순서 (인천대학교대학순서.png 기준) | ✅ |
| 사이드바 소속 학과 모두 펼쳐진 상태 | ✅ |
| 통계 카드 4개 (강좌수·수강인원·수강률·원어강의 비율) | ✅ |
| 이수구분별 강좌수·평균 수강인원 차트 | ✅ |
| 수업방법 유형 분포·학점 구성 비율 차트 | ✅ |
| 요일별·시간별 강좌 수 차트 | ✅ |
| 대학(원)별 강좌 분석 요약 테이블 | ✅ |
| 상세 강좌 정보 테이블 (검색·페이지네이션) | ✅ |
| 인터랙티브 그래프 (마우스 오버 툴팁) | ✅ |
| AI 강의 분석 (Gemini 3.1 Flash-Lite) | ✅ |
| 대학/학과 선택 연동 AI 분석 | ✅ |
| 분석 결과 .md 파일 다운로드 | ✅ |
| 브레드크럼 내비게이션 | ✅ |
| Footer 이름(김종경)·링크 3개 | ✅ |

### 추가 창의 기능

추가 기능은 이 대시보드의 실제 사용 타겟을 분석한 뒤 설계하였다.

**주요 사용 타겟 및 관심사**

| 우선순위 | 타겟 | 주요 관심사 |
|---|---|---|
| 1순위 | 교무처 · 학사지원팀 | 시간표 편성, 강의실 배정, 요일·시간 분산, 수강률 이상 강좌 파악 |
| 2순위 | 학과장 · 대학장 | 학과별 운영 현황, 수강률, 이수구분 분포 |
| 3순위 | 교수 | 내 강의가 속한 대학/학과의 전반적인 맥락 파악 |

이 분석을 바탕으로 단순 요구사항 구현을 넘어 실제 업무에서 유용하게 쓰일 기능을 추가하였다.

---

**INU 브랜드 컬러 시스템**

인천대학교 공식 브랜드 가이드의 CMYK 값을 HEX로 변환하여 전체 UI에 일관되게 적용하였다.
INU Blue(`#003087`)를 주색으로, INU Yellow(`#ffa600`)를 강조색으로 사용해
대학 공식 아이덴티티와 일치하는 디자인을 구현하였다.

---

**차트 클릭 → 테이블 필터 연동**

이수구분·요일·시간대 차트의 막대를 클릭하면 하단 상세 강좌 테이블이 해당 조건으로 즉시 필터링된다.
예를 들어 '화요일' 막대를 클릭하면 화요일 개설 강좌만 테이블에 표시되고,
이수구분·요일·시간대를 동시에 선택하는 복합 필터도 지원한다.
교무처 담당자가 특정 조건의 강좌를 빠르게 탐색할 수 있도록 설계하였다.

---

**주간 시간표 히트맵**

월~금 × 9시~20시 격자에 강의 밀도를 색상 강도로 시각화하였다.
시간표 편성 담당자가 특정 시간대에 강의가 집중되는 현상을 한눈에 파악하고,
분산 배치가 필요한 시간대를 직관적으로 식별할 수 있도록 설계하였다.
셀에 마우스를 올리면 해당 요일·시간의 정확한 강좌 수를 확인할 수 있다.

---

**수강률 이상 강좌 알림**

정원을 초과한 강좌(수강률 > 100%)와 수강률이 저조한 강좌(수강률 < 50%)를 탭으로 구분하여 전체 목록을 제공한다.
교무처와 학과장이 분반 개설이나 강좌 조정이 필요한 강좌를 즉시 파악할 수 있도록 하였다.
8개로 제한하지 않고 전체 목록을 스크롤로 조회할 수 있게 하여 실무 활용도를 높였다.

---

**단과대별 강좌 수 상위 학과**

사이드바에서 단과대를 선택하면 해당 대학 내 강좌 수 기준 상위 학과 목록이 자동으로 표시된다.
대학장과 학과장이 소속 대학의 학과별 강의 운영 현황을 드릴다운 방식으로 파악할 수 있도록 설계하였다.

---

**클라이언트 캐싱 아키텍처**

앱 시작 시 전체 데이터(2,313개)를 한 번만 fetch하고 브라우저 메모리에 캐싱한다.
이후 사이드바 선택, 검색, 차트 클릭 등 모든 인터랙션은 네트워크 호출 없이
클라이언트에서 즉시 계산하여 반응 속도를 0ms에 가깝게 구현하였다.

---

**백그라운드 로딩 전환**

데이터가 변경될 때 화면 전체를 스켈레톤으로 교체하지 않고,
기존 데이터를 반투명하게 유지하다가 새 데이터로 자연스럽게 전환한다.
사용자가 현재 보고 있는 맥락을 잃지 않도록 UX를 설계하였다.
