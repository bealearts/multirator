export default class Multirator {
  constructor(iterator) {
    // console.log(iterator.each);
    // if (iterator instanceof Multirator) {
    //   console.log('Multirator');
    //   return;
    // }


    let done = false;
    let value;
    let resolver;
    let rejector;

    let pending = new Promise((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

    (async () => {
      while (!done) {
        try {
          const result = await iterator.next();
          done = result.done;
          value = result.value;
          resolver(result);
        } catch (error) {
          rejector(error);
        } finally {
          pending = new Promise((resolve, reject) => {
            resolver = resolve;
            rejector = reject;
          });
        }
      }
    })();

    this[Symbol.asyncIterator] = async function* () {
      if (!done && value !== undefined) yield value;
      while(!done) {
        await pending;  // TODO: Error handling
        if (!done) yield value;
      }
    }
  }

  filter(func) {
    return new Multirator(filter(this, func));
  }

  map(func) {
    return new Multirator(map(this, func));
  }

  reduce(func, initialValue) {
    return new Multirator(reduce(this, func, initialValue));
  }

  each(func) {
    return new Multirator(each(this, func));
  }
}

async function* filter(iterator, func) {
  for await (const value of iterator) {
    if (func(value)) yield value;
  }
}

async function* map(iterator, func) {
  for await (const value of iterator) {
    yield func(value);
  }
}

async function* reduce(iterator, func, initialValue) {
  let acc = initialValue;
  for await (const value of iterator) {
    acc = func(acc, value);
    yield acc;
  }
}

async function* each(iterator, func) {
  for await (const value of iterator) {
    func(value);
    yield value;
  }
}
