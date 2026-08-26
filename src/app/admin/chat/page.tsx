"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session";
import type { ChatMessage } from "@/types/database";

type Thread = { thread_id: string; last: string; messages: ChatMessage[] };

export default function AdminChatPage() {
  const user = useSessionStore((s) => s.user);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [input, setInput] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: true });
    const msgs = (data as ChatMessage[]) ?? [];
    const map = new Map<string, ChatMessage[]>();
    for (const m of msgs) {
      const list = map.get(m.thread_id) ?? [];
      list.push(m);
      map.set(m.thread_id, list);
    }
    const next: Thread[] = [...map.entries()].map(([thread_id, messages]) => ({
      thread_id,
      last: messages[messages.length - 1]?.message ?? "",
      messages,
    }));
    setThreads(next);
    if (!active && next[0]) setActive(next[0].thread_id);
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const thread = threads.find((t) => t.thread_id === active);

  async function reply(e: FormEvent) {
    e.preventDefault();
    if (!user || !active || !input.trim()) return;
    const supabase = createClient();
    const content = input.trim();
    setInput("");
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      thread_id: active,
      is_admin: true,
      message: content,
    });
  }

  return (
    <div className="grid min-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[16rem_1fr]">
      <aside className="border-b border-slate-100 md:border-b-0 md:border-r">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Inbox realtime</div>
        <ul>
          {threads.map((th) => (
            <li key={th.thread_id}>
              <button
                type="button"
                onClick={() => setActive(th.thread_id)}
                className={cn("w-full px-4 py-3 text-left text-sm hover:bg-slate-50", active === th.thread_id && "bg-teal-50")}
              >
                <p className="truncate font-mono text-xs">{th.thread_id.slice(0, 8)}</p>
                <p className="truncate text-xs text-slate-500">{th.last}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex min-h-[24rem] flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
          {thread?.messages.map((m) => (
            <div
              key={m.id}
              className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm", m.is_admin ? "ml-auto bg-teal-700 text-white" : "bg-white")}
            >
              {m.message}
            </div>
          ))}
        </div>
        <form onSubmit={reply} className="flex gap-2 border-t border-slate-100 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none"
            placeholder="Balas sebagai admin..."
          />
          <Button type="submit">Kirim</Button>
        </form>
      </div>
    </div>
  );
}
