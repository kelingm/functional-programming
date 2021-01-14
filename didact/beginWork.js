export const FunctionComponent = 0;
export const ClassComponent = 1;
export const IndeterminateComponent = 2; // Before we know whether it is function or class
export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
export const HostComponent = 5;
export const HostText = 6;
export const Fragment = 7;
export const Mode = 8;
export const ContextConsumer = 9;
export const ContextProvider = 10;
export const ForwardRef = 11;
export const Profiler = 12;
export const SuspenseComponent = 13;
export const MemoComponent = 14;
export const SimpleMemoComponent = 15;
export const LazyComponent = 16;
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const FundamentalComponent = 20;
export const ScopeComponent = 21;
export const Block = 22;
export const OffscreenComponent = 23;
export const LegacyHiddenComponent = 24;

import { createFiber, createFiberFromElement, createFiberFromText } from './fiber';

function beginWork(current, workInProgress) {
  // update
  // 判断是否可以复用
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
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case ClassComponent:
      // const Component = workInProgress.type;
      // const resolvedProps = workInProgress.pendingProps;
      return updateClassComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
      );

    case FunctionComponent:
      // const Component = workInProgress.type;
      // const resolvedProps = workInProgress.pendingProps;
      return updateFunctionComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
      );
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
function updateHostRoot(current, workInProgress) {
  const updateQueue = workInProgress.updateQueue;
  const nextProps = workInProgress.pendingProps;
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState !== null ? prevState.element : null;
  // cloneUpdateQueue(current, workInProgress);
  // processUpdateQueue(workInProgress, nextProps, null);
  const nextState = workInProgress.memoizedState || {};
  // Caution: React DevTools currently depends on this property
  // being called "element".
  const nextChildren = nextState.element;
  // if (nextChildren === prevChildren) {
  //   resetHydrationState();
  //   return bailoutOnAlreadyFinishedWork(current, workInProgress);
  // }
  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
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
function reconcileChildren(current, workInProgress, nextChildren) {
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
    // update
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
  /**
   * childToDelete标志effectTag，并将childToDelete添加到returnFiber的effectList中
   * @param {*} returnFiber
   * @param {*} childToDelete
   */
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
      // returnFiber已经有effectList
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

  // 复用
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
      // 移动了的节点
      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.effectTag = Placement;
        return lastPlacedIndex;
      } else {
        // 没有移动
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
      const created = createFiberFromText(textContent);
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
  function updateElement(returnFiber, current, element) {
    if (current !== null) {
      // 可以复用， key和type都相同
      if (current.type === element.type) {
        // Move based on index
        const existing = useFiber(current, element.props);
        existing.return = returnFiber;

        return existing;
      } else {
        // type 不同
      }
    }
    // Insert
    const created = createFiberFromElement(element, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
  }

  // key和type都相同时才能复用
  // 1.如果可以复用，返回更新后的fiber
  // 2. 不能复用，返回 null
  /**
    Update the fiber if the keys match, otherwise return null.
   * 
   * @param {*} returnFiber 
   * @param {*} oldFiber 
   * @param {*} newChild 
   */
  function updateSlot(returnFiber, oldFiber, newChild) {
    const key = oldFiber !== null ? oldFiber.key : null;

    // text node
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // 旧的元素有key，说明类似改变了， 变成了text node（因为text node没有key）
      if (key !== null) {
        return null;
      }
      return updateTextNode(returnFiber, oldFiber, '' + newChild);
    }

    // component
    if (typeof newChild === 'object' && newChild !== null) {
      if (newChild.key === key) {
        // key相同时
        return updateElement(returnFiber, oldFiber, newChild);
      } else {
        return null;
      }
    }

    return null;
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys, so we neither have to check the old nor
      // new node for the key. If both are text nodes, they match.
      const matchedFiber = existingChildren.get(newIdx) || null;
      return updateTextNode(returnFiber, matchedFiber, '' + newChild);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      const matchedFiber =
        existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
      return updateElement(returnFiber, matchedFiber, newChild);
    }

    return null;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    let oldFiber = currentFirstChild; // 旧的 children 中的第一个
    // lastPlacedIndex 可以认为是一个记录 newIndex 和 oldIndex 最大索引值，所有小于这个最大值的节点，都需要加一个 Placement 标记。
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    // 1.第一轮遍历
    // 1）遍历newChildren，将newChildren[i]与oldFiber比较，判断DOM节点是否可复用。
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      // oldFiber.index 大于 newIndex，那么需要旧的 fiber 等待新的 fiber，一直等到位置相同
      // 从相同位置开始比较
      // 如果oldFiber.index比较大，则新建Fiber
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      // 对比新旧children相同index的对象的key是否相等, 如果是，返回该对象，如果不是，返回null
      // newFiber 的 index 是 0
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
      // 2.1）key不同，直接跳出第一轮遍历
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
      // 第一次渲染
      if (shouldTrackSideEffects) {
        // 2.2）如果key相同，type不同， 会创建一个新的fiber，需要删除旧fiber
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      // 判断 newFiber 节点是否移动过，如果移动了，返回新的位置
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

    // children数量不变 或 减少， 删除旧的fiber
    // newChildren遍历完，oldFiber没遍历完
    // 本次更新比之前的节点数量少，有节点被删除了。所以需要遍历剩下的oldFiber，依次标记Deletion。
    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    // oldFiber遍历完， newChildren没有遍历完， children增加， 插入新的元素
    // 已有的DOM节点都复用了，这时还有新加入的节点，意味着本次更新有新节点插入，
    // 我们只需要遍历剩下的newChildren为生成的workInProgress fiber依次标记Placement。
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

    // newChildren与oldFiber都没遍历完
    //这意味着有节点在这次更新中改变了位置。
    // Add all children to a key map for quick lookups.
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx]);
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

    // 删除没有复用的节点
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
export { beginWork };
