// 一个 Proxy 对象包装另一个对象并拦截诸如读取/写入属性和其他操作，可以选择自行处理它们，或者透明地允许该对象处理它们。
let array = [1, 2, 3];

array = new Proxy(array, {
  get(target, prop, receiver) {
    if (prop < 0) {
      // prop 是一个字符串，所以我们需要将其转换成数字
      prop = +prop + target.length;
    }
    return Reflect.get(target, prop, receiver);
  },
});

const negativeArray = arr =>
  new Proxy(arr, {
    get(target, prop, receiver) {
      if (prop < 0) {
        // prop 是一个字符串，所以我们需要将其转换成数字
        prop = +prop + target.length;
      }
      return Reflect.get(target, prop, receiver);
    },
  });

array = negativeArray(array);
