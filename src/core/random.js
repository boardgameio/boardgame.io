import { addrandomop } from './randomeval';

/**
 * rolldie
 *
 * Roll a D6 die and put the result into the given fieldname.
 *
 * @param {...object} G - Game instance.
 * @param {*} fieldname - Gieldname to put the random result into.
 */
function rolldie(G, fieldname) {
  return addrandomop(G, fieldname, 'D6');
}

/**
 * random
 *
 * Generates a random number.
 * The seed and current state is kept inside the ctx object.
 *
 * @param {...object} ctx - The context object keeping the seed and current state.
 */
function random(G, fieldname) {
  return addrandomop(G, fieldname, 'R');
}

export { random, rolldie };
