function binarySearch(arr, v) {
  let low = 0,
    high = arr.length - 1;
  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    if (v === arr[mid]) {
      return mid;
    } else if (v < arr[mid]) {
      high = mid - 1;
    } else if (v > arr[mid]) {
      low = mid + 1;
    }
  }
  return -1;
}
var arr = [-1, 0, 3, 5, 9, 12, 15];
// 输入: nums = [-1,0,3,5,9,12], target = 9
console.log(binarySearch(arr, 12));
