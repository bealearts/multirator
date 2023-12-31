export default class Iterator {
  constructor(iterator) {
    this[Symbol.asyncIterator] = async function* iter() {
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

  concat(iterator) {
    return new Iterator(concat(this, iterator));
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

async function* concat(iterator1, iterator2) {
  for await (const value of iterator1) {
    yield value;
  }

  for await (const value of iterator2) {
    yield value;
  }
}
