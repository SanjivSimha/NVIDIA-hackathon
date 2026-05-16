import { AlertTriangle, Activity, ShieldCheck } from "lucide-react";
import type { AnyRecord, OptimizationProfile } from "../../api/types";
import { titleize } from "../../utils/formatters";
import { StatusBadge } from "../layout/StatusBadge";

const severityRank: Record<string, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

function getMostSevereAlert(kpis?: AnyRecord, alerts: AnyRecord[] = []) {
  const kpiAlerts = Array.isArray(kpis?.alerts) ? kpis.alerts : [];
  return [...kpiAlerts, ...alerts].sort(
    (a, b) => (severityRank[b?.severity] || 0) - (severityRank[a?.severity] || 0),
  )[0];
}

export function SituationBanner({
  kpis,
  alerts,
  state,
  status,
  profile,
}: {
  kpis?: AnyRecord;
  alerts: AnyRecord[];
  state?: AnyRecord;
  status?: AnyRecord;
  profile: OptimizationProfile;
}) {
  const alert = getMostSevereAlert(kpis, alerts);
  const severity = alert?.severity || "healthy";
  const isCritical = severity === "critical";
  const simulationStatus = status?.simulation_status || status?.status || state?.simulation_status || "stopped";
  const virtualWeek = status?.virtual_week ?? state?.virtual_week ?? kpis?.virtual_week ?? 0;
  const summary = alert?.message || "Live simulation running. Monitor inventory, routes, alerts, and KPI tradeoffs.";

  return (
    <section
      className={`overflow-hidden rounded-2xl border p-5 shadow-2xl shadow-black/20 ${
        isCritical
          ? "border-red-400/35 bg-red-950/25"
          : severity === "warning"
            ? "border-amber-400/30 bg-amber-950/15"
            : "border-emerald-400/20 bg-gradient-to-br from-panel via-panel to-slate-900"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
              isCritical ? "border-red-300/30 bg-red-500/15 text-red-200" : "border-emerald-300/25 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {isCritical ? <AlertTriangle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-white">Current Situation</h2>
              {alert?.type && <StatusBadge status={severity} />}
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{summary}</p>
            {alert?.type && <p className="mt-1 text-xs text-slate-500">Primary signal: {titleize(alert.type)}</p>}
          </div>
        </div>

        <div className="grid min-w-fit grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-line bg-command/70 px-3 py-2">
            <p className="text-slate-500">Week</p>
            <p className="mt-1 font-semibold text-slate-100">{virtualWeek}</p>
          </div>
          <div className="rounded-lg border border-line bg-command/70 px-3 py-2">
            <p className="text-slate-500">Simulation</p>
            <div className="mt-1"><StatusBadge status={simulationStatus} /></div>
          </div>
          <div className="rounded-lg border border-line bg-command/70 px-3 py-2">
            <p className="text-slate-500">Profile</p>
            <p className="mt-1 flex items-center gap-1 font-semibold text-slate-100"><Activity className="h-3 w-3 text-emerald-300" />{profile.name}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
