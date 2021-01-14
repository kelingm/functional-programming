// get(obj, 'a.b.c', 0)
const get = (obj, path, defaultValue) =>
  (path || '').split('.').reduce((acc, cur) => (acc = (acc || {})[cur]), obj) || defaultValue;

// get(()=>a.b.c, 0)
function get(fn, defaultValue) {
  try {
    return fn() || defaultValue;
  } catch (e) {
    return defaultValue;
  }
}
