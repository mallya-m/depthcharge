import { useState } from "react";

function App() {
  const [backendMessage, setBackendMessage] = useState("Not connected yet");

  async function pingBackend() {
    try {
      const response = await fetch("http://localhost:5000/");
      const data = await response.json();
      setBackendMessage(data.message);
    } catch (error) {
      setBackendMessage("Could not reach backend ");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">
          Depth<span className="text-emerald-400">Charge</span>
        </h1>
        <p className="text-zinc-400 mt-2">
          See your codebase the way a senior engineer sees it.
        </p>

        <button
          onClick={pingBackend}
          className="mt-6 px-4 py-2 bg-emerald-500 text-zinc-950 font-medium rounded-lg hover:bg-emerald-400 transition"
        >
          Ping backend
        </button>

        <p className="text-zinc-500 mt-4 text-sm">{backendMessage}</p>
      </div>
    </div>
  );
}

export default App;