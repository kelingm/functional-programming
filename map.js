const map = (arr, fn) => {
  const result = [];
  arr.forEach((item, index) => result.push(fn(item, index, arr)));
  return result;
};

var a = [1, 2, 3, 4];
console.log(map(a, item => item * 2));
