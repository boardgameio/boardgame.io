import seedrandom from 'seedrandom';

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

  // some flow tests run without a defined G
  if (G && G._randomOps !== undefined) {
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
