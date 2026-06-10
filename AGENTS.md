# AGENTS.md — 프로젝트 고정 규칙 + 단계별 작업 지시

> 이 파일은 Antigravity가 매 작업마다 자동으로 읽는 **고정 규칙**이다.
> Phase 프롬프트는 이 파일 하단에 있으며, 채팅에 **한 Phase씩 순서대로** 복사해서 입력한다.
> 각 Phase 완료 확인 후 다음 Phase를 입력한다.

---

## 프로젝트
인천대학교 2026-1학기 전체 교과목 대시보드.

## 기술 스택 (고정)
- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL) — DB/백엔드
- Tailwind CSS + shadcn/ui
- Recharts (모든 그래프는 인터랙티브 툴팁 필수)
- 상태관리: React Context API
- Gemini API (`@google/generative-ai`) — AI 강의 분석
- 배포: Vercel

## 환경변수 규칙 (중요)
- `NEXT_PUBLIC_SUPABASE_URL` — API URL에서 `/rest/v1/` 제거한 base 도메인만 사용
  예) `https://xxxx.supabase.co/rest/v1/` → `https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key 사용
- `GEMINI_API_KEY` — Google AI Studio에서 발급한 키 (서버사이드 전용, NEXT_PUBLIC_ 붙이지 말 것)
- 모든 키는 `.env.local` 에 저장, 하드코딩 금지

## Supabase 패키지
- `@supabase/supabase-js` (핵심 클라이언트)
- `@supabase/ssr` (App Router 서버사이드 세션/페칭)

## Supabase 테이블 및 보안 정책 규칙 (중요)
테이블을 생성하거나 액세스할 때 아래 사항을 항상 적용한다.

1. **명시적인 권한 부여 (GRANT SQL)**:
   ```sql
   GRANT SELECT ON TABLE 테이블명 TO anon, authenticated;
   ```

2. **행 레벨 보안 (RLS) 활성화 + 공개 읽기 정책**:
   강좌 데이터는 공개 읽기이므로 아래와 같이 설정한다.
   ```sql
   ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "공개 읽기 허용" ON courses FOR SELECT TO anon, authenticated USING (true);
   ```

## 공통 규칙
- 모듈화·재사용 컴포넌트 우선, 타입 안정성 확보
- 한국어 UI
- 데이터 페칭은 서버 컴포넌트 우선, 인터랙션 차트만 클라이언트 컴포넌트
- 작업 전 현재 디렉토리/파일 구조를 먼저 확인하고 진행
- **각 Phase 완료 시 "✅ Phase N 완료" + 변경 파일 목록 보고, 내 확인 전까지 다음 단계 진행 금지**

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

## ▶ PHASE 0 프롬프트 (복사해서 채팅에 붙여넣기)

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
   ```
   NEXT_PUBLIC_SUPABASE_URL=여기에_입력
   NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_입력
   GEMINI_API_KEY=여기에_입력
   ```
   파일 생성 후 "환경변수 3개를 .env.local에 설정해주세요" 라고 안내하라.

4. next.config.ts에 이미지 도메인 설정이 없으면 기본 설정을 유지하라.

5. lib/utils.ts 파일이 없으면 shadcn 표준 cn 유틸리티로 생성하라:
   ```ts
   import { clsx, type ClassValue } from "clsx"
   import { twMerge } from "tailwind-merge"
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```

완료 후 "✅ Phase 0 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 1 프롬프트 (복사해서 채팅에 붙여넣기)

```
Phase 1: Supabase 테이블 생성 & 데이터 검증

.env.local의 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하고 아래 작업을 진행하라.

1. 아래 SQL DDL을 Supabase SQL Editor에 실행할 수 있도록 제공하라.
   (나는 이걸 Supabase Dashboard → SQL Editor에 직접 붙여넣고 실행할 것이다)

```sql
-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  대학 TEXT,
  학부학과 TEXT,
  이수구분 TEXT,
  교과목코드 TEXT,
  교과목명 TEXT,
  분반 TEXT,
  학점 INTEGER,
  담당교수 TEXT,
  수업방법 TEXT,
  요일 TEXT,
  시작시간 TEXT,
  종료시간 TEXT,
  강의실 TEXT,
  수강정원 INTEGER,
  수강인원 INTEGER,
  원어강의 TEXT
);

-- 2. 권한 부여
GRANT SELECT ON TABLE courses TO anon, authenticated;

-- 3. RLS 활성화 + 공개 읽기 정책
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 읽기 허용" ON courses FOR SELECT TO anon, authenticated USING (true);
```

2. 위 SQL 실행 후, Supabase Dashboard → Table Editor에서 CSV 임포트 방법을 안내하라:
   - 파일명: 종합강의시간표_1학기_전체.csv
   - 임포트 후 총 행 수가 2,313개인지 확인할 것

3. CSV 임포트 완료 후, Supabase 클라이언트로 실제 컬럼명을 확인하는 코드를 작성해서
   `SELECT * FROM courses LIMIT 1` 결과를 출력하도록 임시 테스트 코드를 제공하라.
   (컬럼명이 CSV 헤더와 다를 경우 다음 단계에서 쿼리를 수정할 것임)

4. types/index.ts를 생성하고 Course 타입을 정의하라 (컬럼명은 실제 Supabase 테이블 기준으로):
   ```ts
   export interface Course {
     id: number
     대학: string
     학부학과: string
     이수구분: string
     교과목코드: string
     교과목명: string
     분반: string
     학점: number
     담당교수: string
     수업방법: string
     요일: string
     시작시간: string
     종료시간: string
     강의실: string
     수강정원: number
     수강인원: number
     원어강의: string
   }
   ```

완료 후 "✅ Phase 1 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 2 프롬프트 (복사해서 채팅에 붙여넣기)

```
Phase 2: 전체 레이아웃 & 사이드바 & Context API

현재 파일 구조를 먼저 확인하고 아래 작업을 진행하라.

1. Context API 생성: contexts/DashboardContext.tsx
   - 선택된 대학(selectedCollege: string | null)
   - 선택된 학과(selectedDepartment: string | null)
   - setter 함수 포함
   - "대학전체" 선택 시 전체 데이터 표시

2. 사이드바 컴포넌트: components/Sidebar.tsx
   - AGENTS.md에 명시된 대학 순서를 반드시 준수하라:
     대학전체, 기초교육원, 인문대학, 자연과학대학, 사회과학대학, 글로벌경영대학,
     공과대학, 정보기술대학, 경영대학, 예술체육대학, 사범대학, 도시과학대학,
     생명과학기술대학, 융합자유전공대학, 동북아국제통상물류학부, 법학부
   - Supabase에서 각 대학의 학과 목록을 가져와 사이드바에 표시
   - 모든 대학의 소속 학과가 처음부터 펼쳐진(expanded) 상태로 표시
   - 클릭 시 DashboardContext 업데이트
   - 선택된 항목 하이라이트 표시
   - scroll-area 사용, 세로 스크롤 가능

3. 헤더 컴포넌트: components/Header.tsx
   - 좌측: "Incheon National University" 로고/텍스트
   - Breadcrumb: 전체 > 선택된 대학 > 선택된 학과
   - 우측: "AI 강의 분석" 버튼 (주황/살몬 계열 색상) — Phase 6에서 기능 연결

4. 푸터 컴포넌트: components/Footer.tsx
   - "Incheon National University Course Dashboard" 텍스트
   - 링크: 인천대학교 홈페이지(https://www.inu.ac.kr) | INU 포털(https://portal.inu.ac.kr) | 이러닝(https://cyber.inu.ac.kr)
   - "Designed & Developed by 김종경"
   - "© 2026 Incheon National University"

5. 대시보드 레이아웃: app/(dashboard)/layout.tsx
   - DashboardProvider로 감싸기
   - 좌측 사이드바(고정 너비 약 240px) + 우측 메인 영역
   - Header, Footer 포함

6. app/layout.tsx 에서 한국어 lang 속성으로 변경 (lang="ko")

7. app/page.tsx 를 app/(dashboard)/page.tsx 로 이동 후 기존 기본 템플릿 내용 삭제,
   대신 "대시보드 로딩 중..." 플레이스홀더로 대체 (Phase 3에서 실제 내용 채울 것)

8. app/(dashboard)/layout.tsx가 실제 렌더링되도록 app/page.tsx에서 redirect 또는 직접 연결 처리

완료 후 "✅ Phase 2 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 3 프롬프트 (복사해서 채팅에 붙여넣기)

```
Phase 3: 메인 통계 카드 + 이수구분 차트

현재 파일 구조를 먼저 확인하고 아래 작업을 진행하라.

DashboardContext의 selectedCollege, selectedDepartment 값을 기반으로
선택된 범위의 데이터만 필터링해서 표시해야 한다 (전체/대학/학과 연동).

1. 서버 액션 또는 API 함수: lib/data.ts
   아래 데이터를 Supabase에서 가져오는 함수를 작성하라:
   - getStats(college?, department?) → { totalCourses, totalEnrollment, avgAttendanceRate, foreignLectureRate }
   - getCoursesByCategory(college?, department?) → 이수구분별 강좌수 배열
   - getAvgEnrollmentByCategory(college?, department?) → 이수구분별 평균 수강인원 배열
   
   수강률 계산: (수강인원 / 수강정원) * 100, 정원이 0인 경우 제외
   원어강의 비율: 원어강의 컬럼 값이 'Y' 또는 '원어'인 행 수 / 전체 강좌수 * 100

2. 통계 카드 컴포넌트: components/StatsCards.tsx (클라이언트 컴포넌트)
   4개 카드 가로 배치:
   - 총 강좌수 (아이콘: BookOpen)
   - 총 수강인원 (아이콘: Users)
   - 평균 수강률 (아이콘: TrendingUp, % 표시)
   - 원어 강의 비율 (아이콘: Globe, % 표시)
   각 카드: shadcn Card, 큰 숫자 폰트, 아이콘

3. 이수구분 차트: components/CategoryCharts.tsx (클라이언트 컴포넌트)
   가로 2분할 레이아웃:
   - 좌: "이수구분별 강좌 수" — Recharts BarChart (수평 방향, 이수구분이 Y축)
   - 우: "이수구분별 평균 수강인원" — Recharts BarChart (수평 방향)
   두 차트 모두 Tooltip 필수 (마우스 오버 시 구체적 수치 표시)
   색상: 연한 파란계열 그라데이션 또는 단색

4. app/(dashboard)/page.tsx 에 StatsCards와 CategoryCharts 배치
   - 상단: "전체 교과목 대시보드" (또는 선택된 대학/학과명) 제목 + 부제목
   - 다음 줄: StatsCards
   - 다음 줄: CategoryCharts

완료 후 "✅ Phase 3 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 4 프롬프트 (복사해서 채팅에 붙여넣기)

```
Phase 4: 수업방법·학점 도넛 차트 + 요일·시간 바 차트

현재 파일 구조를 먼저 확인하고 아래 작업을 진행하라.

1. lib/data.ts에 아래 함수를 추가하라:
   - getTeachingMethods(college?, department?) → 수업방법별 강좌수 배열
   - getCreditDistribution(college?, department?) → 학점별 강좌수 배열
   - getCoursesByDay(college?, department?) → 요일별 강좌수 배열 (월·화·수·목·금·토 순서)
   - getCoursesByTime(college?, department?) → 시간대별 강좌수 배열
     (시간대 그룹: 9시 이전, 09:00-10:59, 11:00-12:59, 13:00-14:59, 15:00-16:59, 17:00 이후)

2. 수업방법·학점 차트: components/DistributionCharts.tsx (클라이언트 컴포넌트)
   가로 2분할:
   - 좌: "수업방법 유형 분포" — Recharts PieChart (도넛형, 범례 우측 배치, 비율 % 표시)
   - 우: "학점 구성 비율" — Recharts PieChart (도넛형, 범례 우측 배치)
   두 차트 모두 Tooltip 필수

3. 요일·시간 차트: components/TimeCharts.tsx (클라이언트 컴포넌트)
   가로 2분할:
   - 좌: "요일별 수업 강좌 수" — Recharts BarChart (수평 방향, 요일이 Y축)
   - 우: "수업 시간별 강좌 수" — Recharts BarChart (수평 방향, 시간대가 Y축)
   두 차트 모두 Tooltip 필수
   색상: 노란/골드 계열 (이수구분 차트와 색상 차별화)

4. app/(dashboard)/page.tsx에 DistributionCharts와 TimeCharts를 Phase 3 차트 아래에 추가

완료 후 "✅ Phase 4 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 5 프롬프트 (복사해서 채팅에 붙여넣기)

```
Phase 5: 대학별 분석 요약 테이블 + 상세 강좌 정보 테이블

현재 파일 구조를 먼저 확인하고 아래 작업을 진행하라.

1. lib/data.ts에 아래 함수를 추가하라:
   - getCollegeSummary() → 대학별 { 대학명, 강좌수, 수강인원합계, 평균수강률 } 배열
     AGENTS.md 대학 순서와 동일하게 정렬
   - getCourses(college?, department?, page, pageSize) → 페이지네이션된 강좌 목록 + 총 개수

2. 대학별 요약 테이블: components/CollegeSummaryTable.tsx (클라이언트 컴포넌트)
   shadcn Table 사용, 컬럼:
   - 대학명 | 강좌 수 | 수강인원 합계 | 평균 수강률(%)
   평균 수강률을 기준으로 높을수록 진한 색 Badge 또는 셀 배경 강조
   
3. 상세 강좌 정보 테이블: components/CourseTable.tsx (클라이언트 컴포넌트)
   shadcn Table + 페이지네이션 (10개씩)
   컬럼: 대학 | 학과 | 교과목명 | 이수구분 | 학점 | 담당교수 | 수업방법 | 요일/시간 | 수강/정원 | 수강률(%)
   - 상단에 검색창 (교과목명 검색)
   - 우측 상단에 총 N개 표시
   - 페이지네이션: 이전/다음 버튼 + 현재 페이지/전체 페이지

4. app/(dashboard)/page.tsx에 CollegeSummaryTable과 CourseTable을 최하단에 추가
   - 각각 섹션 제목 포함: "대학(원)별 강좌 분석 요약", "상세 강좌 정보"

완료 후 "✅ Phase 5 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 6 프롬프트 (복사해서 채팅에 붙여넣기)

```
Phase 6: AI 강의 분석 기능 (Gemini API)

현재 파일 구조를 먼저 확인하고 아래 작업을 진행하라.

1. API 라우트: app/api/ai-analysis/route.ts
   - POST 요청으로 { college, department } 수신
   - Supabase에서 해당 대학/학과의 강좌 통계 데이터를 가져옴:
     총 강좌수, 총 수강인원, 평균 수강률, 원어 강의 비율,
     이수구분별 강좌수, 수업방법 분포, 학점 분포, 요일별 강좌수
   - GEMINI_API_KEY로 @google/generative-ai 클라이언트 생성
   - 모델: gemini-2.0-flash-lite (UI에는 "Gemini 2.0 Flash-Lite"로 표시)
   - 아래 형식의 프롬프트로 분석 요청:
     ```
     당신은 대학 교육과정 분석 전문가입니다.
     아래는 인천대학교 2026학년도 1학기 [대학/학과명]의 강좌 운영 현황 데이터입니다.
     [통계 데이터 JSON]
     
     다음 형식으로 종합 분석 보고서를 작성해주세요:
     1. 데이터 요약 (주요 수치)
     2. 주요 특징 및 트렌드 분석
     3. 문제점 및 개선 아이디어 제언
     
     보고서 상단에 아래 헤더를 포함해주세요:
     === AI 강의 데이터 분석 보고서 ===
     분석 대상: [대학/학과명]
     일자: [현재 날짜]
     작성 모델: Gemini 2.0 Flash-Lite
     ```
   - 응답: { analysis: string } JSON 반환
   - 에러 처리 포함 (API 키 없음, 요청 실패 등)

2. AI 분석 모달: components/AIAnalysisModal.tsx (클라이언트 컴포넌트)
   shadcn Dialog 사용:
   - 제목: "AI 강의 데이터 종합 분석"
   - 로딩 상태: 스피너 + "Gemini 2.0 Flash-Lite 모델이 데이터를 분석 중입니다..."
   - 분석 완료: 결과 텍스트를 마크다운 형식으로 pre 태그 또는 whitespace-pre-wrap 스타일로 표시 (스크롤 가능)
   - 하단 버튼:
     - "분석 결과 다운로드" 버튼: 결과를 .md 파일로 다운로드 (파일명: AI_분석_[대학/학과명]_2026-1학기.md)
     - "닫기" 버튼
   - X 버튼으로 닫기 가능

3. Header.tsx의 "AI 강의 분석" 버튼에 AIAnalysisModal 연결
   - 버튼 클릭 시 모달 열림
   - 현재 선택된 대학/학과(DashboardContext)를 모달에 전달
   - 모달 열릴 때 자동으로 분석 API 호출 시작

완료 후 "✅ Phase 6 완료" + 변경 파일 목록을 보고하라.
```

---

## ▶ PHASE 7 프롬프트 (복사해서 채팅에 붙여넣기)

```
Phase 7: UI 마감 & Vercel 배포

현재 파일 구조와 전체 동작 상태를 먼저 확인하고 아래 작업을 진행하라.

1. 전체 UI 점검 및 보완:
   - app/(dashboard)/page.tsx 페이지 제목이 선택된 대학/학과에 따라 동적으로 변경되는지 확인
     예) "전체 교과목 대시보드" / "공과대학 교과목 대시보드" / "컴퓨터공학부 교과목 대시보드"
   - Breadcrumb이 "전체 > 공과대학 > 컴퓨터공학부" 형식으로 올바르게 표시되는지 확인
   - 사이드바에서 대학/학과 선택 시 모든 차트와 테이블이 해당 데이터로 필터링되는지 확인
   - 모든 차트에 인터랙티브 툴팁이 동작하는지 확인
   - Footer의 링크 3개(인천대학교 홈페이지, INU 포털, 이러닝)가 올바르게 연결되었는지 확인
   - Footer에 "김종경" 이름이 표시되는지 확인

2. Loading 상태 처리:
   - 각 차트/테이블 컴포넌트에 로딩 중일 때 shadcn Skeleton 표시

3. 반응형 레이아웃 최소 처리:
   - 사이드바는 md 이상에서 표시, sm 이하에서 숨김 처리 (기본 기능 우선)

4. TypeScript 에러 점검:
   - npx tsc --noEmit 실행, 에러 있으면 수정

5. Vercel 배포 준비:
   - vercel.json이 없어도 Next.js 자동 감지되므로 별도 설정 불필요
   - .env.local의 환경변수 3개를 Vercel Dashboard에 추가해야 함을 안내
   - `npx vercel --prod` 또는 GitHub 연동 방법 안내

6. README.md 업데이트:
   - 프로젝트 설명, 기술 스택, 환경변수 설정 방법, 로컬 실행 방법 작성

완료 후 "✅ Phase 7 완료" + 변경 파일 목록과 Vercel 배포 URL을 보고하라.
```

---

## 참고 파일
- `대시보드01~08.png` — 예시 UI (이 디자인과 유사하게 제작)
- `인천대학교대학순서.png` — 사이드바 대학 순서 (위 고정 규칙에 이미 반영됨)
- `AI 강의 데이터 종합 분석 예시.md` — AI 분석 결과 형식 참고
