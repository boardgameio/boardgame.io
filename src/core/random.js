import seedrandom from 'seedrandom';

/**
 * random
 *
 * Generates a random number.
 * The seed and current state is kept inside the ctx object.
 *
 * @param {...object} ctx - The context object keeping the seed and current state.
 */
function random(ctx) {
  if (ctx._randomFn === undefined) {
    ctx._randomFn = new seedrandom.alea(ctx.seed);
  }

  return ctx._randomFn();
}

/**
 * shuffle
 *
 * Shuffles a given array.
 * The seed and current state is kept inside the ctx object.
 *
 * Please note this is an in-place shuffle. It will modify the given array.
 * If you want to retain the original order, clone the array before.
 *
 * This code is taken directly from Mike Bostock, with a few slight modifications
 * https://bost.ocks.org/mike/shuffle/
 *
 * @param {...object} ctx - The context object keeping the seed and current state.
 * @param {any[]} array - The array to sort.
 */
function shuffle(ctx, array) {
  if (ctx._randomFn === undefined) {
    ctx._randomFn = new seedrandom.alea(ctx.seed);
  }
  const randomFn = ctx._randomFn;

  let m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(randomFn() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

export { random, shuffle };
