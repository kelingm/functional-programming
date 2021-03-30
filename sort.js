// 两次循环，两两比较, 先排序最大的
// 冒泡排序
function bubbleSort(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (arr[j + 1] < arr[j]) {
        let t = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = t;
      }
    }
  }
  return arr;
}

function bubbleSort2(arr) {
  var pos;
  for (var i = arr.length - 1; i > 0; i--) {
    pos = i;
    for (var j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        var tmp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = tmp;

        pos = j + 1; // 记录最后一次交换的位置，后面的已经排列好了，后续
      }
    }
    i = pos; //为下一趟排序作准备
  }
  return arr;
}

// 快排
// 找到该数组的基准点(中间数)，并创建两个空数组left和right；
// 遍历数组，拿出数组中的每个数和基准点进行比较，如果比基准点小就放到left数组中，如果比基准点大就放到right数组中；
// 对数组left和right进行递归调用。
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  let left = [],
    right = [],
    t = arr[0],
    i = 1;
  while (i < arr.length) {
    if (arr[i] <= t) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
    i++;
  }
  return [...quickSort(left), t, ...quickSort(right)];
}

var arr = [3, 18, 4, 1, 2];

function quickSort(arr, start = 0, end = arr.length - 1) {
  if (start > end) return arr;
  let index = start;
  let key = arr[index];
  for (let i = start + 1; i <= end; i++) {
    if (arr[i] < key) {
      arr[index] = arr[i];
      arr[i] = arr[index + 1];
      arr[index + 1] = key;
      index++;
    }
  }
  quickSort(arr, start, index - 1);
  quickSort(arr, index + 1, end);
  return arr;
}

function mergeSort(arr, l = 0, r = arr.length - 1) {
  if (l >= r) return arr;
  const mid = Math.floor((l + r) / 2);
  // 数组分成左右两个部分，分别排序
  mergeSort(arr, l, mid);
  mergeSort(arr, mid + 1, r);
  // 合并两个部分
  if (arr[mid] > arr[mid + 1]) _merge(arr, l, mid, r);
  return arr;

  function _merge(arr, l, mid, r) {
    let i = l,
      j = mid + 1,
      t = l;
    const copy = [...arr];
    while (i <= mid && j <= r) {
      if (copy[i] < copy[j]) {
        arr[t++] = copy[i++];
      } else {
        arr[t++] = copy[j++];
      }
    }

    while (i <= mid) {
      //将左边剩余元素填充进temp中
      arr[t++] = copy[i++];
    }
    while (j <= r) {
      //将右序列剩余元素填充进temp中
      arr[t++] = copy[j++];
    }
    return arr;
  }
}
