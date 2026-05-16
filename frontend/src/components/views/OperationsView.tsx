import type { OptimizationProfile, AnyRecord } from "../../api/types";
import { AlertsPanel } from "../alerts/AlertsPanel";
import { OptimizationPreferences } from "../controls/OptimizationPreferences";
import { SimulationControls } from "../controls/SimulationControls";
import { SupplyChainGraph } from "../graph/SupplyChainGraph";
import { InTransitPanel } from "../inventory/InTransitPanel";
import { InventoryPanel } from "../inventory/InventoryPanel";
import { KpiGrid } from "../kpis/KpiGrid";
import { PreferenceFitScore } from "../kpis/PreferenceFitScore";
import { ActivityTimeline } from "../timeline/ActivityTimeline";

export function OperationsView({
  data,
  profile,
  selectProfile,
}: {
  data: AnyRecord;
  profile: OptimizationProfile;
  selectProfile: (name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid items-stretch gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8 2xl:col-span-9">
          <SupplyChainGraph graph={data.graph} state={data.state} className="h-full" />
        </div>
        <aside className="grid gap-4 xl:col-span-4 xl:grid-rows-[auto_minmax(0,1fr)_auto] 2xl:col-span-3">
          <SimulationControls refresh={data.refresh} />
          <PreferenceFitScore kpis={data.kpis} profile={profile} />
          <OptimizationPreferences profile={profile} onSelect={selectProfile} />
        </aside>
      </div>

      <KpiGrid kpis={data.kpis} previousKpis={data.previousKpis} />

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <AlertsPanel kpis={data.kpis} alerts={data.alerts} />
        </div>
        <div>
          <InTransitPanel state={data.state} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <InventoryPanel state={data.state} kpis={data.kpis} />
        </div>
        <div className="xl:col-span-7">
          <ActivityTimeline actions={data.actions} events={data.events} alerts={data.alerts} />
        </div>
      </div>
    </div>
  );
}
