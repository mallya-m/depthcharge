import { useRef, useCallback, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import useGraphStore from "../store/useGraphStore";
import axios from "axios";

const NODE_COLORS = {
  red:    "#ef4444",
  yellow: "#eab308",
  green:  "#10b981",
  grey:   "#71717a",
};

export default function GraphView({ graphRef }) {
  const {
    graph, loading, error, setSelectedNode,
    cached, getFilteredGraph, focusedNode, setFocusedNode
  } = useGraphStore();

  const [is2D, setIs2D] = useState(false);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    const isAlreadyFocused = focusedNode?.id === node.id;
    setFocusedNode(isAlreadyFocused ? null : node);

    if (graphRef.current) {
      if (isAlreadyFocused) {
        setTimeout(() => graphRef.current?.zoomToFit(800, 100), 100);
      } else {
        // just fit — no manual cameraPosition, avoids the 10000x zoom bug
        setTimeout(() => graphRef.current?.zoomToFit(800, 100), 400);
      }
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
      <div className="flex flex-col items-center justify-center h-full gap-12 overflow-y-auto py-8">

        {/* Illustration */}
        <div className="flex flex-col items-center gap-4">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
            {/* Central node */}
            <circle cx="60" cy="40" r="8" fill="#10b981" opacity="0.9"/>
            {/* Surrounding nodes */}
            <circle cx="20" cy="20" r="5" fill="#10b981" opacity="0.5"/>
            <circle cx="100" cy="20" r="5" fill="#ef4444" opacity="0.6"/>
            <circle cx="15" cy="60" r="4" fill="#10b981" opacity="0.3"/>
            <circle cx="105" cy="60" r="4" fill="#10b981" opacity="0.4"/>
            <circle cx="60" cy="8" r="4" fill="#eab308" opacity="0.5"/>
            <circle cx="40" cy="68" r="3" fill="#10b981" opacity="0.3"/>
            <circle cx="85" cy="68" r="3" fill="#10b981" opacity="0.3"/>
            {/* Edges */}
            <line x1="52" y1="35" x2="24" y2="23" stroke="#3f3f46" strokeWidth="1.2"/>
            <line x1="68" y1="35" x2="96" y2="23" stroke="#3f3f46" strokeWidth="1.2"/>
            <line x1="52" y1="44" x2="18" y2="57" stroke="#3f3f46" strokeWidth="1.2"/>
            <line x1="68" y1="44" x2="102" y2="57" stroke="#3f3f46" strokeWidth="1.2"/>
            <line x1="60" y1="32" x2="60" y2="12" stroke="#3f3f46" strokeWidth="1.2"/>
            <line x1="55" y1="47" x2="42" y2="65" stroke="#3f3f46" strokeWidth="1.2"/>
            <line x1="65" y1="47" x2="83" y2="65" stroke="#3f3f46" strokeWidth="1.2"/>
          </svg>
          <p className="text-zinc-300 font-medium text-base">Paste any public GitHub repo URL to begin</p>
          <p className="text-zinc-600 text-sm">See how every file connects — imports, dependencies, circular paths</p>
        </div>

        {/* Quick launch cards */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-zinc-600 text-xs uppercase tracking-widest">Or try an example</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <ExampleCard
              url="https://github.com/expressjs/express"
              name="expressjs / express"
              description="Minimal Node.js web framework"
              files="~50 files"
              color="#10b981"
            />
            <ExampleCard
              url="https://github.com/axios/axios"
              name="axios / axios"
              description="Promise-based HTTP client"
              files="~40 files"
              color="#10b981"
            />
            <ExampleCard
              url="https://github.com/jonschlinkert/gray-matter"
              name="jonschlinkert / gray-matter"
              description="YAML front-matter parser"
              files="~15 files"
              color="#10b981"
            />
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

      {/* Camera controls */}
      <div className="absolute bottom-16 right-4 z-10 flex gap-2">
        <button
          onClick={() => setIs2D(prev => !prev)}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 text-xs px-3 py-1.5 rounded-lg transition"
        >
          {is2D ? "3D View" : "2D View"}
        </button>
        <button
          onClick={() => {
            if (!graphRef.current) return;
            // Fit all visible nodes into view
            graphRef.current.zoomToFit(800, 80);
          }}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 text-xs px-3 py-1.5 rounded-lg transition"
        >
          Fit View
        </button>
        <button
          onClick={() => {
            if (!graphRef.current) return;
            graphRef.current.cameraPosition(
              { x: 0, y: 0, z: 500 }, { x: 0, y: 0, z: 0 }, 800
            );
          }}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 text-xs px-3 py-1.5 rounded-lg transition"
        >
          Reset
        </button>
      </div>

      {/* Cached badge */}
      {cached && (
        <div className="absolute bottom-16 left-4 z-10 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs px-3 py-1 rounded-full">
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
        numDimensions={is2D ? 2 : 3}
        enablePointerInteraction={true}
        // In 2D mode fit the view once after switching
        onEngineStop={() => {
          if (is2D && graphRef.current) {
            graphRef.current.zoomToFit(400, 80);
          }
        }}
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
function ExampleCard({ url, name, description, files, color }) {
  const { setGraph, setLoading, setError, setCached, reset } = useGraphStore();

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
      setError("Failed to analyze repo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="group w-52 text-left bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all duration-200"
    >
      {/* Dot + repo name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-zinc-300 text-xs font-medium font-mono truncate">{name}</span>
      </div>

      {/* Description */}
      <p className="text-zinc-500 text-xs leading-relaxed mb-3">{description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-zinc-700 text-xs">{files}</span>
        <span className="text-zinc-600 group-hover:text-emerald-400 text-xs transition">
          Analyze
        </span>
      </div>
    </button>
  );
}