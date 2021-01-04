/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export function AssignShortcuts(moveNames, blacklist) {
  let shortcuts = {};

  const taken = {};
  for (const c of blacklist) {
    taken[c] = true;
  }

  // Try assigning the first char of each move as the shortcut.
  let t = taken;
  let canUseFirstChar = true;
  for (const name in moveNames) {
    const shortcut = name[0];
    if (t[shortcut]) {
      canUseFirstChar = false;
      break;
    }

    t[shortcut] = true;
    shortcuts[name] = shortcut;
  }
  if (canUseFirstChar) {
    return shortcuts;
  }

  // If those aren't unique, use a-z.
  t = taken;
  let next = 97;
  shortcuts = {};
  for (const name in moveNames) {
    let shortcut = String.fromCharCode(next);

    while (t[shortcut]) {
      next++;
      shortcut = String.fromCharCode(next);
    }

    t[shortcut] = true;
    shortcuts[name] = shortcut;
  }
  return shortcuts;
}
