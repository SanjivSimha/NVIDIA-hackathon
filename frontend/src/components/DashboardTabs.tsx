import { BarChart3, Bot, Network } from "lucide-react";

export type DashboardView = "operations" | "agents" | "analytics";

const tabs: Array<{ id: DashboardView; label: string; subtitle: string; icon: typeof Network }> = [
  {
    id: "operations",
    label: "Operations",
    subtitle: "Live supply chain state, inventory, alerts, and simulation controls.",
    icon: Network,
  },
  {
    id: "agents",
    label: "Agent Decisions",
    subtitle: "Red proposes, Blue critiques, Executor acts, Narrator explains.",
    icon: Bot,
  },
  {
    id: "analytics",
    label: "Impact & Analytics",
    subtitle: "KPI trends, tradeoffs, and before/after decision impact.",
    icon: BarChart3,
  },
];

export function DashboardTabs({ activeView, onChange }: { activeView: DashboardView; onChange: (view: DashboardView) => void }) {
  const active = tabs.find((tab) => tab.id === activeView) || tabs[0];
  return (
    <div className="mb-5">
      <div className="grid gap-2 rounded-xl border border-line bg-panel p-2 shadow-xl shadow-black/20 md:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = tab.id === activeView;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                selected
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-50"
                  : "border-transparent bg-command/60 text-slate-300 hover:border-slate-600 hover:bg-panelSoft"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
              <span className="mt-1 block text-xs text-slate-400">{tab.subtitle}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-slate-400">{active.subtitle}</p>
    </div>
  );
}
