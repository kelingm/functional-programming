// Promise 三种状态
const PENDING = 'Pending';
const FULFILLED = 'Fulfilled';
const REJECTED = 'Rejected';
// promise  处理过程
function promiseResolutionProcedure(promise2, x, resolve, reject) {
  // 判断循环引用
  if (promise2 === x) {
    throw new Error('循环引用 promise');
  }
  // 处理 promise 对象
  if (x instanceof MyPromise) {
    if (x.state === PENDING) {
      x.then(y => {
        promiseResolutionProcedure(promise2, y, resolve, reject);
      }, reject);
    } else {
      x.state === FULFILLED && resolve(x.value);
      x.state === REJECTED && reject(x.value);
    }
  }
  // 判断 thenable 对象
  if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
    if (typeof x.then === 'function') {
      x.then(y => {
        promiseResolutionProcedure(promise2, y, resolve, reject);
      }, reject);
    } else {
      resolve(x);
    }
  } else {
    resolve(x);
  }
}
class MyPromise {
  static all(promiseArray) {
    return new MyPromise((resolve, reject) => {
      let resultArray = [];
      let successTimes = 0;

      function processResult(index, data) {
        resultArray[index] = data;
        successTimes++;
        if (successTimes === promiseArray.length) {
          // 处理成功
          resolve(resultArray);
        }
      }

      for (let i = 0; i < promiseArray.length; i++) {
        promiseArray[i].then(
          data => {
            processResult(i, data);
          },
          err => {
            // 处理失败
            reject(err);
          },
        );
      }
    });
  }
  constructor(fn) {
    this.state = PENDING;
    this.value = undefined;
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];
    const resolve = val => {
      if ((typeof val === 'object' || typeof val === 'function') && val.then) {
        promiseResolutionProcedure(this, val, resolve, reject);
        return;
      }
      setTimeout(() => {
        if (this.state === PENDING) {
          this.state = FULFILLED;
          this.value = val;
          // 执行所有的 then 方法
          this.resolveCallbacks.map(fn => fn());
        }
      }, 0);
    };
    const reject = val => {
      if ((typeof val === 'object' || typeof val === 'function') && val.then) {
        promiseResolutionProcedure(this, val, resolve, reject);
        return;
      }
      setTimeout(() => {
        if (this.state === PENDING) {
          this.value = val;
          this.state = REJECTED;
          // 执行所有的 then 方法
          this.rejectCallbacks.map(fn => fn());
        }
      }, 0);
    };
    fn(resolve, reject);
  }
  then(
    onFulfilled = val => val,
    onRejected = err => {
      throw new Error(err);
    },
  ) {
    let promise2 = null;
    // 处理已经完成的 promise
    if (this.state === FULFILLED) {
      promise2 = new MyPromise((resolve, reject) => {
        const x = onFulfilled(this.value);
        promiseResolutionProcedure(promise2, x, resolve, reject);
      });
    }

    // 处理已经完成的 promise
    if (this.state === REJECTED) {
      promise2 = new MyPromise((resolve, reject) => {
        const x = onRejected(this.value);
        promiseResolutionProcedure(promise2, x, resolve, reject);
      });
    }

    // 处理尚未完成的 promise
    if (this.state === PENDING) {
      promise2 = new MyPromise((resolve, reject) => {
        this.resolveCallbacks.push(() => {
          const x = onFulfilled(this.value);
          promiseResolutionProcedure(promise2, x, resolve, reject);
        });

        this.rejectCallbacks.push(() => {
          const x = onRejected(this.value);
          promiseResolutionProcedure(promise2, x, resolve, reject);
        });
      });
    }
    return promise2;
  }
}

var a = Promise.resolve(3).then(() => {
  return new Promise(resolve => resolve(4));
});