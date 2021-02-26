const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  status = PENDING;
  _onFulfilledCallbacks = [];
  _onRejectedCallbacks = [];
  value = null;
  error = null;
  constructor(executor) {
    executor(this._resolve.bind(this), this._reject.bind(this));
  }
  _resolve(value) {
    setTimeout(() => {
      // 状态只做改变一次
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this._onFulfilledCallbacks.forEach(fn => fn(value));
      }
    });
  }
  _reject(e) {
    setTimeout(() => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.error = e;
        this._onRejectedCallbacks.forEach(fn => fn(e));
      }
    });
  }
  then(onFulfilled, onRejected) {
    if (this.status === PENDING) {
      // 返回promise支持链式调用
      return new MyPromise((resolve, reject) => {
        this._handleCallbacks({
          onFulfilled,
          onRejected,
          resolve,
          reject,
        });
      });
    } else if (this.status === FULFILLED) {
      onFulfilled(this.value);
    } else {
      onRejected(this.value);
    }
  }
  _handleCallbacks({ onFulfilled, onRejected, resolve, reject }) {
    const getCallback = callback => {
      return value => {
        const result = callback(value);
        // Promise.resolve(3).then(res=>Promise.resolve(res))
        if (
          result instanceof MyPromise ||
          (result instanceof Object && result !== null && result.then instanceof Function)
        ) {
          result.then(
            res => resolve(res),
            err => reject(err),
          );
          resolve(result);
        }
      };
    };
    this._onFulfilledCallbacks.push(getCallback(onFulfilled));
    this._onRejectedCallbacks.push(getCallback(onRejected));
  }
  finally(onFinally) {
    this._onFulfilledCallbacks.push(onFinally);
    this._onRejectedCallbacks.push(onFinally);
  }
  catch(onRejected) {
    this.then(null, onRejected);
  }
  static resolve(value) {
    return new MyPromise((resolve, reject) => {
      resolve(value);
    });
  }
  static reject(e) {
    return new MyPromise((resolve, reject) => {
      reject(e);
    });
  }
  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.map((promise, index) => {
        promise.then(
          res => {
            resolve(res);
          },
          e => {
            reject(e);
          },
        );
      });
    });
  }
  static all(promises) {
    return new Promise((resolve, reject) => {
      const result = [];
      let count = 0;

      promises.map((promise, index) => {
        promise.then(
          res => {
            result[index] = res;
            if (++count === promises.length) {
              resolve(result);
            }
          },
          e => {
            reject(e);
          },
        );
      });
    });
  }
  static allSettled(promises) {
    return new Promise((resolve, reject) => {
      const result = [];
      let count = 0;

      promises.map((promise, index) => {
        promise.then(
          res => {
            result[index] = { status: FULFILLED, value: res };
            if (++count === promises.length) {
              resolve(result);
            }
          },
          e => {
            result[index] = { status: REJECTED, reason: e };
            if (++count === promises.length) {
              resolve(result);
            }
          },
        );
      });
    });
  }
}

// 注册的多个onFulfilled
var promise1 = new MyPromise((resolve, reject) => {
  resolve('ok');
});
promise1.then(() => {
  console.log('suc');
});
promise1.then(res => console.log(res));
setTimeout(() => {
  promise1.then(res => console.log(res));
}, 1000);

// 链式调用
new MyPromise((resolve, reject) => {
  resolve('ok');
})
  .then(v => {
    console.log('suc:' + v);
    return new MyPromise(resolve => resolve(3));
  })
  .then(res => console.log(res));

// catch
new MyPromise((resolve, reject) => {
  reject('error!!');
}).then(
  v => {
    console.log('suc:' + v);
  },
  e => console.log('err:' + e),
);

// 链式调用
new MyPromise((resolve, reject) => {
  resolve('ok');
})
  .then(
    v => {
      console.log('suc:' + v);
      return new MyPromise(resolve => resolve(3));
    },
    err => 'err',
  )
  .then(res => console.log('e:' + res))
  .finally(() => console.log('finally'));

// Promise.all
console.time('t');
MyPromise.all([
  new MyPromise(resolve => setTimeout(() => resolve(4), 1000)),
  new MyPromise(resolve => setTimeout(() => resolve(4), 2000)),
]).then(res => {
  console.timeEnd('t');
  console.log(res);
});
