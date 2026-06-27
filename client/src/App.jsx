
import InputBar from "./components/InputBar";
import GraphView from "./components/GraphView";
import NodePanel from "./components/NodePanel";

export default function App() {
  return (
    <div className="h-screen bg-zinc-950 overflow-hidden">

      <InputBar />

      <div className="h-full pt-16">
        <GraphView />
      </div>

      <NodePanel />

    </div>
  );
}