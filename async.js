function delay(time) {
  console.log('start delay', time);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('end delay', time);
      resolve(time);
    }, time);
  });
}

async function logInOrder(times) {
  const textPromises = times.map(async time => {
    const response = await delay(time);
    return response;
  });

  // 按次序输出
  // for await (const textPromise of textPromises) {
  //   // 异步generator
  //   console.log(textPromise);
  // }
}
logInOrder([800, 200, 500, 1000]);

function logInOrder(times) {
  const ge = function* generator() {
    yield Promise.all(
      times.map(time => {
        delay(time);
      }),
    );
  };

  return run(ge);
}

function run(gen) {
  const generator = gen();
  const next = data => {
    const result = generator.next(data);

    if (!result.done) {
      result.value.then(data => {
        next(data);
      });
    } else {
      return result.value;
    }
  };
  next();
}
