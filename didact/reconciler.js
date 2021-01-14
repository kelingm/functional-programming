import { scheduleWork, shouldYield } from './schedule';
import { beginWork } from './beginWork';

// import { completeWork } from './completeWork';
const microTask = [];
let workInProgress = null;
let pendingCommit = null; // 已经completeWork的根fiber
let workInProgressRoot = null;
export const scheduleUpdateOnFiber = fiber => {
  if (fiber) {
    microTask.push(fiber);
  }
  scheduleWork(workLoop);
};
const workLoop = () => {
  if (!workInProgress) workInProgress = microTask.shift();
  // 每次返回一个Fiber的时候，有一次喘息的机会
  while (workInProgress && !shouldYield()) workInProgress = performUnitOfWork(workInProgress);
  if (pendingCommit) commitRoot(pendingCommit);
  return null;
};

// function workLoop() {
//   // Perform work until Scheduler asks us to yield
//   while (workInProgress !== null && !shouldYield()) {
//     performUnitOfWork(workInProgress);
//   }
// }

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
  next = beginWork(current, unitOfWork); // 处理当前fiber，并返回下一个要处理的fiber： workInProgress.child
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // 已经到叶子节点
    // If this doesn't spawn new work, complete the current work.
    // 当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。
    // 在“归”阶段会调用completeWork处理Fiber节点。
    // completeUnitOfWork会设置下一个workInProgress：sibling或root
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

/**
 *
 * @param {*} current
 * @param {*} workInProgress
 * @return workInProgress.child, 下一个待处理的fiber
 */

/**
 *
 * @param {*} unitOfWork
 */
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  // 1. completeWork unitOfWork
  // 2. 如果有sibling，则返回sibling，
  // 3. 没有sibling， 则complete returnFiber
  // 4. 继续循环sibling->return, 要么返回sibling，要么一直complete到root，即workInProgress == null
  do {
    var current = completedWork.alternate;
    var returnFiber = completedWork.return;

    const next = completeWork(current, completedWork);
    // completeWork时可能生成新的child
    if (next !== null) {
      // Completing this fiber spawned new work. Work on that next.
      workInProgress = next;
      return;
    }

    var siblingFiber = completedWork.sibling;

    if (siblingFiber !== null) {
      // If there is more work to do in this returnFiber, do that next.
      workInProgress = siblingFiber;
      return;
    } // Otherwise, return to the parent

    completedWork = returnFiber;

    workInProgress = completedWork;
  } while (completedWork !== null); // We've reached the root.
}

function completeWork(current, fiber) {
  if (fiber.return) {
    const childEffects = fiber.effects || [];
    const thisEffect = fiber.effectTag != null ? [fiber] : [];
    const parentEffects = fiber.return.effects || [];
    fiber.return.effects = parentEffects.concat(childEffects, thisEffect);
    return fiber.return;
  } else {
    // 已经到根节点了，所以已经完成这次要更新的所有工作，收集了所有effects
    // 赋值pendingCommit，以便在workLoop中会调用commitAllWork
    pendingCommit = fiber;
    return null;
  }
}

function commitWork() {}

function commitRoot(root) {
  return;
  // 每个effect 也是一个fiber
  // 在rootFiber.firstEffect上保存了一条需要执行副作用的Fiber节点的单向链表effectList，
  // 这些Fiber节点的updateQueue中保存了变化的props
  let effect = root.current.firstEffect;
  while (effect !== null) {
    commitWork(effect);

    const nextNextEffect = effect.nextEffect;
    // Remove nextEffect pointer to assist GC
    effect.nextEffect = null;
    effect = nextNextEffect;
  }
  workInProgress = null;
  workInProgressRoot = null;
  pendingCommit = null;
}
