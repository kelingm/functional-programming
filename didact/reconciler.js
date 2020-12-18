import { scheduleWork } from './schedule';
const microTask = [];
let workInProgress = null;
let pendingCommit = null; // 已经completeWork的根fiber

export const scheduleUpdateOnFiber = fiber => {
  if (fiber) {
    microTask.push(fiber);
  }
  scheduleWork(workLoop);
};
const workLoop = timeout => {
  if (!WIP) WIP = microTask.shift();
  while (WIP && (!shouldYield() || timeout)) WIP = performUnitOfWork(WIP);
  if (WIP && !timeout) return workLoop.bind(null);
  if (pendingCommit) commitWork(pendingCommit);
  return null;
};

function performUnitOfWork(unitOfWork) {
  // beginWork(wipFiber);
  // if (wipFiber.child) {
  //   // 如果有子节点，那么下一个fiber是子节点
  //   return wipFiber.child;
  // }
  // // 如果没有child了，则这个fiber需要执行completeWork，并返回sibling或parent（如果没有sibling了）
  // let uow = wipFiber;
  // // 一直循环，直到在根节点执行completeWork
  // while (uow) {
  //   completeWork(uow);
  //   if (uow.sibling) {
  //     return uow.sibling;
  //   }
  //   // 如果没有sibling了，会继续往parent中执行
  //   uow = uow.parent;
  // }

  const current = unitOfWork.alternate;
  let next;
  next = beginWork(current, unitOfWork); // 处理当前fiber，并返回下一个要处理的fiber
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

function commitWork() {}
