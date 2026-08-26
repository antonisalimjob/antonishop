export const ACCENT: Record<string, string> = {
  teal: "from-teal-500 to-emerald-600",
  slate: "from-slate-600 to-slate-800",
  indigo: "from-indigo-500 to-violet-600",
  sky: "from-sky-500 to-blue-600",
  blue: "from-blue-500 to-indigo-600",
  rose: "from-rose-500 to-pink-600",
  red: "from-red-500 to-orange-600",
  cyan: "from-cyan-500 to-teal-600",
  emerald: "from-emerald-500 to-green-600",
  amber: "from-amber-500 to-orange-600",
  violet: "from-violet-500 to-purple-600",
  fuchsia: "from-fuchsia-500 to-pink-600",
  pink: "from-pink-500 to-rose-500",
  lime: "from-lime-500 to-green-600",
  yellow: "from-yellow-400 to-amber-500",
  orange: "from-orange-500 to-red-500",
};

export function accentClass(accent?: string) {
  return ACCENT[accent ?? ""] ?? ACCENT.teal;
}
