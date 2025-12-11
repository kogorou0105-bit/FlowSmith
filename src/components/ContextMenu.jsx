import React from "react";

export default function ContextMenu({ menu, onClose }) {
  if (!menu) return null;

  return (
    <div
      style={{ left: menu.x, top: menu.y }}
      className="fixed z-50 min-w-[140px] rounded border border-gray-600 bg-zinc-800 shadow-xl py-1"
    >
      {menu.items.map((item, i) =>
        item.separator ? (
          <div key={i} className="my-1 h-[1px] bg-gray-600" />
        ) : (
          <div
            key={i}
            onClick={() => {
              item.action();
              onClose();
            }}
            className="flex cursor-pointer justify-between px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 hover:text-white"
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="ml-4 text-xs text-gray-400 group-hover:text-gray-200">
                {item.shortcut}
              </span>
            )}
          </div>
        )
      )}
    </div>
  );
}
