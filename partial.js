
/**
 * 预设原始函数的一些参数来创建一个拥有更少参数的新函数
 */

// 使用 Function.prototype.bind 实现偏函数。（会改变this指向）
// const add1More = add3.bind(null, 2, 3)

// // 不改变 this 指向的方法
// function partial(fn) {
//     var args = [].slice.call(arguments, 1);
//     return function() {
//         var newArgs = args.concat([].slice.call(arguments));
//         return fn.apply(this, newArgs);
//     };
// };

// 支持placeholder
const _ = {};
function partial(fn) {
  let args = [].slice.call(arguments, 1);
  return function () {
    let position = 0;
    const len = args.length;
    for (let i = 0; i < len; i++) {
      args[i] = args[i] === _ ? arguments[position++] : args[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return fn.apply(this, args);
  };
}
const add3 = (a,b,c) =>a*b+c
const t = partial(add3, _,3)
console.log(t(4,5))