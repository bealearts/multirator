import Iterator from "./Iterator";
export default class Multirator extends Iterator {
  constructor(iterator) {
    super(iterator);

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
      while (!done) {
        await pending; // TODO: Error handling
        if (!done) yield value;
      }
    };
  }
}
