const TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型
let updateQueue = [];

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
  setState(partialState) {}
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
const DidactDOM = {
  render(element, container) {
    updateQueue.push({
      // 根
      from: HOST_ROOT,
      dom: container,
      newProps: { children: [element] },
    });
    scheduleUpdate();
  },
};
