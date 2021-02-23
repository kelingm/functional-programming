// 接受2个参数
const curry2 = fn => a => b => fn(a, b);
const add2 = (a, b) => a + b;
curry2(add2)(1)(2);

// 🚗接受多个参数
function curry(fn) {
  const arity = fn.length;
  return function fn1(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    } else {
      return function fn2(...args2) {
        return fn1.apply(this, [...args, ...args2]);
      };
    }
  };
}

// 支持placeholder
const _ = {};
function curry_(fn) {
  const arity = fn.length;
  return function fn1(...args) {
    if (args.slice(0, arity).filter(item => item !== _).length >= arity) {
      return fn.apply(this, args);
    } else {
      return function fn2(...args2) {
        let position = 0;
        const realArgs = args;
        for (let i = 0; i < args.length; i++) {
          realArgs[i] = args[i] === _ ? args2[position++] : args[i];
        }
        while (position < args2.length) realArgs.push(args2[position++]);
        return fn1.apply(this, realArgs);
      };
    }
  };
}

const add = (a, b, c) => a * b + c;

var result = curry_(add)(_, 2)(3, 3);
console.log({ result });
