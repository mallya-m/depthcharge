import { useRef } from "react";
import InputBar from "./components/InputBar";
import GraphView from "./components/GraphView";
import NodePanel from "./components/NodePanel";
import StatsSidebar from "./components/StatsSidebar";
import FilterPanel from "./components/FilterPanel";
import Legend from "./components/Legend";

export default function App() {
  // graphRef lives here so both InputBar (search) and GraphView (click) can use it
  const graphRef = useRef();

  return (
    <div className="h-screen bg-zinc-950 overflow-hidden">
      <InputBar graphRef={graphRef} />
      <StatsSidebar />
      <div className="h-full pt-16 pl-64">
        <GraphView graphRef={graphRef} />
      </div>
      <NodePanel />
      <FilterPanel />
      <Legend />
    </div>
  );
}