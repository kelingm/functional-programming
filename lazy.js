// https://github.com/dtao/lazy.js/
const { add } = require('lodash');
var _ = require('lodash');
var users = [
  { user: 'barney', age: 36 },
  { user: 'fred', age: 40 },
  { user: 'pebbles', age: 18 },
];

var names = _.chain(users)
  .map(function (user) {
    return user.user;
  })
  .join(', ')
  .value();
console.log(names);

var youngest = _.chain(users)
  .sortBy('age')
  .map(function (chr) {
    console.log('map', chr);
    return chr.user + ' is ' + chr.age;
  })
  .take(1)
  .value();
console.log(youngest);

function priceLt(x) {
  return function (item) {
    console.log({ item });
    return item.price < x;
  };
}
var gems = [
  { name: 'Sunstone', price: 4 },
  { name: 'Amethyst', price: 15 },
  { name: 'Prehnite', price: 20 },
  { name: 'Sugilite', price: 7 },
  { name: 'Diopside', price: 3 },
  { name: 'Feldspar', price: 13 },
  { name: 'Dioptase', price: 2 },
  { name: 'Sapphire', price: 20 },
];

var chosen = _.chain(gems).filter(priceLt(10)).take(3).value();
console.log({ chosen });

//---------------------------
// 实现
const MAX_ARRAY_LENGTH = 4294967295; // 最大的数组长度
const LAZY_FILTER_FLAG = 1; // filter方法的标记
const LAZY_MAP_FLAG = 2; // map
// 缓存数据结构体
function LazyWrapper(value) {
  this.__wrapped__ = value; // 原数据
  this.__iteratees__ = []; // 迭代函数
  this.__takeCount__ = MAX_ARRAY_LENGTH;
}

// 惰性求值的入口
function lazy(value) {
  return new LazyWrapper(value);
}

// 根据 筛选方法iteratee 筛选数据
function filter(iteratee) {
  this.__iteratees__.push({
    iteratee: iteratee,
    type: LAZY_FILTER_FLAG,
  });
  return this;
}
// 绑定方法到原型链上
LazyWrapper.prototype.filter = filter;

function map(iteratee) {
  this.__iteratees__.push({
    iteratee: iteratee,
    type: LAZY_MAP_FLAG,
  });
  return this;
}
// 绑定方法到原型链上
LazyWrapper.prototype.map = map;

// 截取n个数据
function take(n) {
  this.__takeCount__ = n;
  return this;
}

LazyWrapper.prototype.take = take;

// 惰性求值
function lazyValue() {
  var array = this.__wrapped__;
  var takeCount = Math.min(array.length, this.__takeCount__);
  var iteratees = this.__iteratees__;
  var iterLength = iteratees.length;
  var index = -1; // 外层循环下标
  var result = [];

  // 先遍历数据
  outer: while (index < array.length && result.length < takeCount) {
    index++;

    let iterIndex = -1;
    let value = array[index];
    // 然后value要经过每一个iteratees迭代器的计算
    while (++iterIndex < iterLength) {
      let { iteratee, type } = iteratees[iterIndex];
      var computed = iteratee(value); // 迭代函数计算的结果
      if (type === LAZY_MAP_FLAG) {
        // map，一定要有返回值
        value = computed;
      } else if (type === LAZY_FILTER_FLAG) {
        // 处理数据不符合要求的情况
        if (!computed) {
          // 如果是假值则此value不需要继续判断，直接判断下一个value
          continue outer;
        }
      }
    }

    // 经过内层循环，符合要求的数据
    result.push(value);
  }

  return result;
}

LazyWrapper.prototype.value = lazyValue;

var testArr = [1, 19, 30, 2, 12, 5, 28, 4];

var result = lazy(testArr)
  .filter(function (x) {
    console.log('check x=' + x);
    return x < 10;
  })
  .map(item => item * 2)
  .take(2)
  .value();

console.log(result);
