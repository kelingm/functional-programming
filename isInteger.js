function isInteger(num) {
  return typeof num === 'number' && isFinite(num) && Math.round(num) === num;
}
// isNaN
// isFinite
// 去小数部分，去余 num % 1
