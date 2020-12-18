import { initializeUpdateQueue } from './updateQueue';

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

  // 初始化updateQueue
  initializeUpdateQueue(uninitializedFiber);
  return root;
}
