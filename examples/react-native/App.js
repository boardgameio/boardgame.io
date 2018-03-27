/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReactNativeClient } from 'boardgame.io/react-native';

import TicTacToe from './game';
import Board from './board';

const App = ReactNativeClient({
  game: TicTacToe,
  board: Board,
});

const Singleplayer = () => (
  <View style={styles.container}>
    <Text>Singleplayer</Text>
    <App gameID="single" />
  </View>
);

export default Singleplayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
