# Next.js + Supabase 풀스택 스타터 킷

Next.js 16 (App Router)과 Supabase를 기반으로 한 풀스택 웹 애플리케이션 스타터 킷입니다.
쿠키 기반 Supabase Auth 인증(이메일/비밀번호 + Google OAuth)과 shadcn/ui 컴포넌트를 포함하며,
실제 서비스 개발의 출발점으로 사용할 수 있습니다.

## 주요 기능

- **인증**
  - 이메일/비밀번호 기반 회원가입 · 로그인 · 비밀번호 재설정
  - Google OAuth 소셜 로그인
  - 쿠키 기반 세션 관리 (`@supabase/ssr`)
  - 비인증 사용자의 보호된 경로 접근 시 `/auth/login`으로 자동 리다이렉트 (`proxy.ts`)
- **프로필**
  - 로그인 사용자의 `profiles` 테이블 정보 조회 (`/protected`)
- **UI / UX**
  - shadcn/ui (Radix UI 기반) 컴포넌트
  - Tailwind CSS v4 스타일링
  - 라이트 / 다크 / 시스템 테마 전환 (next-themes)
- **개발 환경**
  - TypeScript strict 모드
  - ESLint + Prettier + Husky(pre-commit) 자동 포맷/린트

## 기술 스택

| 분류        | 기술                                                             |
| ----------- | ---------------------------------------------------------------- |
| 프레임워크  | Next.js 16 (App Router)                                          |
| 인증 / DB   | Supabase (`@supabase/ssr` ^0.10, `@supabase/supabase-js` ^2.107) |
| 스타일링    | Tailwind CSS v4 (`@tailwindcss/postcss`)                         |
| UI 컴포넌트 | shadcn/ui (Radix UI 기반)                                        |
| 다크 모드   | next-themes                                                      |
| 아이콘      | Lucide React                                                     |
| 언어        | TypeScript (strict)                                              |

## 프로젝트 구조

```
.
├── app/
│   ├── auth/                   # 인증 관련 페이지 및 라우트 핸들러
│   │   ├── callback/route.ts   # OAuth 콜백 처리
│   │   ├── confirm/route.ts    # 이메일 OTP 확인
│   │   ├── login/               # 로그인
│   │   ├── sign-up/             # 회원가입
│   │   ├── sign-up-success/    # 회원가입 완료 안내
│   │   ├── forgot-password/    # 비밀번호 찾기
│   │   ├── update-password/    # 비밀번호 변경
│   │   └── error/               # 인증 에러 페이지
│   ├── protected/               # 인증 필요 페이지 (프로필 정보 표시)
│   ├── layout.tsx                # 루트 레이아웃 (ThemeProvider 등)
│   └── page.tsx                  # 공개 홈페이지
├── components/
│   ├── ui/                       # shadcn/ui 기본 컴포넌트
│   ├── tutorial/                 # 초기 설정 가이드용 컴포넌트
│   └── *.tsx                     # 로그인/회원가입 폼, AuthButton 등 앱 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Client Component용 Supabase 클라이언트
│   │   ├── server.ts          # Server Component / Route Handler / Server Action용
│   │   └── proxy.ts           # proxy.ts(미들웨어)용 세션 갱신 로직
│   ├── database.types.ts        # Supabase DB 타입 정의
│   └── utils.ts                  # 공통 유틸리티 (hasEnvVars, cn 등)
├── docs/guides/                  # 개발 가이드 문서 모음
├── proxy.ts                      # Next.js 미들웨어 (세션 갱신 / 인증 리다이렉트)
└── CLAUDE.md                     # Claude Code용 개발 지침
```

## 시작하기

### 1. 사전 요구사항

- Node.js 18 이상
- Supabase 프로젝트 ([database.new](https://database.new)에서 생성 가능)

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 프로젝트 설정 > API 메뉴에서 값을 가져와 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon 키>
```

> `lib/utils.ts`의 `hasEnvVars`가 두 값의 존재 여부를 확인합니다. 미설정 시 UI에 경고 배너가 표시되고 proxy의 인증 확인이 건너뛰어집니다.

Google OAuth 로그인을 사용하려면 Supabase 대시보드의 **Authentication > Providers > Google**에서 클라이언트 ID/Secret을 설정하고, **Redirect URL**에 `<APP_URL>/auth/callback`을 등록합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

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

커밋 시 스테이징된 파일에 자동 실행됩니다:

1. `eslint --fix` — TypeScript/TSX 파일 lint 자동 수정
2. `prettier --write` — 코드 포맷 자동 적용

shadcn/ui 컴포넌트 추가:

```bash
npx shadcn add <component-name>
```

## 라우트 구조

| 경로                    | 설명                                                |
| ----------------------- | --------------------------------------------------- |
| `/`                     | 공개 홈페이지                                       |
| `/auth/login`           | 로그인 (이메일/비밀번호, Google OAuth)              |
| `/auth/sign-up`         | 회원가입                                            |
| `/auth/forgot-password` | 비밀번호 재설정 요청                                |
| `/auth/update-password` | 비밀번호 변경                                       |
| `/auth/confirm`         | 이메일 OTP 확인 (Route Handler)                     |
| `/auth/callback`        | OAuth 콜백 처리 (Route Handler)                     |
| `/auth/error`           | 인증 에러 안내                                      |
| `/protected`            | 인증 필요 페이지 — 로그인 사용자의 프로필 정보 표시 |

## 데이터베이스 스키마

`lib/database.types.ts`에 Supabase에서 생성한 타입이 정의되어 있습니다. 현재 `profiles` 테이블이 존재합니다.

| 컬럼         | 설명                            |
| ------------ | ------------------------------- |
| `id`         | 사용자 ID (PK, auth.users 참조) |
| `email`      | 이메일                          |
| `username`   | 사용자명                        |
| `full_name`  | 이름                            |
| `website`    | 웹사이트                        |
| `bio`        | 소개                            |
| `avatar_url` | 프로필 이미지 URL               |
| `created_at` | 가입일                          |
| `updated_at` | 수정일                          |

테이블 Row 타입은 `Tables<>` 헬퍼로 참조합니다:

```typescript
import type { Tables } from "@/lib/database.types";

const profile: Tables<"profiles"> = ...;
```

DB 타입 재생성은 Supabase MCP 서버의 `generate_typescript_types` 도구를 사용해 `lib/database.types.ts`에 덮어씁니다.

## Supabase 클라이언트 패턴

상황에 맞게 세 가지 클라이언트를 구분해서 사용합니다.

| 파일                     | 사용 위치                                      |
| ------------------------ | ---------------------------------------------- |
| `lib/supabase/client.ts` | Client Component (`"use client"`)              |
| `lib/supabase/server.ts` | Server Component, Route Handler, Server Action |
| `lib/supabase/proxy.ts`  | `proxy.ts` (Next.js 미들웨어) 전용             |

> `lib/supabase/server.ts`의 `createClient()`는 매 함수 호출마다 새로 생성해야 합니다 (Fluid compute 환경 대응, 전역 변수 보관 금지).

## 추가 문서

`docs/guides/` 폴더에 상세 개발 가이드가 있습니다.

- [프로젝트 구조 가이드](docs/guides/project-structure.md)
- [Next.js 16 개발 지침](docs/guides/nextjs-16.md)
- [컴포넌트 패턴](docs/guides/component-patterns.md)
- [React Hook Form 활용 가이드](docs/guides/forms-react-hook-form.md)
- [스타일링 가이드](docs/guides/styling-guide.md)

Claude Code 작업 시 참고할 전체 개발 지침은 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 더 알아보기

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
