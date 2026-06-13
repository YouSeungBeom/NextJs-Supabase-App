"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function GoogleLoginButton({ next = "/protected" }: { next?: string }) {
  // 버튼 중복 클릭 방지를 위한 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  // OAuth 요청 실패 시 표시할 에러 메시지
  const [error, setError] = useState<string | null>(null);

  // 구글 로그인 버튼 클릭 핸들러
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // 인증 성공 후 콜백 라우트로 이동, next 파라미터로 최종 목적지 전달
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      // 성공 시 브라우저가 Google 인증 페이지로 이동하므로 로딩 상태 해제 불필요
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
        <GoogleIcon />
        {isLoading ? "Redirecting..." : "Continue with Google"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// 구글 "G" 로고 인라인 SVG (lucide-react에 브랜드 아이콘이 없음)
function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
      <path
        d="M23.766 12.276c0-.818-.074-1.604-.21-2.36H12.24v4.467h6.482a5.54 5.54 0 0 1-2.404 3.633v3.02h3.882c2.272-2.092 3.566-5.176 3.566-8.76z"
        fill="#4285F4"
      />
      <path
        d="M12.24 24c3.24 0 5.954-1.075 7.94-2.964l-3.882-3.02c-1.077.722-2.452 1.147-4.058 1.147-3.12 0-5.764-2.108-6.71-4.946H1.52v3.113C3.494 21.3 7.547 24 12.24 24z"
        fill="#34A853"
      />
      <path
        d="M5.53 14.217a7.21 7.21 0 0 1-.378-2.217c0-.77.136-1.517.378-2.217V6.67H1.52A11.93 11.93 0 0 0 .24 12c0 1.927.462 3.75 1.28 5.33l4.01-3.113z"
        fill="#FBBC05"
      />
      <path
        d="M12.24 4.62c1.762 0 3.343.605 4.59 1.794l3.443-3.443C18.19 1.19 15.476 0 12.24 0 7.547 0 3.494 2.7 1.52 6.67l4.01 3.113c.946-2.838 3.59-4.946 6.71-4.946z"
        fill="#EA4335"
      />
    </svg>
  );
}
