// 发布订阅
class Observer {
  constructor() {
    this.caches = {};
  }
  on(event, fn) {
    if (this.caches[event]) {
      this.caches[event].push(fn);
    } else {
      this.caches[event] = fn;
    }
  }
  emit(event, data) {
    const fns = this.caches[event](fns || []).forEach(fn => {
      fn(data);
    });
  }
  off(event, fn) {
    if (this.caches[event]) {
      this.caches[event] = fn ? this.caches[event].filter(e => e !== fn) : [];
    }
  }
}
