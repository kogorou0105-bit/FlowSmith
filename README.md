# 🧶 React Node Editor (WIP)

> ⚠️ **Status: Under Construction (建设中)**
>
> 当前版本处于**早期重构阶段**。我们正在将原生的 DOM/SVG 实现迁移至 **React + Zustand + Tailwind CSS v4** 的现代化架构。核心逻辑已跑通，但交互细节（如拖拽丝滑度、快捷键等）仍在持续优化中。

一个轻量级、无依赖的**节点式逻辑编辑器 (Node-based Logic Editor)** 引擎。
不使用 ReactFlow 或 LogicFlow 等现成库，完全基于 React 和 SVG 手写核心算法，旨在探索底层交互逻辑与数据流设计。

## 🎯 项目目标 (Goals)

本项目旨在打造一个高性能、可扩展的前端可视化编辑器引擎，主要技术挑战与目标包括：

1. **纯原生实现 (Native Implementation)**:

   - 手写 **贝塞尔曲线 (Cubic Bezier)** 算法实现动态连线。
   - 手写 **AABB (Axis-Aligned Bounding Box)** 碰撞检测算法实现框选功能。
   - 解决 DOM 事件冒泡、坐标系转换与 React 合成事件的冲突问题。

2. **复杂状态管理 (State Management)**:

   - 使用 **Zustand** 实现状态逻辑分离，避免 React 重渲染导致的性能瓶颈。
   - 实现 **Ref 穿透模式**，在保证 60FPS 丝滑拖拽的同时，保持数据的一致性。

3. **逻辑运算引擎 (Logic Engine)**:

   - 实现基于 **DAG (有向无环图)** 的数据流计算。
   - 支持 **递归求值 (Recursive Evaluation)**，实现节点间的数据传递与级联处理（如颜色混合 Demo）。

4. **工程化与设计**:
   - 基于 **Tailwind CSS v4** 的原子化样式架构，支持暗黑/赛博朋克风格。
   - 模块化组件设计 (Node, Connection, ContextMenu)。

## 🛠 技术栈 (Tech Stack)

- **Core**: React 19
- **State**: Zustand
- **Styling**: Tailwind CSS v4 (New!)
- **Build**: Vite
- **Logic**: Custom Recursive Graph Algorithm

## 🏃‍♂️ 运行项目 (Quick Start)

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```
