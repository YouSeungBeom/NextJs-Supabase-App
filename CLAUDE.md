# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16 App Router와 Supabase를 기반으로 한 풀스택 웹 애플리케이션 스타터 킷.
쿠키 기반 Supabase Auth 인증 시스템과 shadcn/ui 컴포넌트를 포함하며, 실제 서비스 개발의 출발점으로 사용된다.

## 주요 기술 스택

| 분류        | 기술                                                             |
| ----------- | ---------------------------------------------------------------- |
| 프레임워크  | Next.js 16 (App Router)                                          |
| 인증 / DB   | Supabase (`@supabase/ssr` ^0.10, `@supabase/supabase-js` ^2.107) |
| 스타일링    | Tailwind CSS v4 (`@tailwindcss/postcss`)                         |
| UI 컴포넌트 | shadcn/ui (Radix UI 기반)                                        |
| 다크 모드   | next-themes                                                      |
| 아이콘      | Lucide React                                                     |
| 언어        | TypeScript (strict)                                              |

## 개발 명령어

```bash
npm run dev           # 개발 서버 실행 (localhost:3000)
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버 실행
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷 적용 (전체)
npm run format:check  # Prettier 포맷 검사 (CI용)
npm run type-check    # TypeScript 타입 검사 (빌드 없이)
```

### Pre-commit 훅 (Husky + lint-staged)

커밋 시 스테이징된 파일에 자동 실행:

1. `eslint --fix` — TypeScript/TSX 파일 lint 자동 수정
2. `prettier --write` — 코드 포맷 자동 적용

훅을 임시로 건너뛰려면 (비권장):

```bash
git commit --no-verify -m "커밋 메시지"
```

shadcn/ui 컴포넌트 추가:

```bash
npx shadcn add <component-name>
```

Supabase DB 타입 재생성 (MCP `supabase` 서버):

- `generate_typescript_types` 도구 → 결과를 `lib/database.types.ts`에 덮어쓴다.

## 환경 변수

`.env.local` 파일에 다음 값이 필요하다:

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon 키>
```

`lib/utils.ts`의 `hasEnvVars`가 두 값의 존재 여부를 확인해, 미설정 시 UI에 경고 배너를 표시하고 proxy 인증 확인을 건너뛴다.

## 아키텍처 개요

### 라우트 구조

- `/` — 공개 홈페이지
- `/auth/*` — 인증 관련 페이지 (login, sign-up, forgot-password, update-password, confirm, error)
- `/protected/*` — 인증 필요 페이지 (`app/protected/layout.tsx`에서 레이아웃 공유)

### Supabase 클라이언트 패턴

세 가지 클라이언트를 상황에 맞게 구분해서 사용한다:

| 파일                     | 사용 위치                                      |
| ------------------------ | ---------------------------------------------- |
| `lib/supabase/client.ts` | Client Component (`"use client"`)              |
| `lib/supabase/server.ts` | Server Component, Route Handler, Server Action |
| `lib/supabase/proxy.ts`  | `proxy.ts` (Next.js 미들웨어) 전용             |

> **중요**: `lib/supabase/server.ts`의 `createClient()`는 매 함수 호출마다 새로 생성해야 한다. 전역 변수 보관 금지 (Fluid compute 환경 대응).

### 세션 관리 (proxy)

이 프로젝트는 Next.js 미들웨어 파일을 `middleware.ts` 대신 `proxy.ts`로 명명한다. 모든 요청에서 `lib/supabase/proxy.ts`의 `updateSession()`을 실행해:

1. 쿠키에서 Supabase 세션을 갱신한다.
2. 비인증 사용자가 `/`, `/login`, `/auth/*` 이외의 경로에 접근하면 `/auth/login`으로 리다이렉트한다.

> **주의**: `createServerClient()`와 `supabase.auth.getClaims()` 사이에 다른 코드를 삽입하면 사용자 세션이 무작위로 끊기는 문제가 발생하므로 금지.

### 인증 흐름

- 로그인 / 회원가입: Client Component (`components/login-form.tsx` 등)에서 `lib/supabase/client.ts` 사용
- 이메일 OTP 확인: `app/auth/confirm/route.ts` Route Handler에서 처리
- 인증 상태 표시(`AuthButton`): Server Component에서 `getClaims()`로 확인

### 컴포넌트 구조

- `components/ui/` — shadcn/ui 기본 컴포넌트 (직접 수정 지양)
- `components/tutorial/` — 초기 설정 가이드용 컴포넌트 (실제 앱 기능과 무관)
- `components/*.tsx` — 앱 전용 컴포넌트

## DB 타입 활용

타입 파일은 `lib/database.types.ts`에 있다 (`@/types/supabase`가 아님). 테이블 Row 타입은 `Tables<>` 헬퍼로 참조한다:

```typescript
import type { Tables } from "@/lib/database.types";

// 테이블 Row 타입 참조
const profile: Tables<"profiles"> = ...;

// createClient에 전체 DB 타입 전달 시
import { Database } from "@/lib/database.types";
const supabase = createClient<Database>();
```

현재 스키마에는 `profiles` 테이블이 있다 (`id`, `email`, `username`, `full_name`, `website`, `bio`, `avatar_url`, `created_at`, `updated_at`).

## 코드 작성 가이드라인

### Server Component 패턴

```typescript
// 서버 컴포넌트에서 Supabase 데이터 조회
const supabase = await createClient(); // 매번 새로 생성
const { data, error } = await supabase.from("table").select();
```

### Client Component 패턴

```typescript
"use client";

// 클라이언트 컴포넌트에서 Supabase 인증 처리
const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

### 경로 별칭

`tsconfig.json`의 `@/*`가 프로젝트 루트를 가리킨다. 상대 경로 대신 항상 `@/` 별칭을 사용한다.

## MCP 서버 설정

이 프로젝트에서 활성화된 MCP 서버 목록 (`.claude/settings.local.json`):

| 서버                  | 용도                                           |
| --------------------- | ---------------------------------------------- |
| `supabase`            | Supabase DB 마이그레이션, 타입 생성, 로그 조회 |
| `playwright`          | 브라우저 자동화 및 UI 테스트                   |
| `context7`            | 라이브러리 / 프레임워크 최신 공식 문서 조회    |
| `sequential-thinking` | 복잡한 문제의 단계적 사고 처리                 |
| `shadcn`              | shadcn/ui 컴포넌트 검색 및 추가 명령어 조회    |
| `shrimp-task-manager` | 작업 계획 및 태스크 관리                       |

## 작업 완료 체크리스트

새 기능 구현 또는 수정 작업 후 아래를 확인한다:

- [ ] `npm run lint` — ESLint 오류 없음
- [ ] `npm run build` — 빌드 성공 (타입 오류 포함)
- [ ] 인증이 필요한 페이지는 `/protected` 하위에 배치
- [ ] Supabase 클라이언트를 용도에 맞게 사용 (client / server / proxy 구분)
- [ ] Server Component에서 `createClient()`를 전역 변수로 보관하지 않음
- [ ] `proxy.ts`에서 `createServerClient()`와 `getClaims()` 사이에 코드 미삽입
- [ ] 새 shadcn/ui 컴포넌트는 `npx shadcn add`로 추가 (직접 작성 금지)
- [ ] DB 타입 임포트는 `@/lib/database.types` 경로 사용 (`@/types/supabase` 아님)
- [ ] 환경 변수 추가 시 `.env.local` 업데이트 확인
