import React from "react";
import { calculateBezier } from "../utils/math";

export default function Connection({
  conn,
  nodes,
  isSelected,
  onSelect,
  onContextMenu,
}) {
  const from = nodes.find((n) => n.id === conn.from);
  const to = nodes.find((n) => n.id === conn.to);
  if (!from || !to) return null;

  const start = { x: from.x + 180, y: from.y + 47 + 7 };
  const end = { x: to.x, y: to.y + 47 + 7 };
  const d = calculateBezier(start, end);

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect(conn.id);
      }}
      onContextMenu={(e) => onContextMenu(e, "connection", conn.id)}
      className="group cursor-pointer"
    >
      {/* ⚠️ 关键：pointer-events-stroke 确保能点中透明线 */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="pointer-events-stroke"
      />

      <path
        d={d}
        className={`stroke-[3px] fill-none transition-colors duration-200 pointer-events-none
          ${
            isSelected
              ? "stroke-highlight drop-shadow-[0_0_5px_rgba(255,170,0,0.5)]"
              : "stroke-indigo-500 group-hover:stroke-red-400"
          }
        `}
      />
    </g>
  );
}
