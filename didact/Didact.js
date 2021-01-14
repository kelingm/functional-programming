const TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型

export const BlockingRoot = 1;

// Fiber tags
export const FunctionComponent = 0;
export const ClassComponent = 1;
// export const IndeterminateComponent = 2; // Before we know whether it is function or class
export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
// export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
export const HostComponent = 5;

// effect tags
const NoEffect = /*                        */ 0b00000000000000;
// DOM需要插入到页面中
export const Placement = /*                */ 0b00000000000010;
// DOM需要更新
export const Update = /*                   */ 0b00000000000100;
// DOM需要插入到页面中并更新
export const PlacementAndUpdate = /*       */ 0b00000000000110;
// DOM需要删除
export const Deletion = /*                 */ 0b00000000001000;
let workInProgress = null;
let pendingCommit = null; // 已经completeWork的根fiber

function arrify(val) {
  return val == null ? [] : Array.isArray(val) ? val : [val];
}

/* 

// fiber的结构
let fiber = {
  tag: HOST_COMPONENT,
  type: 'div',
  parent: parentFiber,
  child: childFiber,
  sibling: siblingFiber,
  alternate: currentFiber,
  stateNode: document.createElement('div'),
  props: {children: [], key: ''},
  partialState: null,
  effectTag: PLACEMENT,
  effects: [], // fiber数组
}

 */
/* 
 // update结构
 let update = {
   from: CLASS_COMPONENT,
   instance, // 组件
   partialState,
   dom, 
   newProps,
 }
 
 */

// 触发更新的方法
// 1. ReactDOM.render()  通常只会在入口文件执行一次
// 2. component.setState:
// 步骤： 1). updateQueue.push, 2）:scheduleUpdate -> requestIdleCallback-> performWork

class Component {
  constructor(props) {
    this.state = {};
    this.props = props;
  }
  render() {
    // 子类继承
  }
  setState(partialState) {
    // updateQueue.push({
    //   payload: partialState
    // });
    // scheduleUpdate();
  }
}
// 保存实例中fiber的引用
function createInstance(fiber) {
  // 实例化组件
  let instance;
  if (fiber.type.prototype.render) {
    instance = new fiber.type(fiber.props);
  } else {
    instance = new Didact.Component(fiber.props);
    instance.constructor = fiber.type;
    instance.render = () => fiber.type(fiber.props);
  }
  instance.__fiber = fiber;
  return instance;
}
const Didact = {
  createElement,
  Component,
};

// Didact元素 {type,key, props}
// JSX babel自动调用 生成Didact元素
// children: [[{}, {}, {}]] (当使用map的时候)
// 或者 [{}, {}]
function createElement(type, config = {}, ...args) {
  const { key, ...props } = { key: '', ...config };
  // const newChildren = children.map();
  // 排除undefined和null、false
  //<div>hello {name}</div> 会有两个child， {name}可能为undefined
  // false: {count && <div>hello</div>}
  const hasChildren = args.length > 0;
  const rawChildren = hasChildren ? [].concat(...args) : []; // concat可以合并数组或值

  props.children = rawChildren
    .filter(c => c != null && c !== false)
    .map(c => (c instanceof Object ? c : createTextElement(c)));
  return {
    type,
    key,
    props,
  };
}
// 格式化文本类型
function createTextElement(value) {
  // 规范数据
  return createElement(TEXT_ELEMENT, { nodeValue: value });
}

// 组件调度更新
// 类似render
function scheduleUpdate(fiber) {
  workInProgress = getRoot(fiber)
  requestIdleCallback(performWork);
}

function createDomElement(fiber) {
  const isTextElement = fiber.type === TEXT_ELEMENT;
  const dom = isTextElement ? document.createTextNode('') : document.createElement(fiber.type);
  updateDomProperties(dom, [], fiber.props);
  return dom;
}
///////////////////////////////////////////////////////////////////////////////DidactDOM
function FiberNode(tag, pendingProps, key) {
  // Instance
  // 作为静态数据结构的属性
  // 每个Fiber节点对应一个组件，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的DOM节点等信息。
  this.tag = tag; // Fiber对应组件的类型 Function/Class/Host...
  this.key = key;
  // 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
  // this.elementType = null;
  // 对于 FunctionComponent，指函数本身，对于ClassCompoent，指class，对于HostComponent，指DOM节点tagName
  this.type = null;
  //  1.HostComponent: Fiber节点中保存了对应的DOM节点; 2. ClassComponent/FunctionComponent: instance
  this.stateNode = null;

  // Fiber
  // 用于连接其他Fiber节点形成Fiber树
  // 因为作为一个工作单元，return指节点执行完completeWork后会返回的下一个节点。子Fiber节点及其兄弟节点完成工作后会返回其父级节点，所以用return指代父级节点。
  this.return = null; // 指向父级Fiber节点
  this.child = null; // 指向子Fiber节点
  this.sibling = null; // 指向右边第一个兄弟Fiber节点
  this.index = 0;

  // 作为动态的工作单元的属性
  // 作为动态的工作单元来说，每个Fiber节点保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  // Effects
  // 保存本次更新会造成的DOM操作
  this.effectTag = NoEffect;
  this.EffectList = [];

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;
}
function FiberRootNode(containerInfo, tag) {
  this.tag = tag;
  this.current = null;
  this.containerInfo = containerInfo;
}
export const createFiber = function (tag, pendingProps, key) {
  // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
  return new FiberNode(tag, pendingProps, key);
};

export function createFiberRoot(containerInfo, tag) {
  const root = new FiberRootNode(containerInfo, tag);

  // 创建rootFiber（container， container的stateNode指向了root（FiberRootNode))
  const uninitializedFiber = createFiber(HostRoot, null, null);

  // 连接rootFiber与rootFiberNode
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  uninitializedFiber.updateQueue = []
  return root;
}
function enqueueUpdate(fiber, update) {
  fiber.updateQueue.push(update)
}
const DidactDOM = {
  // 渲染入口
  render(element, container) {
    const update ={
      payload: { element },
    };
    const root = createFiberRoot(container, HOST_ROOT)
    const current = root.current
    enqueueUpdate(current, update)
    scheduleUpdate(current);
  },
};

function performWork() {
  workLoop()
  if (pendingCommit) {
    commitRoot(pendingCommit)
  }
}

// 在有足够时间时，循环执行work
// 一个workLoop至少会执行一次performUnitOfWork（如果有）
function workLoop() {
  while (workInProgress) {
    performUnitOfWork(workInProgress);
  }
}

// 执行任务并返回下一个要执行的unitOfWork(child 或 sibling)
// unitWork指：找出dom需要更新的部分，来构建work tree，
// 每一个unitWork是一个Fiber
// 深度优先遍历
function performUnitOfWork(wipFiber) {
  beginWork(wipFiber.alternate, wipFiber);
  if (wipFiber.child) {
    // 如果有子节点，那么下一个fiber是子节点
    return wipFiber.child;
  }
  // 如果没有child了，则这个fiber需要执行completeWork，并返回sibling或parent（如果没有sibling了）
  let uow = wipFiber;
  // 一直循环，直到在根节点执行completeWork
  while (uow) {
    completeWork(uow);
    if (uow.sibling) {
      return uow.sibling;
    }
    // 如果没有sibling了，会继续往parent中执行
    uow = uow.return;
  }
}

// 查找需要更新的属性，并标志effect
// 总共执行两个步骤
// 1.果没有stateNode，则创建stateNode
// 2.reconcileChildrenArray
function beginWork(current, workInProgress) {
  if (workInProgress.tag === ClassComponent) {
    const nextProps = workInProgress.pendingProps
    let instance = workInProgress.stateNode;
    if (instance === null) {
      // 创建实例
      constructClassInstance(workInProgress, Component, nextProps);
      instance = workInProgress.stateNode;
      instance.state = workInProgress.memoizedState;
    }
    instance.props = workInProgress.pendingProps;
    processUpdateQueue(workInProgress, nextProps, instance)
    instance.state = workInProgress.memoizedState;

    const nextChildren = instance.render();
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
  } else if(workInProgress.tag === HostComponent){
    const nextProps = workInProgress.pendingProps;
    const nextChildren = nextProps.children;
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
  } else if((workInProgress.tag === HostRoot) {

  }
}

function processUpdateQueue(workInProgress, nextProps, instance) {
  workInProgress.memoizedState = {...instance.state, ...(workInProgress.updateQueue.payload || {})}
  workInProgress.updateQueue.payload = null
}
function constructClassInstance(workInProgress, ctor, props) {
  const instance = new ctor(props);
  workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined ? instance.state : null;
  workInProgress.stateNode = instance;
  instance._reactInternals = workInProgress; // instance 保存对fiber的引用
  return instance;
}

// 在循环之外调用
// 获取来自pendingCommit的effects，来变更DOM，这里会实际更新dom
// 这一部分不能中断，必须一次性完成，避免出现不一致的UI
function commitRoot(fiber) {
  // 每个effect 也是一个fiber
  fiber.effects.forEach(f => {
    commitWork(f);
  });
  fiber.stateNode.__rootContainerFiber = fiber;
  nextUnitOfWork = null;
  pendingCommit = null;
}
function commitWork(fiber) {
  // 根节点，结束
  if (fiber.tag === HostRoot) return;
  let domParentFiber = fiber.return;
  while (domParentFiber.tag === ClassComponent) {
    domParentFiber = domParentFiber.return;
  }
  const domParent = domParentFiber.stateNode;
  if (fiber.effectTag === PLACEMENT && fiber.tag === HOST_COMPONENT) {
    domParent.appendChild(fiber.stateNode);
  } else if (fiber.effectTag === UPDATE) {
    //更新
    updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === DELETION) {
    commitDeletion(fiber, domParent);
  }
}

function commitDeletion(fiber, domParent) {
  let node = fiber;
  while (true) {
    if (node.tag === CLASS_COMPONENT) {
      node = node.child;
      continue;
    }
    domParent.removeChild(node.stateNode);
    while (node != fiber && !node.sibling) {
      node = node.parent;
    }
    if (node == fiber) {
      return;
    }
    node = node.sibling;
  }
}

function getRoot(fiber) {
  let node = fiber;
  while (node.return) {
    node = node.return;
  }
  return node;
}

/**
 *
 * @param {*} wipFiber parent Fiber
 * @param {*} newChildElements 新的element（调用wipFiber.stateNode.render()组件或wipFiber.props.children）
 */
function reconcileChildren(wipFiber, newChildElements) {
  const elements = arrify(newChildElements);
  let index = 0;

  let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null; // currentFiber
  let newFiber = null;
  // element[0] --- wipFiber.alternate.child
  // elements[1] --- wipFiber.alternate.child.sibling
  // ....以此类推

  // 如果elements.length === 0 && oldFiber !== null, 则是进行了删除
  while (index < elements.length || oldFiber != null) {
    const prevFiber = newFiber;
    const element = index < elements.length && elements[index];
    const sameType = oldFiber && element && element.type === oldFiber.type;
    // 类型相同， 赋值alternate
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        tag: oldFiber.tag,
        stateNode: oldFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        partialState: oldFiber.partialState,
        effectTag: UPDATE,
        alternate: oldFiber,
      };
    }
    // 类型改变或新增
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        tag: typeof element.type === 'string' ? HOST_COMPONENT : CLASS_COMPONENT,
        props: element.props,
        parent: wipFiber,
        effectTag: PLACEMENT,
      };
    }
    // 删除oldFiber
    if (oldFiber && !sameType) {
      oldFiber.effectTag = DELETION;
      wipFiber.effects = wipFiber.effects || [];
      wipFiber.effects.push(oldFiber); // 不是newFiber的一部分，所以需要添加到wipFiber.effects里，防止丢失
    }
    if (oldFiber) {
      // 更新oldFiber(接下来要处理sibling)
      oldFiber = oldFiber.sibling;
    }
    // 链接
    if (index === 0) {
      // 父fiber的child指向第一个子fiber
      wipFiber.child = newFiber;
    } else if (prevFiber && element) {
      // 链接sibling
      prevFiber.sibling = newFiber;
    }
    index++;
  }
}

function cloneChildFibers(parentFiber) {
  const oldFiber = parentFiber.alternate;
  if (!oldFiber) return;
  let oldChild = oldFiber.child;
  let prevChild = null;
  // 更加sibling链复制childFibers
  while (oldFiber) {
    const newChild = {
      type: oldFiber.type,
      tag: oldFiber.tag,
      stateNode: oldFiber.stateNode,
      props: oldFiber.props,
      partialState: oldFiber.partialState,
      alternate: oldFiber,
      parent: parentFiber,
    };
    if (prevChild) {
      prevChild.sibling = newChild;
    } else {
      // 第一个child
      parentFiber.child = prevChild;
    }
    prevChild = newChild;
    oldChild = oldChild.sibling;
  }
}
// 当wipFiber没有新的孩子，或者我们已经完成了所有孩子的工作时，运行completeWork
// 将有effectTag的fiber挂载到父fiber的effects的末尾
function completeWork(fiber) {
  // 更新class component fiber的引用
  if (fiber.tag === ClassComponent) {
    fiber.stateNode.__fiber = fiber;
  }
  if (fiber.return) {
    const childEffects = fiber.effects || [];
    const thisEffect = fiber.effectTag != null ? [fiber] : [];
    const parentEffects = fiber.parent.effects || [];
    fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
  } else {
    // 已经到根节点了，所以已经完成这次要更新的所有工作，收集了所有effects
    // 赋值pendingCommit，以便在workLoop中会调用commitAllWork
    pendingCommit = fiber;
  }
}


export { DidactDOM, Didact };
