import React from "react";

export default function Node({
  node,
  selected,
  result,
  onMouseDown,
  updateColor,
  onHandleMouseDown,
  onHandleMouseUp,
  onContextMenu,
}) {
  const getResultStyle = () => {
    if (!result || result.length === 0) return { background: "#222" };
    if (result.length === 1) return { background: result[0] };
    return { background: `linear-gradient(90deg, ${result.join(", ")})` };
  };

  return (
    <div
      style={{ left: node.x, top: node.y }}
      className={`
        absolute w-[180px] rounded-lg border z-10 text-white select-none
        ${
          selected
            ? "border-highlight shadow-node-selected"
            : "border-gray-600 bg-node-bg shadow-node-default"
        }
      `}
      // ⚠️ 关键：移除 transition-all，否则拖拽会有延迟感
      onContextMenu={(e) => onContextMenu(e, "node", node.id)}
    >
      {/* Header */}
      <div
        className="cursor-move rounded-t-lg bg-zinc-700 px-3 py-2 text-sm font-bold border-b border-gray-600 hover:bg-zinc-600"
        onMouseDown={(e) => onMouseDown(e, node.id)}
      >
        {node.title}
      </div>

      {/* Body */}
      <div className="p-3 text-xs text-gray-400 min-h-[40px] bg-node-bg rounded-b-lg">
        {node.type === "source" ? (
          <input
            type="color"
            value={node.data.color}
            onChange={(e) => updateColor(node.id, e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-8 cursor-pointer rounded bg-transparent"
          />
        ) : (
          <div
            style={getResultStyle()}
            className="h-10 w-full rounded border border-dashed border-gray-600 flex items-center justify-center font-bold text-shadow"
          >
            {result?.length > 1 ? "Mixed!" : !result?.length ? "Wait..." : ""}
          </div>
        )}
      </div>

      {/* Handles */}
      {node.type !== "source" && (
        <div
          className="absolute -left-[9px] top-[47px] w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-500 hover:scale-125 hover:bg-green-400 border-pink-500 cursor-crosshair z-20"
          onMouseUp={(e) => onHandleMouseUp(e, node.id)}
        />
      )}
      <div
        className="absolute -right-[9px] top-[47px] w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-500 hover:scale-125 hover:bg-green-400 border-blue-400 cursor-crosshair z-20"
        onMouseDown={(e) => onHandleMouseDown(e, node.id)}
      />
    </div>
  );
}
