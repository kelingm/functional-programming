// 实现Object.create
// var obj = Object.create(proto) ==> obj.__proto__ = proto
function create(proto) {
  const F = function () {};
  F.prototype = proto;
  return new F();
}

// 实现new
// var b = newF(a)=> b.__proto__ == a.prototype
function newF(F, ...args) {
  const obj = Object.create(F.prototype);
  F.apply(obj, ...args);
  return obj;
}

// 实现instanceOf L instanceof R
function instance_of(L, R) {
  let o = L;
  while (o) {
    if (o === R.prototype) return true;
    o = o.__proto__;
  }
  return false;
}

// 组合继承
function inherit(sub, sup) {
  const proto = Object.create(sup.prototype);
  proto.constructor = sub;
  sub.prototype = proto;
}
function SuperType(name) {
  // 私有
  this.name = name;
  this.colors = ['red', 'blue'];
}
// 实例共享
SuperType.prototype.sayName = function () {
  alert(this.name);
};
function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
inheritPrototype(SubType, SuperType);
SubType.prototype.sayAge = function () {
  alert(this.age);
};

function inherit(sub, sup) {
  const proto = Object.create(sub.prototype);
  sub.prototype = proto;
}
