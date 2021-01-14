function countdown(ms) {
  const now = new Date().getTime();
  const interval = 1000;
  let n = 1;
  console.log(ms / 1000);
  let timer = setTimeout(function count() {
    const last = ms - (new Date().getTime() - now); // 剩余ms,防止进入后台，定时器暂停
    console.log(last / 1000);
    if (last <= 0) return cancelCountdown();
    const offset = new Date().getTime() - (now + n * 1000); // 下一次执行定时器的时间，解决定时器执行间隔大于1s
    if (offset < 0) {
      offset = 0;
    }
    n++;
    let nextTime = 1000 - offset;
    if (nextTime < 0) {
      nextTime = 0;
    }
    timer = setTimeout(count, nextTime);
  }, interval);

  function cancelCountdown() {
    clearTimeout(timer);
  }
  return cancelCountdown;
}

function countdown(ms) {
  const now = new Date().getTime();
  let requestID;
  function count() {
    const last = ms - (new Date().getTime() - now); // 剩余ms,防止进入后台，定时器暂停
    if (last <= 0) return cancel();
    console.log(last / 1000);
    requestID = requestAnimationFrame(count);
  }
  count();
  const cancel = () => cancelAnimationFrame(requestID);
  return cancel;
}
