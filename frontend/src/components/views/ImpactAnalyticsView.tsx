import type { AnyRecord, KpiSnapshot } from "../../api/types";
import { formatCurrency, formatNumber, formatPercent, titleize } from "../../utils/formatters";
import {
  getAverageServiceLevel,
  getAverageStockoutRisk,
  getEstimatedEmissions,
  getEstimatedProfit,
  getTransportCost,
} from "../../utils/kpiUtils";
import { MetricsCharts } from "../charts/MetricsCharts";
import { DecisionImpactPanel } from "../impact/DecisionImpactPanel";
import { SectionCard } from "../layout/SectionCard";
import { StatusBadge } from "../layout/StatusBadge";

function trend(current?: number, previous?: number) {
  if (typeof current !== "number" || typeof previous !== "number") return "n/a";
  const diff = current - previous;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`;
}

export function ImpactAnalyticsView({
  kpiHistory,
  actions,
  alerts,
}: {
  kpiHistory: KpiSnapshot[];
  actions: AnyRecord[];
  alerts: AnyRecord[];
}) {
  const latest = kpiHistory[kpiHistory.length - 1]?.kpis;
  const previous = kpiHistory[kpiHistory.length - 2]?.kpis;
  const trendCards = [
    {
      label: "Profit Trend",
      value: formatCurrency(getEstimatedProfit(latest)),
      delta: trend(getEstimatedProfit(latest), getEstimatedProfit(previous)),
    },
    {
      label: "Service Trend",
      value: formatPercent(getAverageServiceLevel(latest), 1),
      delta: trend(getAverageServiceLevel(latest), getAverageServiceLevel(previous)),
    },
    {
      label: "Stockout Risk",
      value: formatPercent(getAverageStockoutRisk(latest), 1),
      delta: trend(getAverageStockoutRisk(latest), getAverageStockoutRisk(previous)),
    },
    {
      label: "Transport + Emissions",
      value: `${formatCurrency(getTransportCost(latest))} · ${formatNumber(getEstimatedEmissions(latest), 1)}`,
      delta: "latest",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DecisionImpactPanel actions={actions} />
        <SectionCard title="KPI Trend Summary" subtitle="Quick read on whether the system is improving or worsening.">
          {kpiHistory.length < 2 ? (
            <p className="text-sm text-slate-400">No KPI history yet. Wait for polling snapshots or advance the simulation.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {trendCards.map((card) => (
                <div key={card.label} className="rounded-md border border-line bg-command p-3">
                  <p className="text-xs uppercase text-slate-500">{card.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-400">Delta {card.delta}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <MetricsCharts history={kpiHistory} />

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Recent Actions">
          {actions.length === 0 ? (
            <p className="text-sm text-slate-400">No executed actions yet.</p>
          ) : (
            <div className="space-y-2">
              {[...actions].slice(-8).reverse().map((action, index) => (
                <div key={`${action.id || action.timestamp || index}`} className="rounded-md border border-line bg-command p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <strong>{titleize(action.action_type || "action")}</strong>
                    <span className="text-xs text-slate-500">Week {action.virtual_week ?? action.time_step ?? "n/a"}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{JSON.stringify(action.payload || {}).slice(0, 180)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Alerts">
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400">No recent alerts.</p>
          ) : (
            <div className="space-y-2">
              {[...alerts].slice(-8).reverse().map((alert, index) => (
                <div key={`${alert.type || "alert"}-${index}`} className="rounded-md border border-line bg-command p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <strong>{titleize(alert.type || "alert")}</strong>
                    <StatusBadge status={alert.severity || "warning"} />
                  </div>
                  <p className="mt-1 text-slate-300">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
