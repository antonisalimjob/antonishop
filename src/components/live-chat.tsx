"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session";
import type { ChatMessage } from "@/types/database";

export function LiveChat() {
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!open || !user || isAdmin) return;
    const supabase = createClient();

    supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as ChatMessage[]) ?? []));

    const channel = supabase
      .channel(`chat:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${user.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, user, isAdmin]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (isAdmin) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !input.trim()) return;
    const supabase = createClient();
    const content = input.trim();
    setInput("");
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      thread_id: user.id,
      is_admin: false,
      message: content,
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-teal-800 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Chat AntoniHost</p>
              <p className="text-[11px] text-teal-100">Realtime · tanya stok, spek, atau jasa</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3">
            {!user && (
              <p className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-500">
                Masuk dengan Google untuk chat langsung dengan admin.{" "}
                <Link href="/login" className="font-medium text-teal-700">
                  Masuk
                </Link>
              </p>
            )}
            {user && messages.length === 0 && (
              <p className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-500">
                Halo! Ada yang bisa kami bantu seputar hardware, akun MLBB/HOK, atau jasa IT?
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.is_admin ? "bg-white text-slate-800" : "ml-auto bg-teal-700 text-white",
                )}
              >
                {m.message}
              </div>
            ))}
            <div ref={bottom} />
          </div>
          {user && (
            <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-100 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan..."
                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-teal-700 text-white shadow-lg shadow-teal-700/30 transition hover:bg-teal-800"
        aria-label="Live chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
