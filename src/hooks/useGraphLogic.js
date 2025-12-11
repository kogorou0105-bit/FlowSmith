import { useMemo } from "react";

export function useGraphLogic(nodes, connections) {
  return useMemo(() => {
    const results = {};

    const getNodeColors = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) return [];
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return [];

      if (node.type === "source") return [node.data.color];

      const inputs = connections.filter((c) => c.to === nodeId);
      let colors = [];
      inputs.forEach((conn) => {
        colors = [...colors, ...getNodeColors(conn.from, new Set(visited))];
      });
      return colors;
    };

    nodes.forEach((node) => {
      if (node.type === "process") {
        results[node.id] = getNodeColors(node.id);
      }
    });

    return results;
  }, [nodes, connections]);
}
