import { random, shuffle, rolldie, runrandom } from './random';

test('random', () => {
  let ctx = { seed: 'hi there' };

  // make sure that on subsequent calls different numbers are generated.
  let { ctx: ctx2, randomnumber } = random(ctx);
  expect(randomnumber).toBe(0.573445922927931);
  let { ctx: ctx3, randomnumber: randomnumber2 } = random(ctx2);
  expect(randomnumber2).toBe(0.4695413049776107);
  let { ctx: ctx4, randomnumber: randomnumber3 } = random(ctx3);
  expect(randomnumber3).toBe(0.5943194630090147);
  expect(ctx4).not.toMatchObject(ctx3);
});

test('shuffle', () => {
  let ctx = { seed: 'hi there' };
  let numbers = new Array(10).fill().map((_, idx) => idx);

  let { ctx: ctx2 } = shuffle(ctx, numbers);
  expect(numbers).toMatchObject([1, 0, 7, 2, 3, 9, 6, 8, 4, 5]);

  shuffle(ctx2, numbers);
  expect(numbers).toMatchObject([1, 6, 8, 3, 7, 5, 9, 0, 2, 4]);
});

test('rolldie', () => {
  let G = {};
  // TODO how to behave when field1 is already defined on G?
  const G2 = rolldie(G, 'field1');
  let expectedOps = [{ op: 'D6', fieldname: 'field1' }];
  expect(G2._randomOps).toMatchObject(expectedOps);

  const G3 = rolldie(G2, 'field2');
  expectedOps = [...expectedOps, { op: 'D6', fieldname: 'field2' }];
  expect(G3._randomOps).toMatchObject(expectedOps);

  // TODO how to behave when the field already has been used?
  const G4 = rolldie(G3, 'field1');
  expectedOps = [...expectedOps, { op: 'D6', fieldname: 'field1' }];
  expect(G4._randomOps).toMatchObject(expectedOps);
});

test('runrandom', () => {
  let ctx = { seed: 0 };
  let G = {};

  // nothing to do
  let { G: G2, ctx: ctx2 } = runrandom(G, ctx);
  expect(G2).toMatchObject(G);
  expect(ctx2).toMatchObject(ctx);

  // one random event
  G2 = rolldie(G, 'field1');
  let { G: G3, ctx: ctx3 } = runrandom(G2, ctx);
  expect(ctx).not.toMatchObject(ctx3);
  expect(G3.field1).toBeDefined();
  expect(G3.field1).toBeGreaterThanOrEqual(1);
  expect(G3.field1).toBeLessThanOrEqual(6);
  expect(G3._randomOps).toBeUndefined();
});
