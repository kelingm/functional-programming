const TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型
const stateQueue = [];
const componentQueue = [];

// 触发更新的方法
// 1. ReactDOM.render()  通常只会在入口文件执行一次
// 2. component.setState
//   - DidactDOM.updateComponent

const flush = () => {
  let item, component;
  // 计算每个组件的state
  while ((item = stateQueue.shift())) {
    const { partialState, component } = item;
    if (!component.prevState) component.prevState = { ...component.state };
    if (typeof partialState === 'function') {
      component.state = {
        ...component.state,
        ...partialState(component.prevState, component.props),
      };
    } else {
      component.state = { ...component.state, ...partialState };
    }
    component.prevState = component.state;
  }
  // 渲染每个组件
  while ((component = componentQueue.shift())) {
    DidactDOM.updateComponent(component);
  }
};
class Component {
  constructor(props) {
    this.state = {};
    this.props = props;
  }
  render() {
    // 子类继承
  }
  setState(partialState) {
    // 异步
    if (stateQueue.length === 0) {
      Promise.resolve().then(() => flush());
    }
    stateQueue.push({
      partialState,
      component: this,
    });
    if (componentQueue.indexOf(this) === -1) {
      componentQueue.push(this);
    }
  }
}

const Didact = {
  createElement,
  Component,
};

// Didact元素 {type,key, props}
// JSX babel自动调用 生成Didact元素
function createElement(type, config = {}, ...children) {
  const { key, ...props } = { key: '', ...config };
  // const newChildren = children.map();
  // 排除undefined和null、false
  //<div>hello {name}</div> 会有两个child， {name}可能为undefined
  // false: {count && <div>hello</div>}
  props.children = (children || [])
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

///////////////////////////////////////////////////////////////////////////////DidactDOM
let rootInstance = null;
//   const instance = { dom, element, childInstances };
const DidactDOM = {
  // 渲染入口
  render(element, container) {
    // element是JSX对象
    const prevInstance = rootInstance;
    const nextInstance = reconcile(container, prevInstance, element);

    rootInstance = nextInstance;
  },

  // 更新组件
  updateComponent(component) {
    const internalInstance = component.__internalInstance;

    reconcile(internalInstance.dom.parentNode, internalInstance, internalInstance.element);
  },
  setComponentProps(component, props) {
    component.props = props;
    return this.updateComponent(component);
  },
};

/**
 *
 * @param {*} parentDom
 * @param {*} instance 当前的instance对象
 * @param {*} element
 * @return 生成新的instance（vdom）
 */
// 1. 没有vdom, 创建
// 2. 已经有vdom， 更新触发
// --- 对比-虚拟dom树， 进行增、删、改（类型相同）、替换（类型不同）
function reconcile(parentDom, instance, element) {
  if (!instance) {
    // 新增
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (!element) {
    // 删除
    parentDom.removeChild(instance.dom);
    return null;
  } else if (instance.element.type === element.type) {
    // 相同类型

    // dom原始类型
    if (typeof element.type === 'string') {
      // 更新属性
      updateDomProperties(instance.dom, instance.element.props, element.props);
      // 更新子元素
      instance.childInstances = reconcileChildren(instance, element);
      instance.element = element;
      return instance;
    } else {
      // 组件类型
      // 更新组件props
      const component = instance.component;
      component.props = element.props;
      // 重新render组件
      const childElement = component.render();
      const oldChildInstance = instance.childInstance;
      const childInstance = reconcile(parentDom, oldChildInstance, childElement); // 对比-剩下-孩子
      instance.dom = childInstance.dom;
      instance.childInstance = childInstance;
      instance.element = element;
      return instance;
    }
  } else {
    // 类型不同，直接替换
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  }
}

function reconcileChildren(instance, element) {
  const parentDom = instance.dom;
  const childInstances = instance.childInstances;
  const childElements = element.props.children || [];
  const count = Math.max(childInstances.length, childElements.length);
  const newChildInstances = [];

  for (let i = 0; i < count; i++) {
    // 有可能新增或减少子元素
    const newChildInstance = reconcile(parentDom, childInstances[i], childElements[i]);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances.filter(instance => instance != null); // <---- 2
}
// 创建instance对象
// 新建虚拟dom组件  instance:{dom, element, childInstance, component}
// 新建虚拟dom元素 instance: {dom, element, childInstances}
function instantiate(element) {
  const { type, props } = element;
  // ---组件类型
  if (typeof type === 'function') {
    const instance = {};

    const component = createComponent(element, instance); // 组件实例
    const childElement = component.render(); // 调用组件render，获得 组件 element
    const childInstance = instantiate(childElement); // 组件内部只有一个子元素
    const dom = childInstance.dom;
    Object.assign(instance, {
      dom, // 组件dom
      element, // jsx对象
      childInstance, // 组件instance
      component, // 组件实例
    });
    return instance;
  }
  // ---dom元素
  const dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(type);

  updateDomProperties(dom, [], props);
  const childInstances = (props.children || []).map(instantiate);
  const childDoms = childInstances.map(childInstance => childInstance.dom);
  childDoms.forEach(child => dom.appendChild(child));
  return {
    dom,
    element,
    childInstances,
  };
}

function updateDomProperties(dom, prevProps, nextProps) {
  // 删除已经删除的属性
  for (let key in prevProps) {
    if (!key in nextProps) {
      removeAttribute({ key, value: prevProps[key], dom });
    }
  }
  // 如果属性改变， 设置新的属性
  for (let key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      setAttribute({ key, value: nextProps[key], dom });
    }
  }
}

const isEvent = name => name.startsWith('on');

function removeAttribute({ key, value, dom }) {
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

// 创建组件实例
function createComponent(element, internalInstance) {
  const { type, props } = element;
  let component;
  if (type.prototype.render) {
    // 类组件
    component = new type(props);
  } else {
    component = new Didact.Component(props);
    component.constructor = type;
    component.render = () => type(component.props);
  }
  component.__internalInstance = internalInstance;
  return component;
}
export { DidactDOM, Didact };
