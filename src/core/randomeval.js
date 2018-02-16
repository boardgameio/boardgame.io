/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import seedrandom from 'seedrandom';

export const DICE = 'DICE';
export const NUMBER = 'NUMBER';

function getrandomfn(ctx) {
  let randomfn;
  if (ctx.prngstate === undefined) {
    // no call to a random function has been made.
    // pre-populate the state info
    randomfn = new seedrandom.alea(ctx.seed, { state: true });
  } else {
    randomfn = new seedrandom.alea('', { state: ctx.prngstate });
  }
  return randomfn;
}

export function randomctx(ctx) {
  const r = getrandomfn(ctx);
  const randomnumber = r();
  const ctx2 = { ...ctx, prngstate: r.state() };
  return { randomnumber, ctx: ctx2 };
}

export function addrandomop(G, fieldname, op, ...args) {
  let rop = [{ op, fieldname, args }];
  let _randomOps = [...(G._randomOps || []), ...rop];
  return { ...G, _randomOps };
}

export function evaluaterandomops(G, ctx) {
  let randomresults = {};
  let ctx2 = ctx;

  // some flow tests run without a defined G
  if (G && G._randomOps !== undefined) {
    G._randomOps.forEach(r => {
      const { ctx: ctx3, randomnumber } = randomctx(ctx2);
      ctx2 = ctx3;

      switch (r.op) {
        case DICE: {
          const spotvalue = r.args[0];
          const dievalue = Math.floor(randomnumber * spotvalue) + 1;
          randomresults[r.fieldname] = dievalue;
          break;
        }

        case NUMBER: {
          randomresults[r.fieldname] = randomnumber;
          break;
        }

        default:
          break;
      }
    });
  }

  return { randomresults, ctx: ctx2 };
}

export function runrandom(G, ctx) {
  let { randomresults, ctx: ctx2 } = evaluaterandomops(G, ctx);
  const G2 = { ...G, ...randomresults, _randomOps: undefined };
  return { G: G2, ctx: ctx2 };
}
