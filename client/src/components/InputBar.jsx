import { useState } from "react";
import axios from "axios";
import useGraphStore from "../store/useGraphStore";
import SearchBar from "./SearchBar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function InputBar({ graphRef }) {
  const [url, setUrl] = useState("");
  const { setGraph, setLoading, setError, setCached, reset, loading } = useGraphStore();

  async function handleAnalyze() {
    if (!url.trim()) return;
    reset();
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/github/crawl`, {
        repoUrl: url.trim(),
      });
      setGraph(response.data.graph);
      setCached(response.data.cached);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze repo");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleAnalyze();
  }

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
      <div className="flex gap-3 items-center">
        {/* Logo */}
        <span className="text-white font-bold text-lg shrink-0">
          Depth<span className="text-emerald-400">Charge</span>
        </span>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://github.com/owner/repo"
          className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`shrink-0 font-semibold px-5 py-2 rounded-lg text-sm transition ${
            loading
              ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {/* Search only shows after a repo is loaded */}
        <SearchBarConditional graphRef={graphRef} />
      </div>
    </div>
  );
}
function SearchBarConditional({ graphRef }) {
  const { graph } = useGraphStore();
  if (!graph) return null;
  return (
    <>
      <div className="w-px h-6 bg-zinc-700 shrink-0" />
      <SearchBar graphRef={graphRef} />
    </>
  );
}