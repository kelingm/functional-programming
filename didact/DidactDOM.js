import { initializeUpdateQueue, enqueueUpdate, createUpdate } from './updateQueue';
import { createFiber, createFiberRoot } from './fiber';
import { scheduleUpdateOnFiber } from './reconciler';

export const LegacyRoot = 0;
export const BlockingRoot = 1;
const randomKey = Math.random().toString(36).slice(2);

const DidactDOM = {
  render(element, container) {
    return legacyRenderSubtreeIntoContainer(null, element, container);
  },
};

function legacyRenderSubtreeIntoContainer(parentComponent, children, container) {
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

// container._reactRootContainer._internalRoot = fiberRoot
// fiberRoot.current = rootFiber
// rootFiber.stateNode = fiberRoot
function ReactDOMBlockingRoot(container, tag) {
  const root = createFiberRoot(container, tag);
  root.containerInfo['__reactContainer$' + randomKey] = root.current;
  this._internalRoot = root;
}

export default DidactDOM;
