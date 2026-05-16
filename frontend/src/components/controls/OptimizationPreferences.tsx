import type { OptimizationProfile } from "../../api/types";
import { PROFILES } from "../../hooks/useOptimizationProfile";
import { formatPercent } from "../../utils/formatters";
import { SectionCard } from "../layout/SectionCard";

export function OptimizationPreferences({ profile, onSelect }: { profile: OptimizationProfile; onSelect: (name: string) => void }) {
  return (
    <SectionCard title="Optimization Preferences" subtitle="Frontend-only priorities. The backend never optimizes against these.">
      <div className="grid grid-cols-2 gap-1.5">
        {PROFILES.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelect(item.name)}
            className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${item.name === profile.name ? "border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-sm shadow-emerald-950/40" : "border-line bg-command text-slate-300 hover:border-slate-500"}`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {Object.entries(profile.weights).map(([key, value]) => (
          <div key={key} className="rounded-full border border-line bg-command px-2.5 py-1">
            <span className="text-slate-500">{key}</span>
            <span className="ml-1 font-semibold text-slate-100">{formatPercent(value)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
