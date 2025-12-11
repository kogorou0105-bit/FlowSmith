import React, { useRef, useEffect, useState } from "react";
import { useStore } from "./store"; // 引入 Store
import Node from "./components/Node";
import Connection from "./components/Connection";
import ContextMenu from "./components/ContextMenu";
import { calculateBezier } from "./utils/math";
import { useGraphLogic } from "./hooks/useGraphLogic";

export default function NodeEditor() {
  // 从 Store 提取数据和方法
  const {
    nodes,
    connections,
    selectedNodes,
    selectedConnection,
    addNode,
    updateNodePosition,
    updateNodeColor,
    selectNode,
    selectConnection,
    clearSelection,
    setSelectionBox,
    addConnection,
    deleteSelected,
    copySelection,
    pasteSelection,
  } = useStore();

  // 逻辑引擎 (依然使用 Hook，但传入 Store 的数据)
  const nodeResults = useGraphLogic(nodes, connections);

  // --- 交互 Refs (仅用于临时拖拽 UI，保持丝滑) ---
  const dragRef = useRef({
    mode: "idle",
    startPos: { x: 0, y: 0 },
    nodeOffsets: new Map(),
    connectionStart: null,
  });

  const [tempLine, setTempLine] = useState(null);
  const [selectionBoxRect, setSelectionBoxRect] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // --- 事件处理 ---

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    // 调用 Store 进行选中
    selectNode(nodeId, e.ctrlKey);

    // 初始化拖拽 Ref (不操作 State，只操作 DOM 视觉)
    dragRef.current.mode = "dragNode";
    dragRef.current.nodeOffsets.clear();

    // 这里我们要处理“已选中”的节点。
    // 注意：如果是刚选中的，store 可能还没更新完，所以我们手动合并一下逻辑
    const currentSelected = new Set(selectedNodes);
    if (!e.ctrlKey && !currentSelected.has(nodeId)) {
      currentSelected.clear();
      currentSelected.add(nodeId);
    } else if (!currentSelected.has(nodeId)) {
      currentSelected.add(nodeId);
    }

    currentSelected.forEach((id) => {
      const n = nodes.find((item) => item.id === id);
      if (n) {
        dragRef.current.nodeOffsets.set(id, {
          offsetX: n.x - e.clientX,
          offsetY: n.y - e.clientY,
        });
      }
    });
  };

  const handleHandleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const node = nodes.find((n) => n.id === nodeId);
    const startX = node.x + 180;
    const startY = node.y + 47 + 7;

    dragRef.current.mode = "dragConnection";
    dragRef.current.connectionStart = {
      nodeId,
      startPos: { x: startX, y: startY },
    };
    setTempLine({ startX, startY, endX: e.clientX, endY: e.clientY });
  };

  const handleCanvasMouseDown = (e) => {
    // 忽略子元素点击
    if (
      e.target.closest(".node-element") ||
      e.target.closest(".connection-element")
    )
      return;

    setContextMenu(null);
    if (!e.ctrlKey) clearSelection();

    dragRef.current.mode = "boxSelect";
    dragRef.current.startPos = { x: e.clientX, y: e.clientY };
  };

  // --- 全局移动 (Ref 驱动 DOM，不触发 React Render，保证 60FPS) ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { mode, nodeOffsets, startPos, connectionStart } = dragRef.current;

      if (mode === "dragNode") {
        // 直接操作 DOM 样式，极其丝滑
        nodeOffsets.forEach((offset, id) => {
          // 临时更新 DOM 位置，不更新 React State
          const el = document.getElementById(`node-${id}`);
          if (el) {
            el.style.left = `${e.clientX + offset.offsetX}px`;
            el.style.top = `${e.clientY + offset.offsetY}px`;
          }
          // 同时也得更新连线（虽然这里没法直接更新 SVG DOM，
          // 但因为我们等下 onMouseUp 会同步 State，所以暂时让线“断”一下或者容忍延迟
          // 如果追求完美，需要用 ref 获取 SVG path 并 setAttribute d）
        });
        // 简单起见：拖拽过程中我们强制 update State 来重绘连线
        // 为了性能，你可以选择只在 MouseUp 更新，或者这里节流更新
        // *为了用户体验，我们这里还是选择更新 State，因为 React + Tailwind v4 性能通常足够*
        // 如果觉得卡，可以把下面的 updateNodePosition 放到 onMouseUp 里
        nodeOffsets.forEach((offset, id) => {
          updateNodePosition(
            id,
            e.clientX + offset.offsetX,
            e.clientY + offset.offsetY
          );
        });
      } else if (mode === "dragConnection") {
        setTempLine({
          startX: connectionStart.startPos.x,
          startY: connectionStart.startPos.y,
          endX: e.clientX,
          endY: e.clientY,
        });
      } else if (mode === "boxSelect") {
        const x = Math.min(startPos.x, e.clientX);
        const y = Math.min(startPos.y, e.clientY);
        const w = Math.abs(e.clientX - startPos.x);
        const h = Math.abs(e.clientY - startPos.y);
        setSelectionBoxRect({ x, y, w, h });
      }
    };

    const handleMouseUp = (e) => {
      const { mode, connectionStart, startPos } = dragRef.current;

      if (mode === "dragConnection") {
        // 查找鼠标下的节点 (简单的 DOM 查找)
        // 这里我们简化：假设 handleHandleMouseUp 已经处理了连接逻辑
        // 如果松开在空白处：
        setTempLine(null);
      } else if (mode === "boxSelect") {
        // 结算框选
        const x = Math.min(startPos.x, e.clientX);
        const y = Math.min(startPos.y, e.clientY);
        const w = Math.abs(e.clientX - startPos.x);
        const h = Math.abs(e.clientY - startPos.y);

        const selectRect = { left: x, right: x + w, top: y, bottom: y + h };
        const idsToSelect = [];

        nodes.forEach((n) => {
          // 简单的矩形碰撞
          const nRect = {
            left: n.x,
            right: n.x + 180,
            top: n.y,
            bottom: n.y + 100,
          };
          const intersect = !(
            nRect.right < selectRect.left ||
            nRect.left > selectRect.right ||
            nRect.bottom < selectRect.top ||
            nRect.top > selectRect.bottom
          );
          if (intersect) idsToSelect.push(n.id);
        });

        if (idsToSelect.length > 0) setSelectionBox(idsToSelect); // Store Action
        setSelectionBoxRect(null);
      }

      dragRef.current.mode = "idle";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [nodes, updateNodePosition, setSelectionBox]); // 依赖 Store 的 Action

  // 连线松手 (特定逻辑)
  const handleHandleMouseUp = (e, targetNodeId) => {
    e.stopPropagation();
    if (dragRef.current.mode !== "dragConnection") return;
    const { nodeId: sourceId } = dragRef.current.connectionStart;
    addConnection(sourceId, targetNodeId); // Store Action
    setTempLine(null);
    dragRef.current.mode = "idle";
  };

  // 右键菜单
  const handleContextMenu = (e, type, id) => {
    e.preventDefault();
    e.stopPropagation();
    const x = e.clientX;
    const y = e.clientY;
    let items = [];

    // 关键修复：这里的 Action 直接调用 Store 方法，没有任何闭包问题
    if (type === "canvas") {
      items = [
        { label: "添加颜色节点", action: () => addNode(x, y, "source") },
        { label: "添加混合节点", action: () => addNode(x, y, "process") },
        { separator: true },
        { label: "粘贴 (Ctrl+V)", action: pasteSelection },
      ];
      clearSelection();
    } else if (type === "node") {
      if (!selectedNodes.has(id)) selectNode(id);
      items = [
        { label: "复制 (Ctrl+C)", action: copySelection },
        { label: "删除 (Del)", action: deleteSelected },
      ];
    } else if (type === "connection") {
      selectConnection(id);
      items = [{ label: "删除连线", action: deleteSelected }];
    }
    setContextMenu({ x, y, items });
  };

  // 快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if (e.ctrlKey && (e.key === "c" || e.key === "C")) copySelection();
      if (e.ctrlKey && (e.key === "v" || e.key === "V")) pasteSelection();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected, copySelection, pasteSelection]);

  // --- Render ---
  return (
    <div
      className="editor-grid-bg relative w-screen h-screen overflow-hidden select-none font-sans text-white"
      onMouseDown={handleCanvasMouseDown}
      onContextMenu={(e) => handleContextMenu(e, "canvas")}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {connections.map((conn) => (
          <g key={conn.id} className="connection-element pointer-events-auto">
            <Connection
              conn={conn}
              nodes={nodes}
              isSelected={selectedConnection === conn.id}
              onSelect={selectConnection}
              onContextMenu={handleContextMenu}
            />
          </g>
        ))}
        {tempLine && (
          <path
            d={calculateBezier(
              { x: tempLine.startX, y: tempLine.startY },
              { x: tempLine.endX, y: tempLine.endY }
            )}
            className="stroke-gray-400 stroke-2 stroke-dashed fill-none"
          />
        )}
      </svg>

      {selectionBoxRect && (
        <div
          className="absolute border border-blue-500/80 bg-blue-500/20 z-50 pointer-events-none"
          style={{
            left: selectionBoxRect.x,
            top: selectionBoxRect.y,
            width: selectionBoxRect.w,
            height: selectionBoxRect.h,
          }}
        />
      )}

      {nodes.map((node) => (
        // 给每个节点一个 ID，用于 DOM 操作（虽然 React 控制，但为了 Ref 拖动方便）
        <div
          key={node.id}
          id={`node-${node.id}`}
          className="node-element transition-none"
        >
          <Node
            node={node}
            selected={selectedNodes.has(node.id)}
            result={nodeResults[node.id]}
            updateColor={updateNodeColor}
            onMouseDown={handleNodeMouseDown}
            onHandleMouseDown={handleHandleMouseDown}
            onHandleMouseUp={handleHandleMouseUp}
            onContextMenu={handleContextMenu}
          />
        </div>
      ))}

      <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </div>
  );
}
