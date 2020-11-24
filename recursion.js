var _ = require('ramda');

// 1.计算一个数组的总和：循环
const sum1 = arr => {
  let acc = 0;
  for (let i = 0; i < arr.length; i++) {
    acc += arr[i];
  }
  return acc;
};

// 函数式
const sum2 = arr => arr.reduce((acc, item) => acc + item, 0);

// 递归
const sum3 = arr => {
  if (arr.length <= 0) return 0; // 终止条件
  return arr[0] + sum3(arr.slice(1)); // 递归公式
};

// 尾递归
const sum4 = (arr, acc = 0) => {
  if (arr.length <= 0) return acc;
  return sum4(arr.slice(1), acc + arr[0]);
};
// console.log(sum1([1, 2, 3, 4]));
// console.log(sum2([1, 2, 3, 4]));
// console.log(sum3([1, 2, 3, 4]));
// console.log(sum4([1, 2, 3, 4]));
//-------------------------------

// n:5, 1+2+3+4+5
const add = n => (n <= 0 ? n : n + add(n - 1));

// 2. 斐波那契数列 fibonacci  0,1,1,2,3,5
// 递归
const fibonacci = n => (n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2));

// 尾递归
const fibonacci1 = (n, n1 = 0, n2 = 1) => {
  if (n < 2) return n2;
  return fibonacci1(n - 1, n2, n2 + n1);
};
// fibonacci1(5, 0, 1)
// fibonacci1(4, 1, 1)
// fibonacci1(3, 1, 2)
// fibonacci1(2, 2, 3)
// fibonacci1(1, 3, 5)

// 缓存
const fibonacci2 = n => {
  const memoize = [];
  return (() => {
    if (n < 2) return n;
    if (typeof memoize[n - 1] === 'undefined') {
      memoize[n - 1] = fibonacci2(n - 1);
    }
    if (typeof memoize[n - 2] === 'undefined') {
      memoize[n - 2] = fibonacci2(n - 2);
    }
    memoize[n] = memoize[n - 1] + memoize[n - 2];
    return memoize[n];
  })();
};
// 动态规划
const fibonacci3 = n => {
  let a = 0;
  let b = 1;
  let i = 1;

  while (i++ <= n) {
    [a, b] = [b, a + b];
  }
  return a;
};

// 3. n!循环
const factorial = n => {
  let result = 1;
  while (n) {
    result *= n;
    n--;
  }
  return result;
};
// 递归
const factorial1 = n => (n < 2 ? 1 : factorial(n - 1) * n);
// 尾递归
const factorial2 = (n, acc = 1) => {
  if (n <= 1) return acc;
  return factorial2(n - 1, acc * n);
};
// factorial2(5, 1)
// factorial2(4, 1 * 5)
// factorial2(3, 5 * 4)
// factorial2(2, 20 * 3)
// factorial2(1, 60 * 2)
// 120

console.log(factorial1(100));
