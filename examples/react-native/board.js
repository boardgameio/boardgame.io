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
    const tbody = [];
    const marker = {
      '0': 'X',
      '1': 'O',
    };
    for (let i = 0; i < 3; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(
          <TouchableHighlight
            key={id}
            onPress={() => this.onClick(id)}
            style={[styles.cell, styles[`cell${id}`]]}
            underlayColor="transparent"
          >
            <Text style={styles.value}>{marker[this.props.G.cells[id]]}</Text>
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
      disconnected = (
        <Text id="disconnected" style={styles.infoText}>
          Disconnected!
        </Text>
      );
    }

    let winner = null;
    if (this.props.ctx.gameover !== undefined) {
      winner = (
        <Text id="winner" style={styles.infoText}>
          Winner: {marker[this.props.ctx.gameover]}
        </Text>
      );
    }

    let player = null;
    if (this.props.playerID !== null) {
      player = (
        <Text id="player" style={styles.infoText}>
          Player: {this.props.playerID}
        </Text>
      );
    }

    return (
      <View>
        <View id="board">{tbody}</View>
        <View style={styles.info}>
          {player}
          {winner}
          {disconnected}
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
    height: 96,
    borderWidth: 4,
    borderColor: '#666',
    borderStyle: 'solid',
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: '#373748',
  },
  cell0: {
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  },
  cell1: {
    borderTopColor: 'transparent',
  },
  cell2: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  cell3: {
    borderLeftColor: 'transparent',
  },
  cell5: {
    borderRightColor: 'transparent',
  },
  cell6: {
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  cell7: {
    borderBottomColor: 'transparent',
  },
  cell8: {
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderStyle: 'solid',
  },
  info: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    marginTop: 24,
  },
  infoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#373748',
  },
});

export default Board;
