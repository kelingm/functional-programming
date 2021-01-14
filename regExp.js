new RegExp('(\\s|^)' + cls + '(\\s|$)');

var str = '您好，<%=name%>。欢迎来到<%=location%>';
function template(str) {
  // your code
  return obj => str.replace(/<%=(\w+)%>/g, (match, p) => obj[p] || '');
}
var compiled = template(str);
// compiled的输出值为：“您好，张三。欢迎来到网易游戏”
compiled({ name: '张三', location: '网易游戏' });

String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
};

function formatNumber(num) {
  /*
      ①/\B(?=(\d{3})+(?!\d))/g：正则匹配非单词边界\B，即除了1之前的位置，其他字符之间的边界，后面必须跟着3N个数字直到字符串末尾
    ②(\d{3})+：必须是1个或多个的3个连续数字;
    ③(?!\d)：第2步中的3个数字不允许后面跟着数字;
  */
  return (num + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// console.log(formatNumber(1234567890)) // 1,234,567,890

var isEmail = function (val) {
  var pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  var domains = [
    'qq.com',
    '163.com',
    'vip.163.com',
    '263.net',
    'yeah.net',
    'sohu.com',
    'sina.cn',
    'sina.com',
    'eyou.com',
    'gmail.com',
    'hotmail.com',
    '42du.cn',
  ];
  if (pattern.test(val)) {
    var domain = val.substring(val.indexOf('@') + 1);
    for (var i = 0; i < domains.length; i++) {
      if (domain == domains[i]) {
        return true;
      }
    }
  }
  return false;
};

trace;
