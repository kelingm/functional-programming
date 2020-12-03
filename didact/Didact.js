// 1. 渲染DOM元素
// 2. 元素创建和JSX
// 3. 实例-对比和虚拟DOM
// 4. 组件和状态
// 5. Fibre-递增对比
import { TEXT_ELEMENT } from './constants';
const stateQueue = [];
const componentQueue = [];

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
    DidactDOM.renderComponent(component);
  }
};
class Component {
  constructor(props) {
    this.state = {};
    this.props = props;
  }
  render() {
    DidactDOM.renderComponent(this);
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
    // 无延迟
    // this.state = { ...this.state, ...partialState };
    // DidactDOM.renderComponent(this);
  }
}

const Didact = {
  createElement(type, config = {}, ...children) {
    const { key, ...props } = { key: '', ...config };
    // console.log({ children });
    const newChildren = children.map(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        return {
          type: TEXT_ELEMENT,
          props: {
            nodeValue: child,
          },
        };
      }
      return child;
    });
    //<div>hello {name}</div> 会有两个child， {name}可能为空
    // false: {count && <div>hello</div>}
    props.children = newChildren.filter(item => item); // 排除undefined和null
    return {
      type,
      key,
      props: { ...props },
    };
  },
  Component,
};

function createComponent(type, props) {
  let component;
  if (type.prototype.render) {
    // 类组件
    component = new type(props);
  } else {
    component = new Didact.Component(props);
    component.constructor = type;
    component.render = () => type(component.props);
  }
  const dom = DidactDOM.renderComponent(component);
  dom.__component = component;
  return dom;
}

///////////////////////////////////////////////////////////////////////////////
const DidactDOM = {
  render(vnode, parentDom) {
    parentDom.appendChild(_render(vnode));
  },

  // 更新组件
  renderComponent(component) {
    const vnode = component.render();
    let dom;
    // const dom = this._render(vnode);
    if (component.__dom) {
      dom = diff(component.__dom, vnode);

      // 更新
      component.componentDidUpdate && component.componentDidUpdate();
    } else {
      // 第一次渲染
      dom = _render(vnode);
      component.componentDidMount && component.componentDidMount();
    }

    // 更新元素
    // if (component.__dom && component.__dom.parentNode) {
    //   // replaceChild(新，旧)
    //   // 直接替换
    //   component.__dom.parentNode.replaceChild(dom, component.__dom);
    // }
    component.__dom = dom;

    return dom;
  },
  setComponentProps(component, props) {
    component.props = props;
    return this.renderComponent(component);
  },
};

function diff(dom, vnode) {
  if (!dom) return;
  let newDom = dom;
  // dom元素类型
  if (typeof vnode.type === 'string') {
    // 相同text类型
    if (dom.nodeType === 3 && vnode.type === TEXT_ELEMENT) {
      if (dom.nodeValue !== vnode.props.nodeValue) {
        // 内容变更
        dom.nodeValue = vnode.props.nodeValue;
      }
      return dom;
    } else if (dom.tagName && dom.tagName.toLocaleLowerCase() === vnode.type) {
      // 相同类型
      diffAttributes(dom, vnode);
    } else {
      // 类型改变, 直接替换
      newDom = _render(vnode);
      dom && dom.parentNode && dom.parentNode.replaceChild(newDom, dom);
      return newDom;
    }
  } else {
    // 组件类型
    console.log('diffComponent', diffComponent(dom, vnode));
    return diffComponent(dom, vnode);
  }

  // 遍历子节点（数组）
  newDom = diffChildren(newDom, vnode.props.children);
  return newDom;
}

function diffAttributes(dom, vnode) {
  const oldProps = dom.getAttributeNames().reduce((acc, name) => {
    acc[name] = dom.getAttribute(name);
    return acc;
  }, {});
  // 删除已经删除的属性
  for (let key in oldProps) {
    if (!key in vnode.props) {
      setAttribute({ key, value: undefined, dom });
    }
  }
  for (let key in vnode.props) {
    if (vnode.props[key] !== oldProps[key]) {
      setAttribute({ key, value: vnode.props[key], dom });
    }
  }
}

function diffChildren(dom, vchildren) {
  if (!vchildren) return;
  const domChildren = dom.childNodes;
  const children = domChildren;
  let i = 0;
  for (; i < vchildren.length; i++) {
    if (!domChildren[i]) {
      // 新增
      dom.appendChild(_render(vchildren[i]));
    } else {
      const d = diff(domChildren[i], vchildren[i]);
      console.log('in diffChildren', d);
      //
    }
  }
  // 数量减少
  for (; i < domChildren.length; i++) {
    dom.removeChild(domChildren[i]);
  }
  return dom;
}

function setAttribute({ key, value, dom }) {
  if (key === 'children') return;
  if (/^on(\w+)$/.test(key)) {
    // 事件
    const event = key.match(/^on(\w+)/)[1].toLocaleLowerCase();
    dom.addEventListener(event, value); // todo
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

function diffComponent(dom, vnode) {
  let c = dom && dom.__component;
  // 组件类型不变
  if (c && c.constructor === vnode.type) {
    return DidactDOM.setComponentProps(c, vnode.props);
    // return DidactDOM.renderComponent(c);
  } else {
    // 类型改变
    if (c) {
      // 改变
      // umountComponent
    } else {
      // 新增
      // createComponent(vnode.type, vnode.props);
      return _render(vnode);
    }
    // 创建组件
  }
}

function _render(vnode) {
  const { type, props } = vnode;
  // 组件类型
  if (typeof type === 'function') {
    return createComponent(type, props);
  }
  let dom;
  if (type === TEXT_ELEMENT) {
    dom = document.createTextNode('');
  } else {
    dom = document.createElement(type);
  }
  Object.keys(props).forEach(key => {
    const value = props[key];
    setAttribute({ key, value, dom });
  });
  (props.children || []).forEach(child => DidactDOM.render(child, dom));
  return dom;
}

export { DidactDOM, Didact };
