const ENOUGH_TIME = 1;
// Fiber tags
const HOST_COMPONENT = 'host';
const CLASS_COMPONENT = 'class';
const FUNCTION_COMPONENT = 'function';
const HOST_ROOT = 'root';

// effect tags
const PLACEMENT = 1;
const DELETION = 2;
const UPDATE = 3;

let nextUnitOfWork = null
let updateQueue = []



// 每一个react element都将对应一个fiber结构，每一个fiber结构都对应一个单元的工作。

function workLoop(deadline) {
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.remainingTime() < ENOUGH_TIME
  
}

function performWork(deadline) {
  workLoop(deadline)
  while(nextUnitOfWork && updateQueue.length > 0) {
    requestIdleCallback(performWork)
  }
  if (!nextUnitOfWork) {
    commitRoot()
  }
}

// 深度优先遍历， beginWork -> completeWork
function performUnitOfWork(fiber) {
  beginWork(fiber) // 处理当前fiber
  // 返回下一个unitOfWork
  if(fiber.child) return fiber.child

  //没有child了，先completeWork， 然后处理sibling, 没有sibling，则处理parent
  let nextFiber = fiber
  while(nextFiber) {
    completeWork(nextFiber)
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent 
  } 
}

// render阶段
/**
 * 
 * @param {*} workInProgress 当前组件对应的Fiber节点
 */
function beginWork(workInProgress) {
  //根据tag不同，创建不同的子Fiber节点
  switch(workInProgress.tag) {
    case HOST_COMPONENT:
      updateHostComponent(workInProgress);
      break;
    case CLASS_COMPONENT:
      updateClassComponent(workInProgress)
      break
    case FUNCTION_COMPONENT:
      updateFunctionComponent(workInProgress)
      break;
  }
}
function completeWork(fiber) {

}

// commit阶段
function commitRoot() {
  
}

function commitWork(fiber) {
  if (!fiber) return
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
function reconcileChildren(workInProgress, nextChildren) {

}