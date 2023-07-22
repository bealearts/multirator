export default class Iterator {
  constructor(iterator) {
    this[Symbol.asyncIterator] = async function* () {
      for await (const value of iterator) {
        yield value;
      }
    };
  }

  /* Chainable */

  filter(func) {
    return new Iterator(filter(this, func));
  }

  map(func) {
    return new Iterator(map(this, func));
  }

  concat(...iterators) {}

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
