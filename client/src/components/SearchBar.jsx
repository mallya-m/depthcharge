import { useState, useRef, useEffect } from "react";
import useGraphStore from "../store/useGraphStore";

export default function SearchBar({ graphRef }) {
  const { searchQuery, setSearchQuery, getSearchResults, setSelectedNode, setFocusedNode, graph } = useGraphStore();
  const [open, setOpen] = useState(false);
  const inputRef = useRef();
  const results = getSearchResults();

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest("#search-container")) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(node) {
    setSelectedNode(node);
    setFocusedNode(node);
    setSearchQuery("");
    setOpen(false);

    if (graphRef?.current) {
      setTimeout(() => graphRef.current?.zoomToFit(800, 100), 400);
    }
  }

  function handleChange(e) {
    setSearchQuery(e.target.value);
    setOpen(true);
  }

  
  const DOT = { red: "#ef4444", yellow: "#eab308", green: "#10b981", grey: "#71717a" };

  return (
    <div id="search-container" className="relative">
      {/* Search input */}
      <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 w-64 focus-within:border-emerald-500 transition">
        {/* Search icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => searchQuery && setOpen(true)}
          placeholder={graph ? "Search files..." : "Analyze a repo first"}
          disabled={!graph}
          className="bg-transparent text-white text-sm placeholder-zinc-500 outline-none w-full"
        />
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setOpen(false); }}
            className="text-zinc-500 hover:text-white text-sm leading-none"
          >✕</button>
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {results.map(node => (
            <button
              key={node.id}
              onClick={() => handleSelect(node)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition text-left"
            >
              {/* Color indicator */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: DOT[node.color] }}
              />
              <div className="flex-1 min-w-0">
                
                <p className="text-white text-xs font-medium truncate">{node.label}</p>
                
                <p className="text-zinc-500 text-xs truncate">{node.path}</p>
              </div>
              {/* In-degree badge */}
              {node.inDegree > 0 && (
                <span className="text-zinc-600 text-xs shrink-0">{node.inDegree} imports</span>
              )}
            </button>
          ))}
          {/* No results */}
          {results.length === 0 && searchQuery && (
            <p className="text-zinc-500 text-xs px-3 py-3">No files matching "{searchQuery}"</p>
          )}
        </div>
      )}
    </div>
  );
}