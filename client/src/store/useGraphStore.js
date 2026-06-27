import { create } from "zustand";

const useGraphStore = create((set, get) => ({
  graph: null,
  loading: false,
  error: null,
  selectedNode: null,
  cached: false,
  focusedNode: null, 
  searchQuery: "",   

  activeFilters: {
    red: true,
    yellow: true,
    green: true,
    grey: true,
  },

  getFilteredGraph: () => {
    const { graph, activeFilters, focusedNode } = get();
    if (!graph) return null;

    let visibleNodes = graph.nodes.filter(n => activeFilters[n.color]);

    // Focus mode — if a node is focused, only show it + its direct neighbors
    if (focusedNode) {
      const neighborIds = new Set();
      neighborIds.add(focusedNode.id);
      graph.links.forEach(link => {
        if (link.source === focusedNode.id || link.source?.id === focusedNode.id) {
          neighborIds.add(link.target?.id || link.target);
        }
        if (link.target === focusedNode.id || link.target?.id === focusedNode.id) {
          neighborIds.add(link.source?.id || link.source);
        }
      });
      visibleNodes = visibleNodes.filter(n => neighborIds.has(n.id));
    }

    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const visibleLinks = graph.links.filter(link => {
      const src = link.source?.id || link.source;
      const tgt = link.target?.id || link.target;
      return visibleIds.has(src) && visibleIds.has(tgt);
    });

    return { ...graph, nodes: visibleNodes, links: visibleLinks };
  },

  getSearchResults: () => {
    const { graph, searchQuery } = get();
    if (!graph || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return graph.nodes
      .filter(n => n.path.toLowerCase().includes(q))
      .slice(0, 8); // max 8 results
  },

  setGraph: (graph) => set({ graph }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setCached: (cached) => set({ cached }),
  setFocusedNode: (node) => set({ focusedNode: node }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleFilter: (color) =>
    set(state => ({
      activeFilters: {
        ...state.activeFilters,
        [color]: !state.activeFilters[color],
      },
    })),

  reset: () => set({
    graph: null,
    loading: false,
    error: null,
    selectedNode: null,
    cached: false,
    focusedNode: null,
    searchQuery: "",
    activeFilters: { red: true, yellow: true, green: true, grey: true },
  }),
}));

export default useGraphStore;