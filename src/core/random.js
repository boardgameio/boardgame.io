import { addrandomop } from './randomeval';

export const RequestRandom = {
  D6: (G, fieldname) => {
    return addrandomop(G, fieldname, 'D6');
  },
  Number: (G, fieldname) => {
    return addrandomop(G, fieldname, 'R');
  },
};
