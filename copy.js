function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  let result = new obj.constructor();

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepCopy(obj[key]);
    }
  }
  return result;
}

function isType(obj, type) {
  return Object.prototype.toString.call(obj) === `[object ${type}]`;
}

// else if (isType(obj[key], 'Array')) {
//   result[key] = obj[key].map(val=> {
//     if (typeof val === 'object' && val !== null) {
//       return deepCopy(val)
//     }
//     return val
//   })
// }
