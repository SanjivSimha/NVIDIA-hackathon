import { useMemo } from "react";
import { Background, Controls, MarkerType, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { AnyRecord, GraphResponse } from "../../api/types";
import { normalizeGraph } from "../../utils/graphUtils";
import { titleize } from "../../utils/formatters";
import { SectionCard } from "../layout/SectionCard";
import { CustomSupplyNode } from "./CustomSupplyNode";

const nodeTypes = { supply: CustomSupplyNode };
const tierX: Record<number, number> = { 0: 0, 1: 280, 2: 580, 3: 900 };

const modeColors: Record<string, string> = {
  air: "#fb7185",
  truck: "#fbbf24",
  rail: "#38bdf8",
  ocean: "#60a5fa",
  local: "#34d399",
};

export function SupplyChainGraph({ graph, state, className = "" }: { graph?: GraphResponse; state?: AnyRecord; className?: string }) {
  const normalized = useMemo(() => normalizeGraph(graph, state), [graph, state]);
  const nodes: Node[] = useMemo(() => {
    const tierCounts: Record<number, number> = {};
    return (normalized.nodes || []).map((node) => {
      const tier = node.tier ?? 0;
      const index = tierCounts[tier] || 0;
      tierCounts[tier] = index + 1;
      return {
        id: node.id,
        type: "supply",
        position: { x: tierX[tier] ?? tier * 280, y: 60 + index * 145 },
        data: node,
      };
    });
  }, [normalized.nodes]);

  const edges: Edge[] = useMemo(() => (normalized.edges || []).map((edge) => {
    const delayed = edge.status !== "active" || (edge.current_delay_weeks || 0) > 0;
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: `${titleize(edge.mode)} · ${edge.transit_weeks ?? 0}w · $${edge.cost_per_unit ?? "?"}`,
      animated: delayed,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: modeColors[edge.mode || "truck"] || "#94a3b8", strokeDasharray: delayed ? "6 6" : undefined },
      labelStyle: { fill: "#cbd5e1", fontSize: 11 },
    };
  }), [normalized.edges]);

  return (
    <SectionCard title="Live Network Flow" subtitle="Follow inventory flow from sourcing -> production -> distribution -> demand channels." className={`flex flex-col ${className}`}>
      <div className="min-h-[460px] flex-1 overflow-hidden rounded-xl border border-slate-700/70 bg-command shadow-inner shadow-black/30">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.35}>
          <Background color="#24384b" gap={18} />
          <MiniMap nodeColor="#142231" maskColor="rgba(2, 6, 23, 0.72)" />
          <Controls />
        </ReactFlow>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap gap-2">
          {Object.entries(modeColors).map(([mode, color]) => (
            <span key={mode} className="inline-flex items-center gap-1 rounded-full border border-line bg-command px-2 py-1">
              <span className="h-2 w-4 rounded" style={{ backgroundColor: color }} />
              {titleize(mode)}
            </span>
          ))}
        </div>
        <p className="text-slate-500">Dashed routes indicate delay or disruption.</p>
      </div>
    </SectionCard>
  );
}
