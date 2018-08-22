// evaluation of DEV needs to be done inside the functions
// otherwise console.log cannot be changed to a spy function anymore.

export function info(msg) {
  const DEV =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  const logfn = DEV ? console.log : () => {};
  logfn(`INFO: ${msg}`);
}

export function error(msg) {
  const DEV =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  const logfn = DEV ? console.log : () => {};
  logfn(`ERROR: ${msg}`);
}
