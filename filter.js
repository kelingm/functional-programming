const filter = (arr, fn) => {
  const result = [];
  arr.forEach((item, index) => {
    if (fn(item, index, arr)) {
      result.push(item);
    }
  });
  return result;
};
const a = [1, 3, false, 0, true, null];
console.log(filter(a, item => item));
