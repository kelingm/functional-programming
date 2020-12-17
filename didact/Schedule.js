const ENOUGH_TIME = 1;
// Fiber tags
export const FunctionComponent = 0;
export const ClassComponent = 1;
// export const IndeterminateComponent = 2; // Before we know whether it is function or class
// export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
// export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
export const HostComponent = 5;

// effect tags
// DOM需要插入到页面中
export const Placement = /*                */ 0b00000000000010;
// DOM需要更新
export const Update = /*                   */ 0b00000000000100;
// DOM需要插入到页面中并更新
export const PlacementAndUpdate = /*       */ 0b00000000000110;
// DOM需要删除
export const Deletion = /*                 */ 0b00000000001000;

let workInProgress = null; // 当前已创建的workInProgress fiber
let workInProgressRoot = null;
let updateQueue = [];

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

  // this.ref = null;

  // 作为动态的工作单元的属性
  // 作为动态的工作单元来说，每个Fiber节点保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  // this.dependencies_new = null;

  // this.mode = mode;

  // Effects
  // 保存本次更新会造成的DOM操作
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  // this.lanes = NoLanes;
  // this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;
}

const createFiber = function (tag, pendingProps, key) {
  // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
  return new FiberNode(tag, pendingProps, key);
};

// 每一个react element都将对应一个fiber结构，每一个fiber结构都对应一个单元的工作。
function workLoop(deadline) {
  let shouldYield = false;
  while (workInProgress && !shouldYield) {
    performUnitOfWork(workInProgress);
    shouldYield = deadline.remainingTime() < ENOUGH_TIME;
  }
}

function performWork(deadline) {
  workLoop(deadline);
  while (workInProgress && updateQueue.length > 0) {
    requestIdleCallback(performWork);
  }
  if (!workInProgress) {
    commitRoot();
  }
}

// performUnitOfWork的工作可以分为两部分：“递”和“归”
// 深度优先遍历， beginWork -> completeWork
// 1.“递”阶段
// 首先从rootFiber开始向下深度优先遍历。为遍历到的每个Fiber节点调用beginWork方法(该方法会根据传入的Fiber节点创建子Fiber节点，并将这两个Fiber节点连接起来。)
// 当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。
// 2.“归”阶段
// 在“归”阶段会调用completeWork处理Fiber节点
// 当某个Fiber节点执行完completeWork，如果其存在兄弟Fiber节点（即fiber.sibling !== null），会进入其兄弟Fiber的“递”阶段。
// 如果不存在兄弟Fiber，会进入父级Fiber的“归”阶段。
// “递”和“归”阶段会交错执行直到“归”到rootFiber。至此，render阶段的工作就结束了。
/**
 * 创建下一个Fiber节点(child or sibling)并赋值给workInProgress，并将workInProgress与已创建的Fiber节点连接起来构成Fiber树。
 * @param {*} unitOfWork fiber
 */
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  let next;
  next = beginWork(current, unitOfWork); //
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    // 当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。
    // 在“归”阶段会调用completeWork处理Fiber节点。
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

/////////////////////////////////////////
// render阶段
/**
 * 根据传入的Fiber节点创建子Fiber节点，并将这两个Fiber节点连接起来。
 * @param {*} current 当前组件对应的Fiber节点在上一次更新时的Fiber节点，即workInProgress.alternate
 * @param {*} workInProgress 当前组件对应的Fiber节点
 */
// 1. current === null: mount, 会根据fiber.tag不同，创建不同类型的子Fiber节点
// 2. current !== null: update, 在满足一定条件时可以复用current节点, 如果不能复用，还是会走入创建子Fiber（mount）的流程里
function beginWork(current, workInProgress) {
  let didReceiveUpdate = true;
  // update
  if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    // 如果可以复用(props,type都相同）， 这里return
    if (oldProps === newProps && workInProgress.type === current.type) {
      didReceiveUpdate = false;
      // 复用current
      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
  }

  // 根据tag不同，创建不同的子Fiber节点, 最终都会进入reconcileChildren()
  // 生成effectTag
  switch (workInProgress.tag) {
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case ClassComponent:
      const Component = workInProgress.type;
      const resolvedProps = workInProgress.pendingProps;
      return updateClassComponent(current, workInProgress, Component, resolvedProps);
    case FunctionComponent:
      const Component = workInProgress.type;
      const resolvedProps = workInProgress.pendingProps;
      return updateFunctionComponent(current, workInProgress, Component, resolvedProps);
  }
}

function updateHostComponent(current, workInProgress) {
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}
function updateClassComponent(current, workInProgress, Component, resolvedProps) {
  const instance = workInProgress.stateNode;
  if (instance === null) {
    // 创建实例
    constructClassInstance(workInProgress, Component, nextProps);
    const instance = workInProgress.stateNode;
    instance.props = newProps;
    instance.state = workInProgress.memoizedState;
    instance.refs = emptyRefsObject;

    initializeUpdateQueue(workInProgress);
    processUpdateQueue(workInProgress, newProps, instance);
    instance.state = workInProgress.memoizedState;
  } else if (current === null) {
    // In a resume, we'll already have an instance we can reuse.
    // 任务中断
    // shouldUpdate = resumeMountClassInstance(
    //   workInProgress,
    //   Component,
    //   nextProps,
    // );
  } else {
    // 执行update时相关的生命周期, 更新instance状态
    updateClassInstance(current, workInProgress, Component, nextProps);
  }
  const nextChildren = instance.render();
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedState = instance.state;
  return workInProgress.child;
}

function updateFunctionComponent(current, workInProgress, Component, resolvedProps) {}

function constructClassInstance(workInProgress, ctor, props) {
  const instance = new ctor(props);
  workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined ? instance.state : null;
  workInProgress.stateNode = instance;
  instance._reactInternals = workInProgress;
  return instance;
}

// Invokes the mount life-cycles on a previously never rendered instance.
// 执行mount相关的生命周期： getDerivedStateFromProps， getSnapshotBeforeUpdate，componentWillMount，componentDidMount
function mountClassInstance(workInProgress, ctor, newProps) {
  const instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  instance.refs = emptyRefsObject;

  initializeUpdateQueue(workInProgress);
  processUpdateQueue(workInProgress, newProps, instance);
  instance.state = workInProgress.memoizedState;
}

// 执行update时相关的生命周期
function updateClassInstance(current, workInProgress, ctor, newProps) {
  const instance = workInProgress.stateNode;

  cloneUpdateQueue(current, workInProgress);

  const unresolvedOldProps = workInProgress.memoizedProps;
  const oldProps = unresolvedOldProps;
  instance.props = oldProps;
  const unresolvedNewProps = workInProgress.pendingProps;
  const oldState = workInProgress.memoizedState;
  let newState = (instance.state = oldState);
  processUpdateQueue(workInProgress, newProps, instance, renderLanes);
  newState = workInProgress.memoizedState;
  instance.props = newProps;
  instance.state = newState;
  instance.context = nextContext;
}
export function initializeUpdateQueue(fiber) {
  const queue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
    },
    effects: null,
  };
  fiber.updateQueue = queue;
}
export function processUpdateQueue(workInProgress, props, instance) {}
// 1. 对于mount的组件: 他会创建新的子Fiber节点
// 2. 对于update的组件: 他会将当前组件与该组件在上次更新时对应的Fiber节点比较（也就是俗称的Diff算法），将比较的结果生成新Fiber节点
/**
 * 最终他会生成新的子Fiber节点并赋值给workInProgress.child，
 * 作为本次beginWork返回值，并作为下次performUnitOfWork执行时workInProgress的传参
 * @param {*} workInProgress
 * @param {*} nextChildren
 */
function reconcileChildren(workInProgress, nextChildren) {
  if (current === null) {
    // 对于mount的组件
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    // 对于update的组件
    // mountChildFibers与reconcileChildFibers这两个方法的逻辑基本一致。
    // 唯一的区别是：reconcileChildFibers会为生成的Fiber节点带上effectTag属性，而mountChildFibers不会。
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}

//可以复用节点
function bailoutOnAlreadyFinishedWork(current, workInProgress) {
  cloneChildFibers(current, workInProgress);
  return workInProgress.child;
}

function ChildReconciler(shouldTrackSideEffects) {
  return function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {};
}
// 通过diff，生成带effectTag的Fiber
export const reconcileChildFibers = ChildReconciler(true);
// 生成新的Fiber节点
export const mountChildFibers = ChildReconciler(false);

function cloneChildFibers(current, workInProgress) {
  if (workInProgress.child === null) {
    return;
  }

  let currentChild = workInProgress.child;
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
  workInProgress.child = newChild;

  newChild.return = workInProgress;
  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps);
    newChild.return = workInProgress;
  }
  newChild.sibling = null;
}

// This is used to create an alternate fiber to do work on.
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    // Needed because Blocks store data on type.
    workInProgress.type = current.type;

    // We already have an alternate.
    // Reset the effect tag.
    workInProgress.effectTag = NoEffect;

    // The effect list is no longer valid.
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  return workInProgress;
}
/**
 *
 * @param {*} current  当前组件对应的Fiber节点在上一次更新时的Fiber节点，即workInProgress.alternate
 * @param {*} workInProgress  当前组件对应的Fiber节点
 */
function completeWork(current, workInProgress) {}

function completeUnitOfWork(unitOfWork) {}

//////////////////////////////////////////////
// commit阶段
function commitRoot() {}

function commitWork(fiber) {
  if (!fiber) return;
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

////////////////////////
