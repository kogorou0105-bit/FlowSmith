// 引入我们的主编辑器组件
// 假设你把 NodeEditor.jsx 放在了 src/ 根目录下
// 如果你把它放在了 src/components/ 下，请改为 import NodeEditor from './components/NodeEditor';
import NodeEditor from "./NodeEditor";

function App() {
  return (
    // NodeEditor 组件内部已经设置了 w-screen h-screen (全屏)，
    // 所以这里不需要额外的 div 包裹，直接渲染即可。
    <NodeEditor />
  );
}

export default App;
