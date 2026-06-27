import { useRef } from "react";
import InputBar from "./components/InputBar";
import GraphView from "./components/GraphView";
import NodePanel from "./components/NodePanel";
import StatsSidebar from "./components/StatsSidebar";
import FilterPanel from "./components/FilterPanel";
import Legend from "./components/Legend";

export default function App() {
  const graphRef = useRef();

  return (
    <div className="h-screen bg-zinc-950 overflow-hidden flex flex-col">

      {/* Top bar — fixed height */}
      <div className="shrink-0">
        <InputBar graphRef={graphRef} />
      </div>

      {/* Body row — sidebar + graph side by side */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <StatsSidebar />

        {/* Graph — fills remaining space */}
        <div className="flex-1 relative overflow-hidden">
          <GraphView graphRef={graphRef} />
          <Legend />
        </div>

        {/* Right node panel */}
        <NodePanel />

      </div>

      {/* Bottom filter bar */}
      <FilterPanel />

    </div>
  );
}