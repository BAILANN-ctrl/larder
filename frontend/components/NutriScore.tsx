"use client";

const GRADES = ["a", "b", "c", "d", "e"] as const;

const NUTRI_COLORS: Record<(typeof GRADES)[number], string> = {
  a: "#2E7D32",
  b: "#8BC34A",
  c: "#FFD54F",
  d: "#FB8C00",
  e: "#E53935",
};

type Gradable = string | null | undefined;

export default function NutriScore({ grade }: { grade: Gradable }) {
  const normalized = (grade ?? "").trim().toLowerCase();
  const active = GRADES.indexOf(normalized as (typeof GRADES)[number]);

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={active >= 0 ? `Nutri-Score ${normalized.toUpperCase()}` : "Nutri-Score"}
    >
      {GRADES.map((g, i) => (
        <span
          key={g}
          className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono text-xs font-bold uppercase transition-all duration-500 ease-luxe ${
            i === active
              ? "scale-110 text-white ring-1 ring-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.22)]"
              : "bg-espresso/5 text-espresso/25"
          }`}
          style={i === active ? { backgroundColor: NUTRI_COLORS[g] } : undefined}
        >
          {g}
        </span>
      ))}
    </div>
  );
}