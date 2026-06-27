
import { useState } from "react";
import axios from "axios";
import useGraphStore from "../store/useGraphStore";

const BACKEND_URL = "http://localhost:5000";

export default function InputBar() {
  const [url, setUrl] = useState("");
  const { setGraph, setLoading, setError, setCached, reset } = useGraphStore();

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
    
    <div className="fixed top-0 left-0 right-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-4xl mx-auto flex gap-3 items-center">
        {/* Logo */}
        <span className="text-white font-bold text-lg shrink-0">
          Depth<span className="text-emerald-400">Charge</span>
        </span>

        {/* URL input */}
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://github.com/owner/repo"
          className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
        />

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-5 py-2 rounded-lg text-sm transition"
        >
          Analyze
        </button>
      </div>
    </div>
  );
}