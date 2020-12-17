const ENOUGH_TIME = 1;
// Fiber tags
export const FunctionComponent = 0;
export const ClassComponent = 1;
// export const IndeterminateComponent = 2; // Before we know whether it is function or class
// export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
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

let workInProgress = null; // 当前已创建的workInProgress fiber
let workInProgressRoot = null;

function scheduleUpdateOnFiber(fiber) {
  const root = markUpdateLaneFromFiberToRoot(fiber);
  performWorkOnRoot(root);
}
// 每一个react element都将对应一个fiber结构，每一个fiber结构都对应一个单元的工作。
function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
  workInProgressRoot = null;
}

function performWorkOnRoot(root) {
  workLoop();
  commitRoot(root);
}
// 从fiber到root
function markUpdateLaneFromFiberToRoot() {
  // Walk the parent path to the root and update the child expiration time.
  let node = fiber.return;
  let root = null;
  if (node === null && fiber.tag === HostRoot) {
    // 是根节点了
    root = fiber.stateNode;
  } else {
    // 向上找到FiberRootNode
    while (node !== null) {
      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode;
        break;
      }
      node = node.return;
    }
  }
  return root;
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
  // update
  if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    // 如果可以复用(props,type都相同）， 这里return
    if (oldProps === newProps && workInProgress.type === current.type) {
      // 复用current
      cloneChildFibers(current, workInProgress);
      return workInProgress.child;
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
  // const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  // const prevProps = current !== null ? current.memoizedProps : null;
  const nextChildren = nextProps.children;
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
  }
  const nextChildren = instance.render();
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedState = instance.state;
  return workInProgress.child;
}

function constructClassInstance(workInProgress, ctor, props) {
  const instance = new ctor(props);
  workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined ? instance.state : null;
  workInProgress.stateNode = instance;
  instance._reactInternals = workInProgress; // instance 保存对fiber的引用
  return instance;
}

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
function arrify(val) {
  return val == null ? [] : Array.isArray(val) ? val : [val];
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
function ChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return;
    }
    // Deletions are added in reversed order so we add it to the front.
    // At this point, the return fiber's effect list is empty except for
    // deletions, so we can just append the deletion to the list. The remaining
    // effects aren't added until the complete phase. Once we implement
    // resuming, this may not be true.
    const last = returnFiber.lastEffect;
    if (last !== null) {
      last.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    childToDelete.nextEffect = null;
    childToDelete.effectTag = Deletion;
  }
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return null;
    }

    // TODO: For the shouldClone case, this could be micro-optimized a bit by
    // assuming that after the first child we've already added everything.
    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }
  function mapRemainingChildren(returnFiber, currentFirstChild) {
    // Add the remaining children to a temporary map so that we can find them by
    // keys quickly. Implicit (null) keys get added to this set with their index
    // instead.
    const existingChildren = new Map();

    let existingChild = currentFirstChild;
    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }
      existingChild = existingChild.sibling;
    }
    return existingChildren;
  }

  function useFiber(fiber, pendingProps) {
    // We currently set sibling to null and index to 0 here because it is easy
    // to forget to do before returning it. E.g. for the single child case.
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
      // Noop.
      return lastPlacedIndex;
    }
    const current = newFiber.alternate;
    if (current !== null) {
      const oldIndex = current.index;
      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.effectTag = Placement;
        return lastPlacedIndex;
      } else {
        // This item can stay in place.
        return oldIndex;
      }
    } else {
      // This is an insertion.
      newFiber.effectTag = Placement;
      return lastPlacedIndex;
    }
  }

  function placeSingleChild(newFiber) {
    // This is simpler for the single child case. We only need to do a
    // placement for inserting new children.
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }
    return newFiber;
  }

  function updateTextNode(returnFiber, current, textContent) {
    if (current === null || current.tag !== HostText) {
      // Insert
      const created = createFiberFromText(textContent, returnFiber.mode, lanes);
      created.return = returnFiber;
      return created;
    } else {
      // Update
      const existing = useFiber(current, textContent);
      existing.return = returnFiber;
      return existing;
    }
  }

  function createChild(returnFiber, newChild) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys. If the previous node is implicitly keyed
      // we can continue to replace it without aborting even if it is not a text
      // node.
      const created = createFiberFromText('' + newChild, returnFiber.mode, lanes);
      created.return = returnFiber;
      return created;
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const created = createFiberFromElement(newChild, returnFiber.mode, lanes);
          created.ref = coerceRef(returnFiber, null, newChild);
          created.return = returnFiber;
          return created;
        }
        case REACT_PORTAL_TYPE: {
          const created = createFiberFromPortal(newChild, returnFiber.mode, lanes);
          created.return = returnFiber;
          return created;
        }
      }

      if (isArray(newChild) || getIteratorFn(newChild)) {
        const created = createFiberFromFragment(newChild, returnFiber.mode, lanes, null);
        created.return = returnFiber;
        return created;
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    return null;
  }

  // key和type都相同时才能复用
  function updateSlot(returnFiber, oldFiber, newChild) {
    // Update the fiber if the keys match, otherwise return null.

    const key = oldFiber !== null ? oldFiber.key : null;

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys. If the previous node is implicitly keyed
      // we can continue to replace it without aborting even if it is not a text
      // node.
      if (key !== null) {
        return null;
      }
      return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            if (newChild.type === REACT_FRAGMENT_TYPE) {
              return updateFragment(returnFiber, oldFiber, newChild.props.children, lanes, key);
            }
            return updateElement(returnFiber, oldFiber, newChild, lanes);
          } else {
            return null;
          }
        }
        case REACT_PORTAL_TYPE: {
          if (newChild.key === key) {
            return updatePortal(returnFiber, oldFiber, newChild, lanes);
          } else {
            return null;
          }
        }
      }

      if (isArray(newChild) || getIteratorFn(newChild)) {
        if (key !== null) {
          return null;
        }

        return updateFragment(returnFiber, oldFiber, newChild, lanes, null);
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    return null;
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys, so we neither have to check the old nor
      // new node for the key. If both are text nodes, they match.
      const matchedFiber = existingChildren.get(newIdx) || null;
      return updateTextNode(returnFiber, matchedFiber, '' + newChild, lanes);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const matchedFiber =
            existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
          if (newChild.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              matchedFiber,
              newChild.props.children,
              lanes,
              newChild.key,
            );
          }
          return updateElement(returnFiber, matchedFiber, newChild, lanes);
        }
        case REACT_PORTAL_TYPE: {
          const matchedFiber =
            existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
          return updatePortal(returnFiber, matchedFiber, newChild, lanes);
        }
      }

      if (isArray(newChild) || getIteratorFn(newChild)) {
        const matchedFiber = existingChildren.get(newIdx) || null;
        return updateFragment(returnFiber, matchedFiber, newChild, lanes, null);
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    return null;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    // fiber增加或不变， 删除旧的fiber
    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
        if (newFiber === null) {
          continue;
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        lanes,
      );
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          if (newFiber.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    // 还未处理的是被删除
    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(child => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
  }

  // 通过diff算法，生成带effectTag的新fiber
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    return reconcileChildrenArray(returnFiber, currentFirstChild, arrify(newChild));
  }
  return reconcileChildFibers;
}
// 通过diff，生成带effectTag的Fiber
export const reconcileChildFibers = ChildReconciler(true);
// 生成新的Fiber节点
export const mountChildFibers = ChildReconciler(false);
