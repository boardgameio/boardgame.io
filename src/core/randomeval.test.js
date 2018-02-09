import { randomctx, runrandom, addrandomop } from './randomeval';
import { random, rolldie } from './random';

test('randomctx', () => {
  let ctx = { seed: 'hi there' };

  // make sure that on subsequent calls different numbers are generated.
  let { ctx: ctx2, randomnumber } = randomctx(ctx);
  expect(randomnumber).toBe(0.573445922927931);
  let { ctx: ctx3, randomnumber: randomnumber2 } = randomctx(ctx2);
  expect(randomnumber2).toBe(0.4695413049776107);
  let { ctx: ctx4, randomnumber: randomnumber3 } = randomctx(ctx3);
  expect(randomnumber3).toBe(0.5943194630090147);
  expect(ctx4).not.toMatchObject(ctx3);
});

test('runrandom nothing to do', () => {
  let ctx = { seed: 0 };
  let G = {};

  let { G: G2, ctx: ctx2 } = runrandom(G, ctx);

  expect(G2).toMatchObject(G);
  expect(ctx2).toMatchObject(ctx);
});

test('runrandom invalid op', () => {
  let ctx = { seed: 0 };
  let G = {};

  // currently, the framework silently ignores the request.
  const G2 = addrandomop(G, 'field1', 'XYZ');
  let { G: G3, ctx: ctx2 } = runrandom(G2, ctx);

  expect(G3).toMatchObject(G);
  expect(ctx2).toMatchObject(ctx);
});

test('rolldie', () => {
  let G = {};
  const G2 = rolldie(G, 'field1');
  let expectedOps = [{ op: 'D6', fieldname: 'field1' }];
  expect(G2._randomOps).toMatchObject(expectedOps);

  const G3 = rolldie(G2, 'field2');
  expectedOps = [...expectedOps, { op: 'D6', fieldname: 'field2' }];
  expect(G3._randomOps).toMatchObject(expectedOps);

  const G4 = rolldie(G3, 'field1');
  expectedOps = [...expectedOps, { op: 'D6', fieldname: 'field1' }];
  expect(G4._randomOps).toMatchObject(expectedOps);
});

test('runrandom D6', () => {
  let ctx = { seed: 0 };
  let G = {};

  // random event - D6
  const G2 = rolldie(G, 'field1');

  let { G: G3, ctx: ctx2 } = runrandom(G2, ctx);
  expect(ctx).not.toMatchObject(ctx2);
  expect(G3.field1).toBeDefined();
  expect(G3.field1).toBeGreaterThanOrEqual(1);
  expect(G3.field1).toBeLessThanOrEqual(6);
  expect(G3._randomOps).toBeUndefined();
});

test('runrandom R', () => {
  let ctx = { seed: 0 };
  let G = {};

  // random event - random number
  const G2 = random(G, 'field1');

  let { G: G3, ctx: ctx2 } = runrandom(G2, ctx);
  expect(ctx).not.toMatchObject(ctx2);
  expect(G3.field1).toBeDefined();
  expect(G3.field1).toBeGreaterThanOrEqual(0);
  expect(G3.field1).toBeLessThanOrEqual(1);
  expect(G3._randomOps).toBeUndefined();
});
