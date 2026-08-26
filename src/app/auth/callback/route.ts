import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BASE_PATH } from "@/lib/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const path = next.startsWith("/") ? next : `/${next}`;
  return NextResponse.redirect(`${origin}${BASE_PATH}${path === "/" ? "" : path}`);
}
