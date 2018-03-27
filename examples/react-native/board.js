/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import PropTypes from 'prop-types';

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
    isConnected: PropTypes.bool,
  };

  onClick = id => {
    if (this.isActive(id)) {
      this.props.moves.clickCell(id);
    }
  };

  isActive(id) {
    if (!this.props.isActive) return false;
    if (this.props.G.cells[id] !== null) return false;
    return true;
  }

  render() {
    let tbody = [];
    for (let i = 0; i < 3; i++) {
      let cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(
          <TouchableHighlight
            key={id}
            onPress={() => this.onClick(id)}
            style={styles.cell}
          >
            <Text>{this.props.G.cells[id]}</Text>
          </TouchableHighlight>
        );
      }
      tbody.push(
        <View key={i} style={styles.row}>
          {cells}
        </View>
      );
    }

    let disconnected = null;
    if (this.props.isMultiplayer && !this.props.isConnected) {
      disconnected = <Text id="disconnected">Disconnected!</Text>;
    }

    let winner = null;
    if (this.props.ctx.gameover !== undefined) {
      winner = <Text id="winner">Winner: {this.props.ctx.gameover}</Text>;
    }

    let player = null;
    if (this.props.playerID !== null) {
      player = <Text id="player">Player: {this.props.playerID}</Text>;
    }

    return (
      <View>
        <View id="board">{tbody}</View>
        {player}
        {winner}
        {disconnected}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default Board;
