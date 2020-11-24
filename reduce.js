const reduce = (arr, fn, initial) => {
  const hasInitial = typeof initial !== 'undefined';
  let acc = hasInitial ? initial : arr[0];

  (hasInitial ? arr : arr.slice(1)).forEach((item, index) => {
    acc = fn(acc, item, index, arr);
  });
  return acc;
};

const array1 = [1, 2, 3, 4];
const reducer = (accumulator, currentValue) => accumulator + currentValue;

console.log(reduce(array1, reducer, 10));
