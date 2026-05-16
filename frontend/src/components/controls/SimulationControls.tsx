import { useState } from "react";
import { Play, RotateCcw, RefreshCcw, Square, StepForward } from "lucide-react";
import { resetSimulation, startSimulation, stopSimulation, tickSimulation } from "../../api/client";
import { SectionCard } from "../layout/SectionCard";

export function SimulationControls({ refresh }: { refresh: () => Promise<void> }) {
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  async function run(label: string, action: () => Promise<unknown>) {
    setBusy(label);
    setError(undefined);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Command failed");
    } finally {
      setBusy(undefined);
    }
  }

  const button = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-command px-3 text-sm font-medium text-slate-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/10 disabled:cursor-wait disabled:opacity-60";
  const primary = "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-wait disabled:opacity-60";

  return (
    <SectionCard title="Command Panel" subtitle="Advance, pause, or reset the live world model.">
      <div className="space-y-2">
        <button className={`${primary} w-full`} disabled={!!busy} onClick={() => run("start", startSimulation)}><Play className="h-4 w-4" />Start Simulation</button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className={button} disabled={!!busy} onClick={() => run("stop", stopSimulation)}><Square className="h-4 w-4" />Stop</button>
        <button className={button} disabled={!!busy} onClick={() => run("tick", tickSimulation)}><StepForward className="h-4 w-4" />Tick</button>
        <button className={button} disabled={!!busy} onClick={() => run("reset", resetSimulation)}><RotateCcw className="h-4 w-4" />Reset</button>
        <button className={button} disabled={!!busy} onClick={() => run("refresh", refresh)}><RefreshCcw className="h-4 w-4" />Refresh</button>
      </div>
      {busy && <p className="mt-3 text-xs text-slate-400">Running {busy}...</p>}
      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </SectionCard>
  );
}
