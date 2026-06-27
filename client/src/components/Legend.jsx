
import useGraphStore from "../store/useGraphStore";

const ITEMS = [
  { color: "#ef4444", label: "God file" },
  { color: "#eab308", label: "Circular dep" },
  { color: "#10b981", label: "Clean" },
  { color: "#71717a", label: "Isolated" },
];

export default function Legend() {
  const { graph } = useGraphStore();
  if (!graph) return null;

  return (
    <div className="absolute top-4 right-4 z-10 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-lg p-3">
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Legend</p>
      <div className="space-y-1.5">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-zinc-400 text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}