# multirator [![Build, Test and Publish](https://github.com/bealearts/multirator/actions/workflows/build.yml/badge.svg)](https://github.com/bealearts/multirator/actions/workflows/build.yml) [![npm version](https://badge.fury.io/js/multirator.svg)](http://badge.fury.io/js/multirator)

Async Iterator which supports multiple consumers

> Includes Array like functions for working with iterators (.filter(), .map(), .reduce(), .forEach() etc)

## Install

```shell
npm i multirator
```

## Usage

```js
import Multirator from 'multirator';

const numbers = new Multirator(someIterable); // 'someIterable' could be an async iterator, async generator or a stream

(async () => {
  for await (number of numbers) {
    console.log('Consumer 1', number);
  }
})();

(async () => {
  await numbers
    .filter((number) => number % 2 !== 0)
    .forEach((oddNumber) => console.log('Consumer 2', oddNumber));
})();

(async () => {
  const total = await numbers.reduce((sum, number) => sum + number, 0);
  console.log('Consumer 3', total);
})();
```
