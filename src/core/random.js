/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { addrandomop } from './randomeval';

const SpotValue = {
  D4: 'D4',
  D6: 'D6',
  D8: 'D8',
  D10: 'D10',
  D12: 'D12',
  D20: 'D20',
};

// generate functions for predefined dice values D4 - D20
const predefined = Object.keys(SpotValue).reduce((map, obj) => {
  map[obj] = (G, fieldname) => {
    return addrandomop(G, fieldname, obj);
  };
  return map;
}, {});

export const Random = {
  ...predefined,
  Die: (G, fieldname, spotvalue) => {
    return addrandomop(G, fieldname, `D${spotvalue}`);
  },
  Number: (G, fieldname) => {
    return addrandomop(G, fieldname, 'R');
  },
};
