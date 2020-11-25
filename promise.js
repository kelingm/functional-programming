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

function ajax(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
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

// 实现一个promise
const PENDING = 'pending';
const FULFILLED = 'fullfilled';
const REJECTED = 'rejected';

function MyPromise(executor) {
  this.value = null;
  this.error = null;
  this.status = PENDING;
  this.onFulfilled = []; // 支持多个回调绑定
  this.onRejected = [];
  const resolve = value => {
    if (this.status !== PENDING) return;
    setTimeout(() => {
      // 延时执行，模拟微任务，因为在执行resolve的时候，回调函数还未绑定，需要等待 then方法绑定回调函数
      this.status = FULFILLED;
      this.value = value;
      let onFulfilled;
      while ((onFulfilled = this.onFulfilled.shift())) {
        onFulfilled && onFulfilled(value);
      }
      return value;
    });
  };
  const reject = error => {
    if (this.status !== PENDING) return;
    setTimeout(() => {
      this.status = REJECTED;

      this.error = error;
      let onRejected;
      while ((onRejected = this.onRejected.shift())) {
        onRejected && onRejected(error);
      }
      return error;
    });
  };
  executor(resolve, reject);
}
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  if (this.status === PENDING) {
    // 返回一个新的promise来支持链式调用
    return (bridgePromise = new MyPromise((resolve, reject) => {
      this.onFulfilled.push(value => {
        const result = (typeof onFulfilled === 'function' ? onFulfilled : value => value)(value);
        resolvePromise(result, resolve, reject);
      });
      this.onRejected.push(value => {
        const result = (typeof onRejected === 'function'
          ? onRejected
          : error => {
              throw error;
            })(value);
        reject(result);
      });
    }));
  } else if (this.status === FULFILLED) {
    onFulfilled(this.value);
  } else {
    onRejected(this.error);
  }
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

function resolvePromise(x, resolve, reject) {
  // 如果返回一个promise, 继续递归调用处理这个promise，直到最后的值非promise
  if (x instanceof MyPromise) {
    if (x.status === PENDING) {
      x.then(value => {
        resolvePromise(value, resolve, reject);
      }, reject);
    } else {
      x.then(resolve, reject);
    }
  } else {
    resolve(x);
  }
}

// var promise4 = new MyPromise((resolve, reject) => {
//   resolve('ok');
// })
//   .then(
//     () => {
//       console.log('suc');
//       // return 2;
//       return new MyPromise((resolve, reject) => reject('ero'));
//     },
//     () => console.log('fail'),
//   )
//   .then(
//     v => console.log('eee' + v),
//     // error => console.log('fail', error),
//   )
//   .catch(e => console.log('error!!' + e));
var promise3 = new Promise((resolve, reject) => {
  resolve('ok');
});
// promise3.then(
//   () => console.log('succ'),
//   () => console.log('fail'),
// );
// setTimeout(() => {
//   promise3.then(
//     () => console.log('succ1'),
//     () => console.log('fail'),
//   );
// });
var x = promise3.then(() => {
  console.log(22);
  return 22;
});
setTimeout(() => {
  console.log({ x, promise3 });
}, 1);
