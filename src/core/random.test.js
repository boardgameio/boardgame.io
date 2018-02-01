import { random, shuffle } from './random';

describe('randomness', () => {
  it('random', () => {
    let ctx = { seed: 'hi there' };

    // make sure that on subsequent calls different numbers are generated.
    expect(random(ctx)).toBe(0.573445922927931);
    expect(random(ctx)).toBe(0.4695413049776107);
    expect(random(ctx)).toBe(0.5943194630090147);
  });

  it('shuffle', () => {
    let ctx = { seed: 'hi there' };
    let numbers = new Array(10).fill().map((_, idx) => idx);

    shuffle(ctx, numbers);

    expect(numbers).toMatchObject([1, 0, 7, 2, 3, 9, 6, 8, 4, 5]);
  });
});
