const co = require('co');
// 可迭代对象
var range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      next() {
        if (this.current <= this.last) {
          return { value: this.current++, done: false };
        } else {
          return { done: true };
        }
      },
    };
  },
};

var range = {
  from: 1,
  to: 5,
  *[Symbol.iterator]() {
    let value = this.from;
    while (value <= this.to) {
      yield value++;
    }
  },
};

for (let value of range) {
  console.log({ value });
}

// 异步可迭代对象
// 可迭代对象
var range = {
  from: 1,
  to: 5,
  [Symbol.asyncIterator]() {
    return {
      current: this.from,
      last: this.to,
      async next() {
        await new Promise(resolve => setTimeout(resolve, 1000)); // (3)
        if (this.current <= this.last) {
          return { value: this.current++, done: false };
        } else {
          return { done: true };
        }
      },
    };
  },
};
for await (let value of range) {
  console.log({ value });
}

// generator function 返回一个generator对象，可迭代
function* generateSequence(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

for (let value of generateSequence(1, 5)) {
  alert(value); // 1，然后 2，然后 3，然后 4，然后 5
}

///////////////////////////////////////
// 执行器（自动执行generator）
// 1. promise
function run(gen) {
  const generator = gen();
  const next = data => {
    const result = generator.next(data);

    if (!result.done) {
      result.value.then(data => {
        next(data);
      });
    } else {
      return result.value;
    }
  };
  next();
}

var gen = function* () {
  var f1 = yield Promise.resolve(1);
  var f2 = yield Promise.resolve(2);
  console.log(f1, f2);
};
run(gen);

////////////////////////
// 2. thunkify
// 将多参函数转换为只接受callback为参数的函数
function thunkify(fn) {
  return function () {
    const args = Array.prototype.slice.call(arguments, 0);
    const ctx = this;

    return function (callback) {
      let called = false;
      args.push(function () {
        if (called) return; //回调函数只运行一次
        called = true;
        callback.apply(null, arguments);
      });
      try {
        fn.apply(ctx, args);
      } catch (e) {
        callback(e);
      }
    };
  };
}

function f(a, b, callback) {
  var sum = a + b;
  callback(null, sum);
  callback(null, sum);
}

var ft = thunkify(f);
// ft(1, 2)(console.log);

// fn:只接受一个callback为参数的函数
function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}
thunkToPromise(ft(1, 2)).then(res => console.log(res));
