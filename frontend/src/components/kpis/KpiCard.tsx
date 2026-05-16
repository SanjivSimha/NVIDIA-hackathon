import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

export function KpiCard({ title, value, previous, status = "healthy" }: { title: string; value: string; previous?: number; status?: "healthy" | "warning" | "critical" }) {
  const delta = previous;
  const color = status === "critical" ? "border-red-500/40 bg-red-950/10" : status === "warning" ? "border-amber-500/40 bg-amber-950/10" : "border-emerald-500/25 bg-panelSoft";
  const badge = status === "critical" ? "bg-red-500/15 text-red-200" : status === "warning" ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200";
  return (
    <div className={`rounded-xl border ${color} p-3`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{title}</p>
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge}`}>{status}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {typeof delta === "number" && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${delta > 0 ? "text-emerald-300" : delta < 0 ? "text-red-300" : "text-slate-400"}`}>
          {delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : delta < 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
          {delta > 0 ? "+" : ""}{delta.toFixed(2)} vs previous
        </p>
      )}
    </div>
  );
}
