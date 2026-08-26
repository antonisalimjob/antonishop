import Link from "next/link";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { href: "/admin", label: "Ringkasan" },
          { href: "/admin/pesanan", label: "Pesanan" },
          { href: "/admin/chat", label: "Live chat" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full bg-white px-4 py-1.5 text-sm ring-1 ring-slate-200 hover:bg-teal-50">
            {l.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
