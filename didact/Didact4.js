const TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型

// Fiber tags
const HOST_COMPONENT = 'host';
const CLASS_COMPONENT = 'class';
const FUNCTION_COMPONENT = 'function';
const HOST_ROOT = 'root';

// effect tags
const PLACEMENT = 1;
const DELETION = 2;
const UPDATE = 3;

const ENOUGH_TIME = 1;
// global state
// {from, dom, newProps}
const updateQueue = [];
let nextUnitOfWork = null;
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
    updateQueue.push({
      from: CLASS_COMPONENT,
      instance: this,
      partialState,
    });
    scheduleUpdate();
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
function scheduleUpdate() {
  requestIdleCallback(performWork);
}

function createDomElement(fiber) {
  const isTextElement = fiber.type === TEXT_ELEMENT;
  const dom = isTextElement ? document.createTextNode('') : document.createElement(fiber.type);
  updateDomProperties(dom, [], fiber.props);
  return dom;
}
///////////////////////////////////////////////////////////////////////////////DidactDOM

const DidactDOM = {
  // 渲染入口
  render(element, container) {
    updateQueue.push({
      // 根
      from: HOST_ROOT,
      dom: container,
      newProps: { children: element },
    });
    scheduleUpdate();
  },
};

// 在render或setState（scheduleUpdate) 或performWork 的时候会触发延迟回调performWork
// deadline是requestIdleCallback回调传入的参数
function performWork(deadline) {
  workLoop(deadline);
  // 还有任务未完成，需要等待下一个浏览器空闲时间执行
  if (nextUnitOfWork || updateQueue.length > 0) {
    requestIdleCallback(performWork);
  }
}

// 在有足够时间时，循环执行work
// 一个workLoop至少会执行一次performUnitOfWork（如果有）
function workLoop(deadline) {
  if (!nextUnitOfWork) {
    // 没有任务要执行了
    resetNextUnitOfWork();
  }

  // 每执行完一个unitwork，判断是否还有足够的剩余时间和是否还有任务未完成，来判断是否要继续执行
  while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  // 如果有在等待commit的任务，则立即commit
  if (pendingCommit) {
    commitAllWork(pendingCommit);
  }
}

// 执行任务并返回下一个要执行的unitOfWork(child 或 sibling)
// unitWork指：找出dom需要更新的部分，来构建work tree，
// 每一个unitWork是一个Fiber
// 深度优先遍历
function performUnitOfWork(wipFiber) {
  beginWork(wipFiber);
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
    uow = uow.parent;
  }
}

// 查找需要更新的属性，并标志effect
// 总共执行两个步骤
// 1.果没有stateNode，则创建stateNode
// 2.reconcileChildrenArray
function beginWork(wipFiber) {
  if (wipFiber.tag === CLASS_COMPONENT) {
    updateClassComponent(wipFiber);
  } else {
    // host component
    updateHostComponent(wipFiber);
  }
}

// host component的stateNode即原生dom
function updateHostComponent(wipFiber) {
  if (!wipFiber.stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber);
  }
  const newChildElements = wipFiber.props.children;
  reconcileChildrenArray(wipFiber, newChildElements);
}
// 组件的stateNode指向react元素（render（）返回的对象）
// 组件实例
//  {
//    type,
//    props,
//    key
//  }
function updateClassComponent(wipFiber) {
  let instance = wipFiber.stateNode;
  if (instance == null) {
    // 第一次渲染，调用类初始化， 创建新的实例
    instance = wipFiber.stateNode = createInstance(wipFiber);
  } else if (wipFiber.props === instance.props && !wipFiber.partialState) {
    // 组件没有更新, 不需要重新reconcile,直接克隆子树
    // shouldComponentUpdate()
    cloneChildFibers(wipFiber);
    return;
  }
  // 更新实例的props、state
  instance.props = wipFiber.props;
  instance.state = { ...instance.state, ...wipFiber.partialState };
  wipFiber.partialState = null;
  // 重新render，或许新的childElements
  const newChildElements = wipFiber.stateNode.render();
  reconcileChildrenArray(wipFiber, newChildElements);
}

// 在循环之外调用
// 获取来自pendingCommit的effects，来变更DOM，这里会实际更新dom
// 这一部分不能中断，必须一次性完成，避免出现不一致的UI
function commitAllWork(fiber) {
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
  if (fiber.tag === HOST_ROOT) return;
  let domParentFiber = fiber.parent;
  while (domParentFiber.tag === CLASS_COMPONENT) {
    domParentFiber = domParentFiber.parent;
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

// 从updateQueue获取第一个更新(root)，并转换为第一个nextUnitOfWork
function resetNextUnitOfWork() {
  const update = updateQueue.shift(); // 先进先出
  if (!update) return;
  // 组件state更新
  if (update.partialState) {
    // 将partialState保存__fiber里
    update.instance.__fiber.partialState = update.partialState;
  }
  // 获取根节点，从根开始进行比较
  // 第一次调用render的时候（update.from === HOST_ROOT）， 还没有alternate， 为null
  const root =
    update.from === HOST_ROOT ? update.dom.__rootContainerFiber : getRoot(update.instance.__fiber);
  // 第一个nextUnitOfWork（Fiber是一个unitOfWork，一个工作单元）
  // 这个Fiber是一个新的work tree的根
  nextUnitOfWork = {
    tag: HOST_ROOT, // root
    stateNode: update.dom || root.stateNode, // 两种情况：更新时update.dom, 第一次渲染：root.stateNode
    props: update.newProps || root.props, // 如果props没有更新，则使用旧的props
    alternate: root,
  };
}
// 根据parent链，找到旧Fiber树的根
function getRoot(fiber) {
  let node = fiber;
  while (node.parent) {
    node = node.parent;
  }
  return node;
}

/**
 *
 * @param {*} wipFiber parent Fiber
 * @param {*} newChildElements 新的element（调用wipFiber.stateNode.render()组件或wipFiber.props.children）
 */
function reconcileChildrenArray(wipFiber, newChildElements) {
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
function completeWork(fiber) {
  // 更新class component fiber的引用
  if (fiber.tag === CLASS_COMPONENT) {
    fiber.stateNode.__fiber = fiber;
  }
  if (fiber.parent) {
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

function updateDomProperties(dom, prevProps, nextProps) {
  // 删除已经删除的属性
  for (let key in prevProps) {
    if (!key in nextProps) {
      removeAttribute({ key, value: prevProps[key], dom });
    }
    if (isEvent(key)) {
      removeAttribute({ key, value: prevProps[key], dom });
    }
  }
  // 如果属性改变， 设置新的属性
  for (let key in nextProps) {
    // console.log({ key });
    if (nextProps[key] !== prevProps[key]) {
      setAttribute({ key, value: nextProps[key], dom });
    }
  }
}

const isEvent = name => name.startsWith('on');

function removeAttribute({ key, value, dom }) {
  // todo
  if (isEvent(key)) {
    const event = key.slice(2).toLocaleLowerCase();
    dom.removeEventListener(event, value);
  } else {
    setAttribute({ key, undefined, dom });
  }
}

function setAttribute({ key, value, dom }) {
  if (key === 'children') return;
  if (isEvent(key)) {
    // 事件
    const event = key.slice(2).toLocaleLowerCase();
    dom.addEventListener(event, value);
  } else if (key === 'style') {
    // 样式
    for (let name in value) {
      dom.style[name] = value[name];
    }
  } else if (key === 'className') {
    dom.setAttribute('class', value);
  } else {
    dom[key] = value;
    // textNode没有setAttribute方法
    dom.setAttribute && dom.setAttribute(key, value);
  }
}

export { DidactDOM, Didact };
