// 大数相加
let a = '9007199254740991';
let b = '1234567899999999999';
function add(a, b) {
  const maxLength = Math.max(a.length, b.length);
  let f = 0; // 进位
  let result = '';
  a = String(a).padStart(maxLength, '0');
  b = String(b).padStart(maxLength, '0');
  for (let i = maxLength - 1; i >= 0; i--) {
    let sum = parseInt(a[i]) + parseInt(b[i]) + f;
    f = Math.floor(sum / 10);
    result = (sum % 10) + result;
  }
  if (f === 1) {
    result = '1' + result;
  }
  return result;
}
// 大数相乘
function multiply(num1, num2) {
  if (num1 === '0' || num2 === '0') return '0';
  const m = num1.length,
    n = num2.length;
  const pos = new Array(m + n);
  pos.fill(0);
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      let mul = num1[i] * num2[j];
      const p1 = i + j; // 十位
      const p2 = i + j + 1; // 个位
      const sum = mul + pos[p2]; // pos[p2]上一次计算的十位
      pos[p1] += Math.floor(sum / 10);
      pos[p2] = sum % 10;
    }
  }
  return pos.join('').replace(/^0+/, ''); //去掉首位0
}

// 浮点数相加
// 浮点数转整数
// 1e+100 === Math.pow(10, 100) === 10的100次方
function toInteger(floatNum) {
  var len = (('' + floatNum).split('.')[1] || '').length;
  var times = Math.pow(10, len);
  var num = +('' + floatNum).replace('.', '');
  return {
    times,
    num,
  };
}

// 0.1+0.2, 0.1+0.02
// 0.1 + 0.2 = 0.30000000000000004
// 0.7 + 0.1 = 0.7999999999999999
// 0.2 + 0.4 = 0.6000000000000001
function add(num1, num2) {
  const a = toInteger(num1);
  const b = toInteger(num2);
  const times = Math.max(a.times, b.times);
  return (num1 * times + num2 * times) / times;
}
// 减法 =====================
// 1.5 - 1.2 = 0.30000000000000004
// 0.3 - 0.2 = 0.09999999999999998
function subtract(num1, num2) {
  const a = toInteger(num1);
  const b = toInteger(num2);
  const times = Math.max(a.times, b.times);
  return (num1 * times - num2 * times) / times;
}
// 19.9 * 100 = 1989.9999999999998
// 0.8 * 3 = 2.4000000000000004
// 35.41 * 100 = 3540.9999999999995
function multiply(num1, num2) {
  const a = toInteger(num1);
  const b = toInteger(num2);
  return (a.num * b.num) / (a.times * b.times);
}

// 除法 =====================
// 0.3 / 0.1 = 2.9999999999999996
// 0.69 / 10 = 0.06899999999999999
function divide(num1, num2) {
  const a = toInteger(num1);
  const b = toInteger(num2);
  return (a.num / b.num) * (b.times / a.times);
}
