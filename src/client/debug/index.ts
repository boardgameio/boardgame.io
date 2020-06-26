import { _ClientImpl } from '../client';

declare class Debug {
  constructor(opts: { target: HTMLElement; props: { client: _ClientImpl } });
  $destroy: () => void;
}

export default Debug;
