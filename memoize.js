const _ = require('lodash');
const memoize = (fn, resolver) => {
  const _cache = {};
  return function () {
    // console.log(22, _cache);
    const key = resolver ? resolver(arguments) : JSON.stringify(arguments);
    if (_cache[key]) return _cache[key];
    else {
      console.log('count');
      const result = fn.apply(this, arguments);
      _cache[key] = result;
      return result;
    }
  };
};

const add = n => (n <= 0 ? n : n + add(n - 1));

const fibonacci = n => (n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2));

const memFib = memoize(fibonacci);
console.time('count');
console.log(memFib(110));
console.timeEnd('count');
