// FilterPanel.jsx
// Floating panel of toggle buttons to show/hide node types

import { motion, AnimatePresence } from "framer-motion";
import useGraphStore from "../store/useGraphStore";

const FILTERS = [
  { color: "red",    label: "God Files",     hex: "#ef4444", description: "Imported by 10+ files" },
  { color: "yellow", label: "Circular Deps", hex: "#eab308", description: "Part of an import cycle" },
  { color: "green",  label: "Clean",         hex: "#10b981", description: "No issues detected" },
  { color: "grey",   label: "Isolated",      hex: "#71717a", description: "No imports or importers" },
];

export default function FilterPanel() {
  const { graph, activeFilters, toggleFilter } = useGraphStore();

  if (!graph) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        // Floating panel — bottom center of the screen
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex gap-2 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl px-4 py-3 shadow-xl">
          {FILTERS.map((filter) => {
            const isActive = activeFilters[filter.color];
            // Count how many nodes of this type exist
            const count = graph.nodes.filter((n) => n.color === filter.color).length;

            return (
              <button
                key={filter.color}
                onClick={() => toggleFilter(filter.color)}
                title={filter.description}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800/50 text-zinc-600"
                }`}
              >
                {/* Color dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: isActive ? filter.hex : "#3f3f46",
                  }}
                />
                {filter.label}
                {/* Count badge */}
                <span className={`${isActive ? "text-zinc-400" : "text-zinc-700"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}