/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { addrandomop, DICE, NUMBER } from './randomeval';

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

export const Random = {
  ...predefined,
  Die: (G, fieldname, spotvalue) => {
    return addrandomop(G, fieldname, DICE, spotvalue);
  },
  Number: (G, fieldname) => {
    return addrandomop(G, fieldname, NUMBER);
  },
};
