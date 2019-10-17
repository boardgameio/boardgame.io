/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export function AssignShortcuts(moveNames, eventNames, blacklist) {
  let shortcuts = {};

  const events = {};
  for (let name in moveNames) {
    events[name] = name;
  }
  for (let name in eventNames) {
    events[name] = name;
  }

  let taken = {};
  for (let i = 0; i < blacklist.length; i++) {
    const c = blacklist[i];
    taken[c] = true;
  }

  // Try assigning the first char of each move as the shortcut.
  let t = taken;
  let canUseFirstChar = true;
  for (let name in events) {
    let shortcut = name[0];
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
  for (let name in events) {
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
