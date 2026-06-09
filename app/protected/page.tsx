import { redirect } from "next/navigation";
import { Suspense } from "react";
import { InfoIcon, UserIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import type { Tables } from "@/lib/database.types";

// 현재 로그인 사용자의 프로필 정보를 조회하는 서버 컴포넌트
async function ProfileDetails() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Tables<"profiles">>();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <UserIcon size="16" className="text-muted-foreground" />
        <span className="font-medium text-sm text-muted-foreground">
          프로필 정보
        </span>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm border rounded-md p-4">
        {/* 이메일 */}
        <span className="text-muted-foreground font-medium">이메일</span>
        <span>{profile?.email ?? "-"}</span>

        {/* 사용자명 */}
        <span className="text-muted-foreground font-medium">사용자명</span>
        <span>{profile?.username ?? "-"}</span>

        {/* 이름 */}
        <span className="text-muted-foreground font-medium">이름</span>
        <span>{profile?.full_name ?? "-"}</span>

        {/* 웹사이트 */}
        <span className="text-muted-foreground font-medium">웹사이트</span>
        <span>{profile?.website ?? "-"}</span>

        {/* 소개 */}
        <span className="text-muted-foreground font-medium">소개</span>
        <span>{profile?.bio ?? "-"}</span>

        {/* 가입일 */}
        <span className="text-muted-foreground font-medium">가입일</span>
        <span>
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString("ko-KR")
            : "-"}
        </span>
      </div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">내 프로필</h2>
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">
              프로필 불러오는 중...
            </p>
          }
        >
          <ProfileDetails />
        </Suspense>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
