import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  // OAuth 제공자가 전달하는 인증 코드
  const code = searchParams.get("code");
  // 인증 성공 후 이동할 경로 (기본값: 보호된 페이지)
  const next = searchParams.get("next") ?? "/protected";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 로드밸런서 뒤 환경에서는 origin이 내부 주소이므로 forwarded host로 보정
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        redirect(`https://${forwardedHost}${next}`);
      } else {
        redirect(`${origin}${next}`);
      }
    }

    // 코드 교환 실패 시 에러 페이지로 이동
    redirect(`/auth/error?error=${error.message}`);
  }

  // code 파라미터가 없는 비정상 접근
  redirect(`/auth/error?error=No code provided`);
}
