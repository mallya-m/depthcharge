
import { create } from "zustand";

const useGraphStore = create((set) => ({
  graph: null,

  loading: false,

  error: null,

  selectedNode: null,
  cached: false,

  setGraph: (graph) => set({ graph }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setCached: (cached) => set({ cached }),

  reset: () => set({
    graph: null,
    loading: false,
    error: null,
    selectedNode: null,
    cached: false,
  }),
}));

export default useGraphStore;