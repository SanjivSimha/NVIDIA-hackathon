import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { createAgentEpisode } from "../../api/client";
import type { AnyRecord, AgentEvent } from "../../api/types";
import { useAgentData } from "../../hooks/useAgentData";
import { titleize } from "../../utils/formatters";
import { AgentEventCard } from "../AgentEventCard";
import { DecisionImpactPanel } from "../impact/DecisionImpactPanel";
import { SectionCard } from "../layout/SectionCard";
import { StatusBadge } from "../layout/StatusBadge";

const stages = [
  { key: "RED_PLAN", label: "Red Agent Plan" },
  { key: "BLUE_ASSESSMENT", label: "Blue Assessment" },
  { key: "BLUE_REVISED_PLAN", label: "Blue Revised Plan" },
  { key: "EXECUTOR_ACTION", label: "Executor Action" },
  { key: "EXECUTION_RESULT", label: "Execution Result" },
  { key: "KPI_EVALUATION", label: "KPI Evaluation" },
  { key: "NARRATION", label: "Narration" },
];

export function AgentDecisionsView({ actions }: { actions: AnyRecord[] }) {
  const agentData = useAgentData();
  const [creating, setCreating] = useState(false);
  const selectedEpisode = useMemo(
    () => agentData.episodes.find((episode) => episode.id === agentData.selectedEpisodeId),
    [agentData.episodes, agentData.selectedEpisodeId],
  );
  const eventsByType = useMemo(() => {
    const map: Record<string, AgentEvent[]> = {};
    agentData.timelineEvents.forEach((event) => {
      map[event.event_type] = [...(map[event.event_type] || []), event];
    });
    return map;
  }, [agentData.timelineEvents]);

  async function createManualEpisode() {
    setCreating(true);
    try {
      const episode = await createAgentEpisode({
        simulation_id: "default",
        trigger: { type: "manual", summary: "Manual agent review requested from dashboard." },
        user_preferences: {
          profile: "balanced",
          weights: { profit: 0.25, service: 0.35, cost: 0.25, emissions: 0.15 },
        },
      });
      agentData.setSelectedEpisodeId(episode.id);
      await agentData.refresh();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <aside className="space-y-4">
        <SectionCard title="Episodes" subtitle="Select the decision story to inspect.">
          <button
            onClick={createManualEpisode}
            disabled={creating}
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-400/50 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> New Episode
          </button>
          {agentData.episodes.length === 0 ? (
            <p className="rounded-md border border-line bg-command p-3 text-sm text-slate-400">No episodes yet.</p>
          ) : (
            <div className="space-y-2">
              {agentData.episodes.map((episode) => {
                const active = episode.id === agentData.selectedEpisodeId;
                return (
                  <button
                    key={episode.id}
                    onClick={() => agentData.setSelectedEpisodeId(episode.id)}
                    className={`w-full rounded-md border p-3 text-left text-sm ${
                      active ? "border-emerald-400/60 bg-emerald-500/15" : "border-line bg-command hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-slate-100">{episode.id}</strong>
                      <StatusBadge status={episode.status || "active"} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">{episode.trigger?.summary || "No trigger summary"}</p>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>
      </aside>

      <main className="space-y-4">
        <SectionCard title="Selected Episode" subtitle="A readable decision story, not a raw log.">
          {!selectedEpisode ? (
            <p className="text-sm text-slate-400">No agent episode selected. Create or select an episode to see Red, Blue, and Executor-Narrator reasoning.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-md border border-line bg-command p-3">
                  <p className="text-xs uppercase text-slate-500">Problem</p>
                  <p className="mt-1 text-sm text-slate-200">{selectedEpisode.trigger?.summary || "No trigger summary"}</p>
                </div>
                <div className="rounded-md border border-line bg-command p-3">
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <div className="mt-2"><StatusBadge status={selectedEpisode.status || "active"} /></div>
                </div>
                <div className="rounded-md border border-line bg-command p-3">
                  <p className="text-xs uppercase text-slate-500">Created</p>
                  <p className="mt-1 text-sm text-slate-200">{selectedEpisode.created_at ? new Date(selectedEpisode.created_at).toLocaleString() : "n/a"}</p>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-5">
                {["RED_PLAN", "BLUE_ASSESSMENT", "BLUE_REVISED_PLAN", "EXECUTOR_ACTION", "NARRATION"].map((step) => {
                  const complete = Boolean(eventsByType[step]?.length);
                  return (
                    <div key={step} className={`rounded-md border p-2 text-center text-xs ${complete ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100" : "border-line bg-command text-slate-500"}`}>
                      <span className="inline-flex items-center gap-1">
                        {complete ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        {agentData.error && <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">{agentData.error}</p>}
        {agentData.loading && <p className="rounded-md border border-line bg-panel p-3 text-sm text-slate-300">Loading agent decisions...</p>}

        <div className="grid gap-4 2xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {stages.map((stage) => {
              const stageEvents = eventsByType[stage.key] || [];
              return (
                <SectionCard key={stage.key} title={stage.label}>
                  {stageEvents.length === 0 ? (
                    <p className="text-sm text-slate-500">No {titleize(stage.key)} event submitted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {stageEvents.map((event) => <AgentEventCard key={event.id} event={event} />)}
                    </div>
                  )}
                </SectionCard>
              );
            })}
          </div>
          <div className="space-y-4">
            <DecisionImpactPanel actions={actions} />
          </div>
        </div>
      </main>
    </div>
  );
}
