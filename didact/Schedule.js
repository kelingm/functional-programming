const macroTask = [];
let deadline = 0;
const threshold = 1000 / 60;
const callbacks = [];

export const schedule = cb => callbacks.push(cb) === 1 && postMessage();

export const scheduleWork = callback => {
  const currentTime = getTime();
  const newTask = {
    callback,
    time: currentTime + 3000,
  };
  macroTask.push(newTask);
  schedule(flushWork);
};

const postMessage = () => {
  const cb = () => callbacks.splice(0, callbacks.length).forEach(c => c());
  const { port1, port2 } = new MessageChannel();
  port1.onmessage = cb;
  port2.postMessage(null);
};

const flush = initTime => {
  let currentTime = initTime;
  let currentTask = peek(macroTask);

  while (currentTask) {
    const timeout = currentTask.time <= currentTime;
    if (!timeout && shouldYield()) break;

    const callback = currentTask.callback;
    currentTask.callback = null;

    const next = callback(timeout);
    next ? (currentTask.callback = next) : macroTask.shift();

    currentTask = peek(macroTask);
    currentTime = getTime();
  }
  return !!currentTask;
};

const peek = queue => {
  queue.sort((a, b) => a.time - b.time);
  return queue[0];
};

const flushWork = () => {
  const currentTime = getTime();
  deadline = currentTime + threshold;
  flush(currentTime) && schedule(flushWork);
};

export const shouldYield = () => {
  return getTime() >= deadline;
};

const getTime = () => performance.now();
