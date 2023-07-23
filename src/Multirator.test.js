import { test, expect } from 'vitest';

import Multirator from './Multirator.js';

async function* numberGenerator(max = 100) {
  let num = 0;
  while (num < max) {
    yield new Promise((resolve) => {
      num++;
      setTimeout(() => resolve(num), 0);
    });
  }
}

test('Supports multiple consumers with: for await', async () => {
  const numbers = new Multirator(numberGenerator(10));

  const [result1, result2] = await Promise.all([
    (async () => {
      let count = 0;
      for await (const value of numbers) {
        count += value;
      }
      return count;
    })(),
    (async () => {
      let count = 0;
      for await (const value of numbers) {
        count += value;
      }
      return count;
    })()
  ]);

  expect(result1).toEqual(55);
  expect(result2).toEqual(55);
});

test('Supports multiple consumers with: forEach()', async () => {
  const numbers = new Multirator(numberGenerator(10));

  const [result1, result2] = await Promise.all([
    (async () => {
      let count = 0;
      await numbers.forEach((value) => {
        count += value;
      });

      return count;
    })(),
    (async () => {
      let count = 0;
      await numbers.forEach((value) => {
        count += value;
      });
      return count;
    })()
  ]);

  expect(result1).toEqual(55);
  expect(result2).toEqual(55);
});

test('Supports multiple consumers with: filter()', async () => {
  const numbers = new Multirator(numberGenerator(10));

  const [result1, result2] = await Promise.all([
    (async () => {
      let count = 0;
      await numbers
        .filter((value) => value % 2 !== 0)
        .forEach((value) => {
          count += value;
        });

      return count;
    })(),
    (async () => {
      let count = 0;
      await numbers
        .filter((value) => value % 2 === 0)
        .forEach((value) => {
          count += value;
        });
      return count;
    })()
  ]);

  expect(result1).toEqual(25);
  expect(result2).toEqual(30);
});

test('Supports multiple consumers with: map()', async () => {
  const numbers = new Multirator(numberGenerator(10));

  const [result1, result2] = await Promise.all([
    (async () => {
      let count = 0;
      await numbers
        .filter((value) => value % 2 !== 0)
        .forEach((value) => {
          count += value;
        });

      return count;
    })(),
    (async () => {
      let count = 0;
      await numbers
        .filter((value) => value % 2 === 0)
        .forEach((value) => {
          count += value;
        });
      return count;
    })()
  ]);

  expect(result1).toEqual(25);
  expect(result2).toEqual(30);
});

test('Supports multiple consumers with: map()', async () => {
  const numbers = new Multirator(numberGenerator(10));

  const [result1, result2] = await Promise.all([
    (async () => {
      let count = 0;
      await numbers
        .map((value) => value * 2)
        .forEach((value) => {
          count += value;
        });

      return count;
    })(),
    (async () => {
      let count = 0;
      await numbers
        .map((value) => value * 3)
        .forEach((value) => {
          count += value;
        });

      return count;
    })()
  ]);

  expect(result1).toEqual(110);
  expect(result2).toEqual(165);
});

test('Supports multiple consumers with: reduce()', async () => {
  const numbers = new Multirator(numberGenerator(10));

  const [result1, result2] = await Promise.all([
    (async () => numbers.reduce((count, value) => count + value, 0))(),
    (async () => numbers.reduce((count, value) => count + value))()
  ]);

  expect(result1).toEqual(55);
  expect(result2).toEqual(55);
});

test('Supports concatenating iterators', async () => {
  const numbers = new Multirator(numberGenerator(10));

  async function* letterGenerator(max = 100) {
    let num = 0;
    while (num < max) {
      yield new Promise((resolve) => {
        num++;
        setTimeout(() => resolve(String.fromCharCode(64 + num)), 0);
      });
    }
  }

  const result = await numbers
    .concat(letterGenerator(10))
    .reduce((str, value) => str + value, '');

  expect(result).toEqual('12345678910ABCDEFGHIJ');
});

test('Throws async errors', async () => {
  async function* withErrorGenerator(max = 100) {
    let num = 0;
    while (num < max) {
      yield new Promise((resolve, reject) => {
        num++;
        if (num === 5) {
          setTimeout(() => reject(new Error('Something Bad')), 0);
        } else {
          setTimeout(() => resolve(num), 0);
        }
      });
    }
  }

  const withError = new Multirator(withErrorGenerator(10));

  let lastValue;
  let lastError;
  try {
    for await (const value of withError) {
      lastValue = value;
    }
  } catch (error) {
    lastError = error;
  }

  expect(lastValue).toEqual(4);
  expect(lastError).toEqual(new Error('Something Bad'));
});

test('Supports consumers joining after iterator has started', async () => {
  const numbers = new Multirator(numberGenerator(10));

  const [result1, result2] = await Promise.all([
    (async () => {
      let count = 0;
      for await (const value of numbers) {
        count += value;
      }
      return count;
    })(),
    new Promise((resolve) => {
      setTimeout(async () => {
        let count = 0;
        for await (const value of numbers) {
          count += value;
        }
        return resolve(count);
      }, 10);
    })
  ]);

  expect(result1).toEqual(55);
  expect(result2).toBeGreaterThan(10);
  expect(result2).toBeLessThan(55);
});
