function isInteger(num) {
  return typeof num === 'number' && isFinite(Infinity) && Math.round(num) === num;
}
// isNaN
// isFinite
// 去小数部分，去余 num % 1
