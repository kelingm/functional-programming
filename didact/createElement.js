const TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型

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
export function createElement(type, config, ...args) {
  const props = config || {};
  const key = props.key || null;
  const ref = props.ref || null;
  const rawChildren = args.length > 0 ? [].concat(...args) : [];
  // null == undefined // true, null == false // false
  const children = rawChildren
    .filter(t => t == null || t === false)
    .map(child => (typeof child === 'string' ? createTextElement(child) : child));

  if (children.length) {
    // if there is only on child, it not need an array, such as child use as a function
    props.children = children.length === 1 ? children[0] : children;
  }
  delete props.key;
  return {
    type,
    key,
    ref,
    props,
  };
}

export function createTextElement(text) {
  // return {
  //   type: TEXT_ELEMENT,
  //   props: {
  //     nodeValue: text,
  //   },
  // };
  return createElement(TEXT_ELEMENT, { nodeValue: text });
}

export const Fragment = props => {
  return props.children;
};
