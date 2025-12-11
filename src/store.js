import { create } from "zustand";
import { generateId } from "./utils/math";

export const useStore = create((set, get) => ({
  // --- State ---
  nodes: [
    {
      id: "node-1",
      x: 100,
      y: 100,
      title: "Input Red",
      type: "source",
      data: { color: "#ff0000" },
    },
    {
      id: "node-2",
      x: 400,
      y: 150,
      title: "Mixer",
      type: "process",
      data: { result: "" },
    },
  ],
  connections: [],
  selectedNodes: new Set(),
  selectedConnection: null,
  clipboard: [],

  // --- Actions (原子操作，永远读取最新 State) ---

  // 1. 节点操作
  addNode: (x, y, type) => {
    const newNode = {
      id: generateId("node"),
      x,
      y,
      type,
      title: type === "source" ? "Color Input" : "Mixer",
      data: type === "source" ? { color: "#ffffff" } : { result: "" },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNodePosition: (id, x, y) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }));
  },

  updateNodeColor: (id, color) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, color } } : n
      ),
    }));
  },

  // 2. 选中操作
  selectNode: (id, multi = false) => {
    set((state) => {
      const newSet = new Set(multi ? state.selectedNodes : null);
      if (multi) {
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
      } else {
        newSet.add(id);
      }
      return { selectedNodes: newSet, selectedConnection: null };
    });
  },

  selectConnection: (id) => {
    set({ selectedConnection: id, selectedNodes: new Set() });
  },

  clearSelection: () => {
    set({ selectedNodes: new Set(), selectedConnection: null });
  },

  // 批量设置选中（用于框选）
  setSelectionBox: (nodeIds) => {
    set({ selectedNodes: new Set(nodeIds), selectedConnection: null });
  },

  // 3. 连线操作
  addConnection: (from, to) => {
    const { connections } = get();
    // 防止重复和自连
    if (from === to) return;
    if (connections.some((c) => c.from === from && c.to === to)) return;

    set((state) => ({
      connections: [...state.connections, { id: generateId("conn"), from, to }],
    }));
  },

  // 4. 删除操作 (核心修复：Store 内部处理，无需组件操心)
  deleteSelected: () => {
    set((state) => {
      const { selectedNodes, selectedConnection, nodes, connections } = state;

      let newNodes = [...nodes];
      let newConnections = [...connections];

      if (selectedConnection) {
        newConnections = newConnections.filter(
          (c) => c.id !== selectedConnection
        );
      }

      if (selectedNodes.size > 0) {
        newNodes = newNodes.filter((n) => !selectedNodes.has(n.id));
        newConnections = newConnections.filter(
          (c) => !selectedNodes.has(c.from) && !selectedNodes.has(c.to)
        );
      }

      return {
        nodes: newNodes,
        connections: newConnections,
        selectedNodes: new Set(),
        selectedConnection: null,
      };
    });
  },

  // 5. 复制粘贴 (核心修复)
  copySelection: () => {
    const { nodes, selectedNodes } = get();
    const toCopy = nodes.filter((n) => selectedNodes.has(n.id));
    set({ clipboard: toCopy });
    console.log("Copied:", toCopy.length);
  },

  pasteSelection: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;

    const newNodes = [];
    const newSelection = new Set();

    clipboard.forEach((node) => {
      const newId = generateId("node");
      newNodes.push({ ...node, id: newId, x: node.x + 30, y: node.y + 30 });
      newSelection.add(newId);
    });

    set((state) => ({
      nodes: [...state.nodes, ...newNodes],
      selectedNodes: newSelection,
    }));
  },
}));
