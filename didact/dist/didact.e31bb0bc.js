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
})({"Didact.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Didact = exports.DidactDOM = void 0;

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TEXT_ELEMENT = 'TEXT ELEMENT'; // 类型

var stateQueue = [];
var componentQueue = []; // 触发更新的方法
// 1. ReactDOM.render()  通常只会在入口文件执行一次
// 2. component.setState
//   - DidactDOM.updateComponent

var flush = function flush() {
  var item, component; // 计算每个组件的state

  while (item = stateQueue.shift()) {
    var _item = item,
        partialState = _item.partialState,
        _component = _item.component;
    if (!_component.prevState) _component.prevState = _objectSpread({}, _component.state);

    if (typeof partialState === 'function') {
      _component.state = _objectSpread(_objectSpread({}, _component.state), partialState(_component.prevState, _component.props));
    } else {
      _component.state = _objectSpread(_objectSpread({}, _component.state), partialState);
    }

    _component.prevState = _component.state;
  } // 渲染每个组件


  while (component = componentQueue.shift()) {
    DidactDOM.updateComponent(component);
  }
};

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
      // 异步
      if (stateQueue.length === 0) {
        Promise.resolve().then(function () {
          return flush();
        });
      }

      stateQueue.push({
        partialState: partialState,
        component: this
      });

      if (componentQueue.indexOf(this) === -1) {
        componentQueue.push(this);
      }
    }
  }]);

  return Component;
}();

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
} ///////////////////////////////////////////////////////////////////////////////DidactDOM


var rootInstance = null; //   const instance = { dom, element, childInstances };

var DidactDOM = {
  // 渲染入口
  render: function render(element, container) {
    // element是JSX对象
    var prevInstance = rootInstance;
    var nextInstance = reconcile(container, prevInstance, element);
    rootInstance = nextInstance;
  },
  // 更新组件
  updateComponent: function updateComponent(component) {
    var internalInstance = component.__internalInstance;
    reconcile(internalInstance.dom.parentNode, internalInstance, internalInstance.element);
  },
  setComponentProps: function setComponentProps(component, props) {
    component.props = props;
    return this.updateComponent(component);
  }
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

exports.DidactDOM = DidactDOM;

function reconcile(parentDom, instance, element) {
  if (!instance) {
    // 新增
    var newInstance = instantiate(element);
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
      updateDomProperties(instance.dom, instance.element.props, element.props); // 更新子元素

      instance.childInstances = reconcileChildren(instance, element);
      instance.element = element;
      return instance;
    } else {
      // 组件类型
      // 更新组件props
      var component = instance.component;
      component.props = element.props; // 重新render组件,获取vdom

      var childElement = component.render();
      var oldChildInstance = instance.childInstance;
      var childInstance = reconcile(parentDom, oldChildInstance, childElement); // 对比-剩下-孩子

      instance.dom = childInstance.dom;
      instance.childInstance = childInstance;
      instance.element = element;
      return instance;
    }
  } else {
    // 类型不同，直接替换
    var _newInstance = instantiate(element);

    parentDom.replaceChild(_newInstance.dom, instance.dom);
    return _newInstance;
  }
} // function reconcileChildren(instance, element) {
//   const parentDom = instance.dom;
//   const childInstances = instance.childInstances;
//   const childElements = element.props.children || [];
//   const count = Math.max(childInstances.length, childElements.length);
//   const newChildInstances = [];
//   for (let i = 0; i < count; i++) {
//     // 有可能新增或减少子元素
//     const newChildInstance = reconcile(parentDom, childInstances[i], childElements[i]);
//     newChildInstances.push(newChildInstance);
//   }
//   return newChildInstances.filter(instance => instance != null); // 过滤掉删除的元素
// }


function reconcileChildren(instance, element) {
  var parentDom = instance.dom;
  var childInstances = instance.childInstances;
  var childElements = element.props.children || [];
  var count = Math.min(childInstances.length, childElements.length); // 最小值

  console.log({
    count: count
  });
  var newChildInstances = [];
  var i = 0; // 第一轮遍历

  for (; i < count; i++) {
    var childInstance = childInstances[i];
    var oldElement = childInstance.element;
    var childElement = childElements[i];

    if (oldElement.key === childElement.key) {
      if (oldElement.type === childElement.type) {
        // 可以复用
        var newChildInstance = reconcile(parentDom, childInstance, childElement);
        newChildInstances.push(newChildInstance);
      } else {// type不同，删除原来的元素 todo
      }
    } else {
      // key 不同，跳出第一轮遍历
      console.log('break');
      break;
    }
  }

  var lastIndex = i - 1; // 将剩下的childInstances按ky进行map

  var existingChildren = {};

  for (; i < childInstances.length; i++) {
    existingChildren[childInstances[i].element.key] = {
      instance: childInstances[i],
      index: i
    };
  }

  for (var _i = lastIndex + 1; _i < childElements.length; _i++) {
    var _childElement = childElements[_i];
    var item = existingChildren[_childElement.key];

    if (item) {
      var mountIndex = item.index;

      var _newChildInstance = reconcile(parentDom, item.instance, _childElement);

      if (lastIndex < mountIndex) {
        // 不动
        newChildInstances.push(_newChildInstance);
      } else {
        // 移动到最后
        parentDom.appendChild(_newChildInstance.dom); // Node.appendChild() 方法将一个节点附加到指定父节点的子节点列表的末尾处。
        // 如果将被插入的节点已经存在于当前文档的文档树中，
        // 那么 appendChild() 只会将它从原先的位置移动到新的位置（不需要事先移除要移动的节点）。
      }

      lastIndex = Math.max(lastIndex, mountIndex);
    } else {
      // 新增
      var _newChildInstance2 = instantiate(_childElement);

      if (childInstances[lastIndex + 1]) {
        parentDom.insertBefore(_newChildInstance2.dom, childInstances[lastIndex + 1].dom);
      } else {
        // 最后
        parentDom.appendChild(_newChildInstance2.dom);
      }

      newChildInstances.push(_newChildInstance2);
    }

    delete existingChildren[_childElement.key];
  } // 遍历原来未处理的元素， 删除


  Object.values(existingChildren).map(function (item) {
    return item.instance;
  }).forEach(function (instance) {
    parentDom.removeChild(instance.dom);
  });
  return newChildInstances.filter(function (instance) {
    return instance != null;
  });
} // 创建instance对象
// 新建虚拟dom组件  instance:{dom, element, childInstance, component}
// 新建虚拟dom元素 instance: {dom, element, childInstances}


function instantiate(element) {
  var type = element.type,
      props = element.props; // ---组件类型

  if (typeof type === 'function') {
    var instance = {};
    var component = createComponent(element, instance); // 组件实例

    var childElement = component.render(); // 调用组件render，获得 组件 element

    var childInstance = instantiate(childElement);
    var _dom = childInstance.dom;
    Object.assign(instance, {
      dom: _dom,
      // 组件dom
      element: element,
      // jsx对象
      childInstance: childInstance,
      // 组件render后的element instance, 没有childInstances
      component: component // 组件实例

    });
    return instance;
  } // ---dom元素


  var dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(type);
  updateDomProperties(dom, [], props);
  var childInstances = (props.children || []).map(instantiate);
  var childDoms = childInstances.map(function (childInstance) {
    return childInstance.dom;
  });
  childDoms.forEach(function (child) {
    return dom.appendChild(child);
  });
  return {
    dom: dom,
    element: element,
    childInstances: childInstances
  };
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
} // 创建组件实例


function createComponent(element, internalInstance) {
  var type = element.type,
      props = element.props;
  var component;

  if (type.prototype.render) {
    // 类组件
    component = new type(props);
  } else {
    component = new Didact.Component(props);
    component.constructor = type;

    component.render = function () {
      return type(component.props);
    };
  }

  component.__internalInstance = internalInstance;
  return component;
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _Didact = require("./Didact");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// import React, { ReactDOM } from 'react';
// import ReactDOM from 'react-dom';
var Hello = function Hello(_ref) {
  var name = _ref.name,
      children = _ref.children;
  return _Didact.Didact.createElement("div", null, "hello world ", name, name > 2 && 'hah', name < 5 && 'eee', children);
};

var rootDom = document.getElementById('root'); // DidactDOM.render(<Welcome />, rootDom);
// ReactDom.render(App, root);
// 1.render方法
// - jsx和vdom： babel调用createElement(设置babel)
// 2. 组件
// function tick() {
//   const time = new Date().toLocaleTimeString();
//   const clockElement = <h1>{time}</h1>;
//   DidactDOM.render(clockElement, rootDom);
// }
// tick();
// setInterval(tick, 1000);

var randomLikes = function randomLikes() {
  return Math.ceil(Math.random() * 100);
};

var App = /*#__PURE__*/function (_Didact$Component) {
  _inherits(App, _Didact$Component);

  var _super = _createSuper(App);

  function App(props) {
    var _this;

    _classCallCheck(this, App);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "handleClick", function (story) {
      var a = [].concat(_this.state.stories);
      a.splice(a.findIndex(function (item) {
        return item.name === story.name;
      }), 1);
      console.log({
        a: a
      });

      _this.setState({
        stories: a
      });
    });

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
              stories: [1, 3, 4, 5, 6]
            });
          }
        }, t);
      }));
    }
  }]);

  return App;
}(_Didact.Didact.Component);

var StoryElement = function StoryElement(_ref2) {
  var story = _ref2.story,
      handleClick = _ref2.handleClick;
  return _Didact.Didact.createElement("li", null, _Didact.Didact.createElement("button", {
    onClick: function onClick(e) {
      return handleClick(story);
    }
  }, story.likes, _Didact.Didact.createElement("b", null, "\u2764\uFE0F")), _Didact.Didact.createElement("a", {
    href: story.url
  }, story.name));
};

_Didact.DidactDOM.render(_Didact.Didact.createElement(App, null), document.getElementById('root'));
},{"./Didact":"Didact.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60686" + '/');

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