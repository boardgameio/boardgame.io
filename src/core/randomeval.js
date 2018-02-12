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

export function randomctx(ctx) {
  const r = getrandomfn(ctx);
  const randomnumber = r();
  const ctx2 = { ...ctx, prngstate: r.state() };
  return { randomnumber, ctx: ctx2 };
}

export function addrandomop(G, fieldname, op) {
  let rop = [{ op, fieldname }];
  let _randomOps = [...(G._randomOps || []), ...rop];
  return { ...G, _randomOps };
}

export function evaluaterandomops(G, ctx) {
  let randomresults = {};
  let ctx2 = ctx;

  let spotre = /^D(\d+)$/;

  // some flow tests run without a defined G
  if (G && G._randomOps !== undefined) {
    G._randomOps.forEach(r => {
      const { ctx: ctx3, randomnumber } = randomctx(ctx2);
      ctx2 = ctx3;
      switch (r.op.charAt(0)) {
        case 'D': {
          var match = spotre.exec(r.op);
          // match[0] contains the whole matched string.
          const dievalue = Math.floor(randomnumber * match[1]) + 1;
          randomresults[r.fieldname] = dievalue;
          break;
        }
        case 'R': {
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
