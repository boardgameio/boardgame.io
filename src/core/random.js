import { addrandomop } from './randomeval';

/**
 * rolldie
 *
 * Add a request to Roll a D6 die.
 *
 * The result is put into the given fieldname and is available
 * on the next move.
 *
 * @param {...object} G - Game instance.
 * @param {*} fieldname - Fieldname to put the random result into.
 */
function rolldie(G, fieldname) {
  return addrandomop(G, fieldname, 'D6');
}

/**
 * random
 *
 * Add a request to generate a random number between 0 and 1.
 *
 * The result is put into the given fieldname and is available
 * on the next move.
 *
 * @param {...object} G - Game instance.
 * @param {*} fieldname - Fieldname to put the random result into.
 */
function random(G, fieldname) {
  return addrandomop(G, fieldname, 'R');
}

export { random, rolldie };
