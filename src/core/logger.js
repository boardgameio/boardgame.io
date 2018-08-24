const DEV =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
const logfn = DEV ? console.log : () => {};

export function info(msg) {
  logfn(`INFO: ${msg}`);
}
export function error(msg) {
  logfn(`ERROR: ${msg}`);
}
