// 去重
// [0, 1, 2, '1', '1', 3, '3']
function unique(arr) {
  return Array.from(new Set(arr));
}
