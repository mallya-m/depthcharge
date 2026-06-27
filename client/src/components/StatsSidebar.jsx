import { motion, AnimatePresence } from "framer-motion";
import useGraphStore from "../store/useGraphStore";

export default function StatsSidebar() {
  const { graph } = useGraphStore();

  if (!graph) return null;

  const { stats } = graph;

  return (
    <AnimatePresence>
      <div
        className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-800 overflow-y-auto"
      >
        <div className="p-4 space-y-5">

          {/* Health Score */}
          <Section title="Health Score">
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${scoreColor(stats.healthScore)}`}>
                {stats.healthScore}
              </span>
              <span className="text-zinc-500 text-sm mb-1">/ 100</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.healthScore}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-1.5 rounded-full ${scoreBg(stats.healthScore)}`}
              />
            </div>
          </Section>

          {/* Overview numbers */}
          <Section title="Overview">
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Files" value={stats.totalFiles} />
              <MiniStat label="Links" value={stats.totalLinks} />
              <MiniStat label="God Files" value={stats.godFiles.length} color="text-red-400" />
              <MiniStat label="Circular" value={stats.circularDeps.length} color="text-yellow-400" />
            </div>
          </Section>

          {/* Top 5 most connected files */}
          <Section title="Most Connected">
            {stats.topConnected.length === 0 ? (
              <p className="text-zinc-600 text-xs">None found</p>
            ) : (
              <div className="space-y-2">
                {stats.topConnected.map((file, i) => (
                  <div key={file.path} className="flex items-center gap-2">
                    {/* Rank number */}
                    <span className="text-zinc-600 text-xs w-4 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-xs font-mono truncate">{file.path}</p>
                      <p className="text-zinc-600 text-xs">{file.inDegree} imports</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* God files list */}
          {stats.godFiles.length > 0 && (
            <Section title="God Files">
              <div className="space-y-1">
                {stats.godFiles.map((path) => (
                  <p key={path} className="text-red-400 text-xs font-mono bg-red-500/10 px-2 py-1 rounded truncate">
                    {path}
                  </p>
                ))}
              </div>
            </Section>
          )}

          {/* Circular dependencies list */}
          {stats.circularDeps.length > 0 && (
            <Section title="Circular Dependencies">
              <div className="space-y-2">
                {stats.circularDeps.slice(0, 5).map((cycle, i) => (
                  <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                    {cycle.map((path, j) => (
                      <p key={path} className="text-yellow-400 text-xs font-mono truncate">
                        {j > 0 && <span className="text-zinc-600">↳ </span>}
                        {path.split("/").pop()}
                      </p>
                    ))}
                  </div>
                ))}
                {stats.circularDeps.length > 5 && (
                  <p className="text-zinc-600 text-xs">+{stats.circularDeps.length - 5} more</p>
                )}
              </div>
            </Section>
          )}

          {/* Isolated files */}
          {stats.isolatedFiles.length > 0 && (
            <Section title="Isolated Files">
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {stats.isolatedFiles.map((path) => (
                  <p key={path} className="text-zinc-500 text-xs font-mono truncate">{path}</p>
                ))}
              </div>
            </Section>
          )}

        </div>
      </div>
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3 font-medium">
        {title}
      </p>
      {children}
    </div>
  );
}

function MiniStat({ label, value, color = "text-white" }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-2.5">
      <p className="text-zinc-500 text-xs mb-0.5">{label}</p>
      <p className={`font-bold text-lg ${color}`}>{value}</p>
    </div>
  );
}

function scoreColor(score) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function scoreBg(score) {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 50) return "bg-yellow-400";
  return "bg-red-400";
}