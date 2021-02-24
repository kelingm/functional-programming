const { reject } = require('lodash');

function delay(time) {
  console.log('start delay', time);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('end delay', time);
      resolve(time);
    }, time);
  });
}

async function logInOrder(times) {
  const textPromises = times.map(async time => {
    const response = await delay(time);
    return response;
  });

  // 按次序输出
  // for await (const textPromise of textPromises) {
  //   // 异步generator
  //   console.log(textPromise);
  // }
}
logInOrder([800, 200, 500, 1000]);

function logInOrder(times) {
  const ge = function* generator() {
    yield Promise.all(
      times.map(time => {
        delay(time);
      }),
    );
  };

  return run(ge);
}

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

// 使用async await封装fetch
class Request {
  async get(url) {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return response;
    }
  }
  async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return response;
    }
  }
}

// 并行请求
function delay(time) {
  console.log('start delay', time);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('end delay', time);
      resolve(time);
    }, time);
  });
}

async function logInOrder(times) {
  const textPromises = times.map(time => delay(time));
  console.log({ textPromises });
  // 按次序输出
  for await (const textPromise of textPromises) {
    // 异步generator
    console.log(textPromise);
  }
}

async function f() {
  const result = await Promise.all([delay(200), delay(100)]);
  console.log({ result });
}

async function f1() {
  const result = [];
  const p = [delay(200), delay(100)];
  // 按次序输出
  try {
    for await (const res of p) {
      result.push(res);
    }
  } catch (e) {
    result.push(e);
  }
  console.log(result);
}

// async是Generator 函数的语法糖, Generator 函数的执行必须靠执行器, async内置了执行器。
// async函数的实现原理就是基于promise，将 Generator 函数和自动执行器，包装在一个函数里。
function myAsync(gen) {
  return () => spawn(gen);

  // 内置的generator执行器
  function spawn(gen) {
    const g = gen();
    return new Promise((resolve, reject) => {
      function step(val) {
        let res;
        try {
          res = g.next(val);
        } catch (e) {
          return reject(e);
        }
        if (res.done) {
          return resolve(res.value);
        }
        // res.value可能是可以promise或普通值
        Promise.resolve(res.value).then(
          val => {
            step(val);
          },
          err => {
            g.throw(err);
          },
        );
      }
      step();
    });
  }
}

async function fn() {
  try {
    const a = await delay(1000);
    const b = await 2;
    console.log({ a, b });
    await Promise.reject('error');
  } catch (e) {
    console.log(e);
  }
}
// 等价于
const fn = myAsync(function* () {
  try {
    const a = yield delay(1000);
    const b = yield 2;
    return { a, b };
    // yield Promise.reject('error');
  } catch (error) {
    console.error(error);
  }
});

async function f() {
  console.log(a);
}

try {
  await f();
} catch (e) {
  console.log(11, e);
}

let f = Promise.reject(3);
