
import useGraphStore from "../store/useGraphStore";

const COLOR_META = {
  red:    { label: "God File",     bg: "bg-red-500/20",    text: "text-red-400",    border: "border-red-500/30" },
  yellow: { label: "Circular Dep", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  green:  { label: "Clean",        bg: "bg-emerald-500/20",text: "text-emerald-400",border: "border-emerald-500/30" },
  grey:   { label: "Isolated",     bg: "bg-zinc-500/20",   text: "text-zinc-400",   border: "border-zinc-500/30" },
};

export default function NodePanel() {
  const { selectedNode, graph, setSelectedNode } = useGraphStore();

  if (!selectedNode) return null;

  const importedBy = graph?.links
    ?.filter((link) => link.target === selectedNode.id)
    ?.map((link) => link.source) || [];

  const meta = COLOR_META[selectedNode.color] || COLOR_META.green;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 z-20 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-white font-semibold text-sm">File Details</h2>
        {/* Close button */}
        <button
          onClick={() => setSelectedNode(null)}
          className="text-zinc-500 hover:text-white text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Filename */}
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">File</p>
          <p className="text-white text-sm font-mono break-all">{selectedNode.path}</p>
        </div>

        {/* Type badge */}
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Type</p>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${meta.bg} ${meta.text} ${meta.border}`}>
            {meta.label}
          </span>
        </div>

        {/* Complexity score */}
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Complexity Score</p>
          <p className={`text-2xl font-bold ${meta.text}`}>{selectedNode.complexity}</p>
        </div>

        {/* Connections */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-zinc-500 text-xs mb-1">Imports</p>
            <p className="text-white font-bold text-xl">{selectedNode.outDegree}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-zinc-500 text-xs mb-1">Imported by</p>
            <p className="text-white font-bold text-xl">{selectedNode.inDegree}</p>
          </div>
        </div>

        
        {selectedNode.imports?.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Imports</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {selectedNode.imports.map((imp) => (
                <p key={imp} className="text-zinc-400 text-xs font-mono bg-zinc-800 px-2 py-1 rounded">
                  {imp}
                </p>
              ))}
            </div>
          </div>
        )}

        
        {importedBy.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Imported By</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {importedBy.map((imp) => (
                <p key={imp} className="text-zinc-400 text-xs font-mono bg-zinc-800 px-2 py-1 rounded">
                  {imp}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}