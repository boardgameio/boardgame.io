/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

// the following code is the inlined alea PRNG from the seedrandom library
function Alea(seed) {
  var me = this,
    mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return (me.s2 = t - (me.c = t | 0));
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) {
    me.s0 += 1;
  }
  me.s1 -= mash(seed);
  if (me.s1 < 0) {
    me.s1 += 1;
  }
  me.s2 -= mash(seed);
  if (me.s2 < 0) {
    me.s2 += 1;
  }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}

// this is the function that uses Alea to create a variety of methods.
// the commented-out code was not used and lowered code coverage.
function impl(seed, opts) {
  var xg = new Alea(seed),
    state = opts && opts.state,
    prng = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof state == 'object') copy(state, xg);
    prng.state = function() {
      return copy(xg, {});
    };
  }
  return prng;
}
// ALEA END

export const DICE = 'DICE';
export const NUMBER = 'NUMBER';

function getrandomfn(ctx) {
  let randomfn;
  if (ctx.random === undefined || ctx.random.prngstate === undefined) {
    // no call to a random function has been made.
    // pre-populate the state info
    randomfn = new impl(ctx.random.seed, { state: true });
  } else {
    randomfn = new impl('', { state: ctx.random.prngstate });
  }
  return randomfn;
}

export function randomctx(ctx) {
  const r = getrandomfn(ctx);
  return {
    randomnumber: r(),
    ctx: {
      ...ctx,
      random: {
        ...ctx.random,
        prngstate: r.state(),
      },
    },
  };
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

export function RunRandom(G, ctx) {
  let { randomresults, ctx: ctx2 } = evaluaterandomops(G, ctx);
  const G2 = { ...G, ...randomresults, _randomOps: undefined };
  return { G: G2, ctx: ctx2 };
}

const SpotValue = {
  D4: 4,
  D6: 6,
  D8: 8,
  D10: 10,
  D12: 12,
  D20: 20,
};

// generate functions for predefined dice values D4 - D20
const predefined = {};
for (const key in SpotValue) {
  const value = SpotValue[key];
  predefined[key] = (G, fieldname) => {
    return addrandomop(G, fieldname, DICE, value);
  };
}

export function GenSeed() {
  return (+new Date()).toString(36).slice(-10);
}

// Public API that's imported like:
// import { Random } from 'boardgame.io/core';
export const Random = {
  ...predefined,

  Die: (G, fieldname, spotvalue) => {
    return addrandomop(G, fieldname, DICE, spotvalue);
  },

  Number: (G, fieldname) => {
    return addrandomop(G, fieldname, NUMBER);
  },
};
