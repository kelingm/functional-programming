import { enqueueUpdate } from './updateQueue';
import { scheduleUpdateOnFiber } from './reconciler';
function render(element, container) {
  // 创建update
  const update = createUpdate();
  // update.payload为需要挂载在根节点的组件
  update.payload = { element: children };

  // 创建fiberRootNode和rootFiber和关联
  const root = (container._reactRootContainer = new ReactDOMBlockingRoot(container, LegacyRoot));
  const fiberRoot = root._internalRoot;
  const current = fiberRoot.current; // rootFiber
  // 将生成的update加入updateQueue
  enqueueUpdate(current, update);
  // 调度更新
  scheduleUpdateOnFiber(current);
}

function ReactDOMBlockingRoot(container, tag) {
  const root = createFiberRoot(container, tag);
  root.containerInfo['__reactContainer$' + randomKey] = root.current;
  this._internalRoot = root;
}
