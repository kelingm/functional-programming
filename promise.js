// 加载图片
function loadImageAsync(url) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = function () {
      reject(new Error('Could not load image at ' + url));
    };
    image.src = url;
  });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.src = url;

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${url}`));

    document.head.append(script);
  });
}

function ajax(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

//为 HTTP 错误创建一个自定义类用于区分 HTTP 错误和其他类型错误
class HttpError extends Error {
  // (1)
  constructor(response) {
    super(`${response.status} for ${response.url}`);
    this.name = 'HttpError';
    this.response = response;
  }
}

function loadJson(url) {
  // (2)
  return fetch(url).then(response => {
    if (response.status == 200) {
      return response.json();
    } else {
      throw new HttpError(response);
    }
  });
}

// 1. Promise.all 全部resolve或有一个reject就结束
// const promise1 = Promise.resolve(3);
// const promise2 = 42;
// const promise3 = new Promise((resolve, reject) => {
//   setTimeout(reject, 100, 'error');
// });

// Promise.all([promise1, promise2, promise3])
//   .then(values => {
//     console.log(values);
//   })
//   .catch(e => console.log(e));
// error
let names = ['iliakan', 'remy', 'jeresig'];

let requests = names.map(name => fetch(`https://api.github.com/users/${name}`));

Promise.all(requests)
  // 将响应数组映射（map）到 response.json() 数组中以读取它们的内容
  .then(responses => Promise.all(responses.map(r => r.json())))
  // 所有 JSON 结果都被解析："users" 是它们的数组
  .then(users => console.log(users));

// 2. Promise.allSettled
let urls = [
  'https://api.github.com/users/iliakan',
  'https://api.github.com/users/remy',
  'https://no-such-url',
];
Promise.allSettled(urls.map(url => fetch(url))).then(results => {
  results.forEach(result => {
    if (result.status == 'fulfilled') {
      alert(`${urls[num]}: ${result.value.status}`);
    }
    if (result.status == 'rejected') {
      alert(`${urls[num]}: ${result.reason}`);
    }
  });
});

////////////////////////////////////////

// promisify
// callback(err, res1, res2, ...)
const promisify = (fn, manyArgs = false) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, ...data) => {
        if (err) {
          reject(err);
        } else {
          resolve(manyArgs ? data : data[0]);
        }
      });
    });
  };
};
// function loadScript(src, callback) {
//   let script = document.createElement('script');
//   script.src = src;

//   script.onload = () => callback(null, script);
//   script.onerror = () => callback(new Error(`Script load error for ${src}`));

//   document.head.append(script);
// }
// const loadScriptPromise = promisify(loadScript);
// loadScriptPromise('path/script.js').then(
//   data => console.log(data),
//   err => console.log('error: ' + err),
// );

class Thenable {
  constructor(num) {
    this.num = num;
  }
  then(resolve, reject) {
    alert(resolve);
    // 1000ms 后使用 this.num*2 进行 resolve
    setTimeout(() => resolve(this.num * 2), 1000); // (*)
  }
}
