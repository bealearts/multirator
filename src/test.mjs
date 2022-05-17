import Multirator from './Multirator.mjs';

async function* numberGenerator(max = 100) {
  let num = 0;
  while(num < max) {
    yield new Promise(resolve => {
      num++;
      setTimeout(() => resolve(num), 1000);
    });
  }
}

const numbers = new Multirator(numberGenerator(10));

// const evenNumbers = numbers
//   .filter(value => value % 2 === 0)
//   .each(value => console.log('Even', value));

const oddNumbers = numbers
  .filter(value => value % 2 !== 0)
  .each(value => console.log('Odd', value));

const oddNumbersAbove5 = oddNumbers
  .filter(value => value > 5)
  .each(value => console.log('Odd above 5', value));


//
// for await (const value of numberGenerator(10)) {
//   console.log(value);
// }
