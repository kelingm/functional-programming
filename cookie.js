// 返回具有给定 name 的 cookie，
// 如果没找到，则返回 undefined
function getCookie(name) {
  const reg = new RegExp('(?:^|; )' + name + '=([^;]*)(;|$)');
  let matches = document.cookie.match(reg);
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  options = {
    path: '/',
    // 如果需要，可以在这里添加其他默认值
    ...options,
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += '; ' + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += '=' + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

// 使用范例：
// setCookie('user', 'John', {secure: true, 'max-age': 3600});
function deleteCookie(name) {
  setCookie(name, '', {
    'max-age': -1,
  });
  // document.cookie = encodeURIComponent(name) + '=;max-age=-1'
}
