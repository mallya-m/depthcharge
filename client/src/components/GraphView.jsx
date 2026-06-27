import { useRef, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import useGraphStore from "../store/useGraphStore";
import axios from "axios";

const NODE_COLORS = {
  red:    "#ef4444",
  yellow: "#eab308",
  green:  "#10b981",
  grey:   "#71717a",
};

export default function GraphView() {
  const {
    graph, loading, error, setSelectedNode,
    cached, getFilteredGraph, focusedNode, setFocusedNode
  } = useGraphStore();

  const graphRef = useRef();

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setFocusedNode(focusedNode?.id === node.id ? null : node);

    if (graphRef.current) {
      graphRef.current.cameraPosition(
        { x: node.x * 1.5, y: node.y * 1.5, z: node.z * 1.5 },
        node,
        1000
      );
    }
  }, [setSelectedNode, setFocusedNode, focusedNode]);

  const filteredGraph = getFilteredGraph();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Crawling repository...</p>
          <p className="text-zinc-600 text-xs mt-1">This may take 10-30 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-zinc-600 text-xs mt-2">Check the URL and try again</p>
        </div>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <circle cx="4" cy="6" r="2"/>
              <circle cx="20" cy="6" r="2"/>
              <circle cx="4" cy="18" r="2"/>
              <circle cx="20" cy="18" r="2"/>
              <line x1="6" y1="6" x2="10" y2="11"/>
              <line x1="18" y1="6" x2="14" y2="11"/>
              <line x1="6" y1="18" x2="10" y2="13"/>
              <line x1="18" y1="18" x2="14" y2="13"/>
            </svg>
          </div>
          <p className="text-zinc-300 font-medium">Visualize any codebase</p>
          <p className="text-zinc-500 text-sm">Paste a public GitHub URL above and hit Analyze</p>
          <div className="flex gap-2 justify-center mt-4">
            <ExampleBadge url="https://github.com/expressjs/express" />
            <ExampleBadge url="https://github.com/axios/axios" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">

      {/* Focus mode banner */}
      {focusedNode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-zinc-900/90 backdrop-blur border border-emerald-500/30 rounded-full px-4 py-2">
          <span className="text-emerald-400 text-xs font-medium">
            Focus: {focusedNode.label}
          </span>
          <span className="text-zinc-600 text-xs">
            {filteredGraph?.nodes.length} connected files
          </span>
          <button
            onClick={() => setFocusedNode(null)}
            className="text-zinc-500 hover:text-white text-xs ml-1"
          >
            Exit focus ✕
          </button>
        </div>
      )}

      {/* Reset camera */}
      <button
        onClick={() => graphRef.current?.cameraPosition(
          { x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 1000
        )}
        className="absolute top-4 right-4 z-10 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 text-xs px-3 py-1.5 rounded-lg transition"
      >
        Reset Camera
      </button>

      {/* Cached badge */}
      {cached && (
        <div className="absolute top-4 left-4 z-10 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs px-3 py-1 rounded-full">
          Cached result
        </div>
      )}

      {/* Stats bar */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-3">
        <StatBadge label="Files" value={graph.stats.totalFiles} />
        <StatBadge label="Links" value={graph.stats.totalLinks} />
        <StatBadge
          label="Health"
          value={`${graph.stats.healthScore}%`}
          color="text-emerald-400"
        />
        {graph.stats.circularDeps.length > 0 && (
          <StatBadge
            label="Circular"
            value={graph.stats.circularDeps.length}
            color="text-yellow-400"
          />
        )}
        {focusedNode && (
          <StatBadge
            label="Showing"
            value={`${filteredGraph?.nodes.length} nodes`}
            color="text-emerald-400"
          />
        )}
      </div>

      <ForceGraph3D
        ref={graphRef}
        graphData={{
          nodes: filteredGraph?.nodes || [],
          links: filteredGraph?.links || [],
        }}
        nodeId="id"
        nodeLabel={(node) =>
          `<div style="background:#18181b;border:1px solid #3f3f46;padding:8px 12px;border-radius:8px;font-family:monospace;font-size:12px;color:white;max-width:220px">
            <div style="color:#10b981;margin-bottom:4px;font-weight:600">${node.label}</div>
            <div style="color:#71717a;margin-bottom:2px">${node.path}</div>
            <div style="color:#52525b">In: ${node.inDegree} · Out: ${node.outDegree} · Score: ${node.complexity}</div>
          </div>`
        }
        nodeColor={(node) => NODE_COLORS[node.color] || NODE_COLORS.green}
        nodeVal={(node) => Math.max(1, node.inDegree + 1)}
        linkColor={() => "#3f3f46"}
        linkOpacity={0.6}
        linkWidth={1}
        backgroundColor="#09090b"
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => {
          document.body.style.cursor = node ? "pointer" : "default";
        }}
        enableNodeDrag={true}
        enableNavigationControls={true}
        linkDirectionalParticles={(link) => {
          const src = link.source?.id || link.source;
          const sourceNode = graph.nodes.find(n => n.id === src);
          return sourceNode?.isGod || sourceNode?.isCircular ? 3 : 0;
        }}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => "#10b981"}
      />
    </div>
  );
}

// Pass graphRef up to App so InputBar's SearchBar can also use it
GraphView.displayName = "GraphView";

function StatBadge({ label, value, color = "text-white" }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-lg px-3 py-2">
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className={`font-bold text-sm ${color}`}>{value}</p>
    </div>
  );
}

function ExampleBadge({ url }) {
  const { setGraph, setLoading, setError, setCached, reset } = useGraphStore();
  const name = url.split("/").pop();

  async function handleClick() {
    reset();
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/crawl`,
        { repoUrl: url }
      );
      setGraph(response.data.graph);
      setCached(response.data.cached);
    } catch {
      setError("Failed to analyze");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 rounded-lg transition"
    >
      Try {name}
    </button>
  );
}