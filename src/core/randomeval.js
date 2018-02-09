import seedrandom from 'seedrandom';

// /**
//  * shuffle
//  *
//  * Shuffles a given array.
//  * The seed and current state is kept inside the ctx object.
//  *
//  * Please note this is an in-place shuffle. It will modify the given array.
//  * If you want to retain the original order, clone the array before.
//  *
//  * This code is taken directly from Mike Bostock, with a few slight modifications
//  * https://bost.ocks.org/mike/shuffle/
//  *
//  * @param {...object} ctx - The context object keeping the seed and current state.
//  * @param {any[]} array - The array to sort. Will be modified in-place.
//  */
// function shuffle(ctx, array) {
//   let m = array.length,
//     t,
//     i;
//   let ctx2 = ctx;

//   // While there remain elements to shuffle…
//   while (m) {
//     let { ctx: ctx3, randomnumber } = random2(ctx2);
//     ctx2 = ctx3;

//     // Pick a remaining element…
//     i = Math.floor(randomnumber * m--);

//     // And swap it with the current element.
//     t = array[m];
//     array[m] = array[i];
//     array[i] = t;
//   }

//   return { ctx: ctx2, array };
// }

function getrandomfn(ctx) {
  let randomfn;
  if (ctx.prngstate === undefined) {
    // no call to a random function has been made.
    // pre-populate the state info
    // TODO what if ctx.seed is not defined?
    randomfn = new seedrandom.alea(ctx.seed, { state: true });
  } else {
    randomfn = new seedrandom.alea('', { state: ctx.prngstate });
  }
  return randomfn;
}

function randomctx(ctx) {
  const r = getrandomfn(ctx);
  const randomnumber = r();
  const ctx2 = { ...ctx, prngstate: r.state() };
  return { randomnumber, ctx: ctx2 };
}

function addrandomop(G, fieldname, op) {
  let rop = [{ op, fieldname }];
  let _randomOps = [...(G._randomOps || []), ...rop];
  return { ...G, _randomOps };
}

function evaluaterandomops(G, ctx) {
  let randomresults = {};
  let ctx2 = ctx;

  if (G._randomOps !== undefined) {
    G._randomOps.forEach(r => {
      switch (r.op) {
        case 'D6': {
          const { ctx: ctx3, randomnumber } = randomctx(ctx2);
          ctx2 = ctx3;
          const d6 = Math.floor(randomnumber * 6) + 1;
          randomresults[r.fieldname] = d6;
          break;
        }
        case 'R': {
          const { ctx: ctx3, randomnumber } = randomctx(ctx2);
          ctx2 = ctx3;
          randomresults[r.fieldname] = randomnumber;
          break;
        }
        default:
          // TODO ignore? log?
          break;
      }
    });
  }

  return { randomresults, ctx: ctx2 };
}

function runrandom(G, ctx) {
  let { randomresults, ctx: ctx2 } = evaluaterandomops(G, ctx);
  const G2 = { ...G, ...randomresults, _randomOps: undefined };
  return { G: G2, ctx: ctx2 };
}

module.exports = { runrandom, evaluaterandomops, addrandomop, randomctx };
