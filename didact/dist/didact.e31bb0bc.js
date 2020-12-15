// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"Didact4.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Didact = exports.DidactDOM = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型
// Fiber tags

var HOST_COMPONENT = 'host';
var CLASS_COMPONENT = 'class';
var FUNCTION_COMPONENT = 'function';
var HOST_ROOT = 'root'; // effect tags

var PLACEMENT = 1;
var DELETION = 2;
var UPDATE = 3;
var ENOUGH_TIME = 1; // global state
// {from, dom, newProps}

var updateQueue = [];
var nextUnitOfWork = null;
var pendingCommit = null; // 已经completeWork的根fiber

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


var Component = /*#__PURE__*/function () {
  function Component(props) {
    _classCallCheck(this, Component);

    this.state = {};
    this.props = props;
  }

  _createClass(Component, [{
    key: "render",
    value: function render() {// 子类继承
    }
  }, {
    key: "setState",
    value: function setState(partialState) {
      updateQueue.push({
        from: CLASS_COMPONENT,
        instance: this,
        partialState: partialState
      });
      scheduleUpdate();
    }
  }]);

  return Component;
}(); // 保存实例中fiber的引用


function createInstance(fiber) {
  // 实例化组件
  var instance;

  if (fiber.type.prototype.render) {
    instance = new fiber.type(fiber.props);
  } else {
    instance = new Didact.Component(fiber.props);
    instance.constructor = fiber.type;

    instance.render = function () {
      return fiber.type(fiber.props);
    };
  }

  instance.__fiber = fiber;
  return instance;
}

var Didact = {
  createElement: createElement,
  Component: Component
}; // Didact元素 {type,key, props}
// JSX babel自动调用 生成Didact元素
// children: [[{}, {}, {}]] (当使用map的时候)
// 或者 [{}, {}]

exports.Didact = Didact;

function createElement(type) {
  var _ref;

  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _key$config = _objectSpread({
    key: ''
  }, config),
      key = _key$config.key,
      props = _objectWithoutProperties(_key$config, ["key"]); // const newChildren = children.map();
  // 排除undefined和null、false
  //<div>hello {name}</div> 会有两个child， {name}可能为undefined
  // false: {count && <div>hello</div>}


  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var hasChildren = args.length > 0;
  var rawChildren = hasChildren ? (_ref = []).concat.apply(_ref, args) : []; // concat可以合并数组或值

  props.children = rawChildren.filter(function (c) {
    return c != null && c !== false;
  }).map(function (c) {
    return c instanceof Object ? c : createTextElement(c);
  });
  return {
    type: type,
    key: key,
    props: props
  };
} // 格式化文本类型


function createTextElement(value) {
  // 规范数据
  return createElement(TEXT_ELEMENT, {
    nodeValue: value
  });
} // 组件调度更新
// 类似render


function scheduleUpdate() {
  requestIdleCallback(performWork);
}

function createDomElement(fiber) {
  var isTextElement = fiber.type === TEXT_ELEMENT;
  var dom = isTextElement ? document.createTextNode('') : document.createElement(fiber.type);
  updateDomProperties(dom, [], fiber.props);
  return dom;
} ///////////////////////////////////////////////////////////////////////////////DidactDOM


var DidactDOM = {
  // 渲染入口
  render: function render(element, container) {
    updateQueue.push({
      // 根
      from: HOST_ROOT,
      dom: container,
      newProps: {
        children: element
      }
    });
    scheduleUpdate();
  }
}; // 在render或setState（scheduleUpdate) 或performWork 的时候会触发延迟回调performWork
// deadline是requestIdleCallback回调传入的参数

exports.DidactDOM = DidactDOM;

function performWork(deadline) {
  workLoop(deadline); // 还有任务未完成，需要等待下一个浏览器空闲时间执行

  if (nextUnitOfWork || updateQueue.length > 0) {
    requestIdleCallback(performWork);
  }
} // 在有足够时间时，循环执行work
// 一个workLoop至少会执行一次performUnitOfWork（如果有）


function workLoop(deadline) {
  if (!nextUnitOfWork) {
    // 没有任务要执行了
    resetNextUnitOfWork();
  } // 每执行完一个unitwork，判断是否还有足够的剩余时间和是否还有任务未完成，来判断是否要继续执行


  while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  } // 如果有在等待commit的任务，则立即commit


  if (pendingCommit) {
    commitAllWork(pendingCommit);
  }
} // 执行任务并返回下一个要执行的unitOfWork(child 或 sibling)
// unitWork指：找出dom需要更新的部分，来构建work tree，
// 每一个unitWork是一个Fiber
// 深度优先遍历


function performUnitOfWork(wipFiber) {
  beginWork(wipFiber);

  if (wipFiber.child) {
    // 如果有子节点，那么下一个fiber是子节点
    return wipFiber.child;
  } // 如果没有child了，则这个fiber需要执行completeWork，并返回sibling或parent（如果没有sibling了）


  var uow = wipFiber; // 一直循环，直到在根节点执行completeWork

  while (uow) {
    completeWork(uow);

    if (uow.sibling) {
      return uow.sibling;
    } // 如果没有sibling了，会继续往parent中执行


    uow = uow.parent;
  }
} // 查找需要更新的属性，并标志effect
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
} // host component的stateNode即原生dom


function updateHostComponent(wipFiber) {
  if (!wipFiber.stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber);
  }

  var newChildElements = wipFiber.props.children;
  reconcileChildrenArray(wipFiber, newChildElements);
} // 组件的stateNode指向react元素（render（）返回的对象）
// 组件实例
//  {
//    type,
//    props,
//    key
//  }


function updateClassComponent(wipFiber) {
  var instance = wipFiber.stateNode;

  if (instance == null) {
    // 第一次渲染，调用类初始化， 创建新的实例
    instance = wipFiber.stateNode = createInstance(wipFiber);
  } else if (wipFiber.props === instance.props && !wipFiber.partialState) {
    // 组件没有更新, 不需要重新reconcile,直接克隆子树
    // shouldComponentUpdate()
    cloneChildFibers(wipFiber);
    return;
  } // 更新实例的props、state


  instance.props = wipFiber.props;
  instance.state = _objectSpread(_objectSpread({}, instance.state), wipFiber.partialState);
  wipFiber.partialState = null; // 重新render，或许新的childElements

  var newChildElements = wipFiber.stateNode.render();
  reconcileChildrenArray(wipFiber, newChildElements);
} // 在循环之外调用
// 获取来自pendingCommit的effects，来变更DOM，这里会实际更新dom
// 这一部分不能中断，必须一次性完成，避免出现不一致的UI


function commitAllWork(fiber) {
  // 每个effect 也是一个fiber
  fiber.effects.forEach(function (f) {
    commitWork(f);
  });
  fiber.stateNode.__rootContainerFiber = fiber;
  nextUnitOfWork = null;
  pendingCommit = null;
}

function commitWork(fiber) {
  // 根节点，结束
  if (fiber.tag === HOST_ROOT) return;
  var domParentFiber = fiber.parent;

  while (domParentFiber.tag === CLASS_COMPONENT) {
    domParentFiber = domParentFiber.parent;
  }

  var domParent = domParentFiber.stateNode;

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
  var node = fiber;

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
} // 从updateQueue获取第一个更新(root)，并转换为第一个nextUnitOfWork


function resetNextUnitOfWork() {
  var update = updateQueue.shift(); // 先进先出

  if (!update) return; // 组件state更新

  if (update.partialState) {
    // 将partialState保存__fiber里
    update.instance.__fiber.partialState = update.partialState;
  } // 获取根节点，从根开始进行比较
  // 第一次调用render的时候（update.from === HOST_ROOT）， 还没有alternate， 为null


  var root = update.from === HOST_ROOT ? update.dom.__rootContainerFiber : getRoot(update.instance.__fiber); // 第一个nextUnitOfWork（Fiber是一个unitOfWork，一个工作单元）
  // 这个Fiber是一个新的work tree的根

  nextUnitOfWork = {
    tag: HOST_ROOT,
    // root
    stateNode: update.dom || root.stateNode,
    // 两种情况：更新时update.dom, 第一次渲染：root.stateNode
    props: update.newProps || root.props,
    // 如果props没有更新，则使用旧的props
    alternate: root
  };
} // 根据parent链，找到旧Fiber树的根


function getRoot(fiber) {
  var node = fiber;

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
  var elements = arrify(newChildElements);
  var index = 0;
  var oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null; // currentFiber

  var newFiber = null; // element[0] --- wipFiber.alternate.child
  // elements[1] --- wipFiber.alternate.child.sibling
  // ....以此类推
  // 如果elements.length === 0 && oldFiber !== null, 则是进行了删除

  while (index < elements.length || oldFiber != null) {
    var prevFiber = newFiber;
    var element = index < elements.length && elements[index];
    var sameType = oldFiber && element && element.type === oldFiber.type; // 类型相同， 赋值alternate

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        tag: oldFiber.tag,
        stateNode: oldFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        partialState: oldFiber.partialState,
        effectTag: UPDATE,
        alternate: oldFiber
      };
    } // 类型改变或新增


    if (element && !sameType) {
      newFiber = {
        type: element.type,
        tag: typeof element.type === 'string' ? HOST_COMPONENT : CLASS_COMPONENT,
        props: element.props,
        parent: wipFiber,
        effectTag: PLACEMENT
      };
    } // 删除oldFiber


    if (oldFiber && !sameType) {
      oldFiber.effectTag = DELETION;
      wipFiber.effects = wipFiber.effects || [];
      wipFiber.effects.push(oldFiber); // 不是newFiber的一部分，所以需要添加到wipFiber.effects里，防止丢失
    }

    if (oldFiber) {
      // 更新oldFiber(接下来要处理sibling)
      oldFiber = oldFiber.sibling;
    } // 链接


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
  var oldFiber = parentFiber.alternate;
  if (!oldFiber) return;
  var oldChild = oldFiber.child;
  var prevChild = null; // 更加sibling链复制childFibers

  while (oldFiber) {
    var newChild = {
      type: oldFiber.type,
      tag: oldFiber.tag,
      stateNode: oldFiber.stateNode,
      props: oldFiber.props,
      partialState: oldFiber.partialState,
      alternate: oldFiber,
      parent: parentFiber
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
} // 当wipFiber没有新的孩子，或者我们已经完成了所有孩子的工作时，运行completeWork


function completeWork(fiber) {
  // 更新class component fiber的引用
  if (fiber.tag === CLASS_COMPONENT) {
    fiber.stateNode.__fiber = fiber;
  }

  if (fiber.parent) {
    var childEffects = fiber.effects || [];
    var thisEffect = fiber.effectTag != null ? [fiber] : [];
    var parentEffects = fiber.parent.effects || [];
    fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
  } else {
    // 已经到根节点了，所以已经完成这次要更新的所有工作，收集了所有effects
    // 赋值pendingCommit，以便在workLoop中会调用commitAllWork
    pendingCommit = fiber;
  }
}

function updateDomProperties(dom, prevProps, nextProps) {
  // 删除已经删除的属性
  for (var key in prevProps) {
    if (!key in nextProps) {
      removeAttribute({
        key: key,
        value: prevProps[key],
        dom: dom
      });
    }

    if (isEvent(key)) {
      removeAttribute({
        key: key,
        value: prevProps[key],
        dom: dom
      });
    }
  } // 如果属性改变， 设置新的属性


  for (var _key2 in nextProps) {
    // console.log({ key });
    if (nextProps[_key2] !== prevProps[_key2]) {
      setAttribute({
        key: _key2,
        value: nextProps[_key2],
        dom: dom
      });
    }
  }
}

var isEvent = function isEvent(name) {
  return name.startsWith('on');
};

function removeAttribute(_ref2) {
  var key = _ref2.key,
      value = _ref2.value,
      dom = _ref2.dom;

  // todo
  if (isEvent(key)) {
    var event = key.slice(2).toLocaleLowerCase();
    dom.removeEventListener(event, value);
  } else {
    setAttribute({
      key: key,
      undefined: undefined,
      dom: dom
    });
  }
}

function setAttribute(_ref3) {
  var key = _ref3.key,
      value = _ref3.value,
      dom = _ref3.dom;
  if (key === 'children') return;

  if (isEvent(key)) {
    // 事件
    var event = key.slice(2).toLocaleLowerCase();
    dom.addEventListener(event, value);
  } else if (key === 'style') {
    // 样式
    for (var name in value) {
      dom.style[name] = value[name];
    }
  } else if (key === 'className') {
    dom.setAttribute('class', value);
  } else {
    dom[key] = value; // textNode没有setAttribute方法

    dom.setAttribute && dom.setAttribute(key, value);
  }
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _Didact = require("./Didact4");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

// import React from 'react';
// import ReactDOM from 'react-dom';
var Hello = function Hello(_ref) {
  var name = _ref.name,
      children = _ref.children;
  return _Didact.Didact.createElement("div", null, "hello world ", name, name > 2 && 'hah', name < 5 && 'eee', children);
}; // 1.render方法
// - jsx和vdom： babel调用createElement(设置babel)
// 2. 组件


var App = /*#__PURE__*/function (_Didact$Component) {
  _inherits(App, _Didact$Component);

  var _super = _createSuper(App);

  function App(props) {
    var _this;

    _classCallCheck(this, App);

    _this = _super.call(this, props);
    _this.state = {
      stories: [1, 2, 3, 4]
    };
    return _this;
  }

  _createClass(App, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return _Didact.Didact.createElement("div", null, this.state.stories.map(function (t, index) {
        return _Didact.Didact.createElement("button", {
          key: t,
          onClick: function onClick() {
            _this2.setState({
              stories: [3, 4]
            });
          }
        }, t);
      }));
    }
  }]);

  return App;
}(_Didact.Didact.Component);

_Didact.DidactDOM.render(_Didact.Didact.createElement(App, null), document.getElementById('root'));
},{"./Didact4":"Didact4.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60191" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/didact.e31bb0bc.js.map