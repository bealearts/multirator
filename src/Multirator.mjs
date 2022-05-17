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
        await pending;
        if (!done) yield value;
      }
    }
  }

  filter(func) {
    return new Multirator(filter(this, func));
  }

  each(func) {
    return new Multirator(each(this, func));
  }
}

async function* filter(iterator, func) {
  for await (const value of iterator) {
    console.log('filter', value);
    if (func(value)) yield value;
  }
}

async function* each(iterator, func) {
  for await (const value of iterator) {
    yield func(value);
  }
}
