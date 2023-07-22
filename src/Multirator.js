export default class Multirator {
  constructor(iterator) {
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

  /* Chainable */

  filter(func) {
    return new Multirator(filter(this, func));
  }

  map(func) {
    return new Multirator(map(this, func));
  }

  reduce(func, initialValue) {
    return new Multirator(reduce(this, func, initialValue));
  }


  /* Leaf */

  async forEach(func) {
    for await (const value of this) {
      func(value);
    }
  }

  async reduce(func, initValue) {
    let acc = initValue;
    for await (const value of this) {
      if (acc === undefined) {
        acc = value;
      } else {
        acc = func(acc, value);
      }
    }
    return acc;
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