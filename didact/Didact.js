import { initializeUpdateQueue, enqueueUpdate, createUpdate } from './updateQueue';
import { createFiber, createFiberRoot } from './fiber';
import { scheduleUpdateOnFiber } from './reconcile';
const TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型
const ENOUGH_TIME = 1;

export const LegacyRoot = 0;
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

let workInProgress = null; // 当前已创建的workInProgress fiber
let workInProgressRoot = null;
let updateQueue = [];

const randomKey = Math.random().toString(36).slice(2);
/////////////////////////////////////////////////////////////////////

// babel编译工具把 jsx 转换为 原生 js ，调用createElement方法
// 替换 const element = <h1 title="foo">Hello</h1>
// const element = React.createElement(
//   "h1",
//   { title: "foo" },
//   "Hello"
// )
// 我们需要让createElement返回一个element对象，格式为：
// const element = {
//   type: "h1",
//   key: "",
//   props: {
//     title: "foo",
//     children: "Hello",
//   },
// }
function createElement(type, config, ...args) {
  const { key = '', ...props } = config || {};
  const rawChildren = args.length > 0 ? [].concat(...args) : [];
  // null == undefined // true, null == false // false
  props.children = rawChildren
    .filter(t => t == null || t === false)
    .map(child => (typeof child === 'string' ? createTextElement(child) : child));

  return {
    type,
    key,
    props,
  };
}

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }
  render() {}
  setState(partialState) {
    updateQueue.push({
      from: ClassComponent,
      instance: this,
      partialState,
    });
    scheduleUpdate();
  }
}

///////////////////
function createTextElement(text) {
  // return {
  //   type: TEXT_ELEMENT,
  //   props: {
  //     nodeValue: text,
  //   },
  // };
  return createElement(TEXT_ELEMENT, { nodeValue: text });
}

const Didact = {
  createElement,
  Component,
};

// export default Didact;

/////////////////////////////////////////////////////////////
function DidactDOM() {}
const DidactDOM = {
  render(element, container) {
    return legacyRenderSubtreeIntoContainer(null, element, container);
  },
};

function legacyRenderSubtreeIntoContainer(parentComponent, children, container) {
  // 创建update
  const update = createUpdate();
  // update.payload为需要挂载在根节点的组件
  update.payload = { element };

  // 创建fiberRootNode和rootFiber和关联
  const root = (container._reactRootContainer = new ReactDOMBlockingRoot(
    container,
    LegacyRoot,
    options,
  ));
  fiberRoot = root._internalRoot;

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
  // root.current['__reactContainer$' + randomKey] = container
  this._internalRoot = root;
}
