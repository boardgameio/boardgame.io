/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Sequelize = require('sequelize');
const JSON = require('serialize-json');

const DEFAULT_PARAMS = {
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
};

/**
 * SQL data storage.
 */
export class SQL {
  /**
   * Creates a new SQL storage.
   */
  constructor(params) {
    this.params = params || DEFAULT_PARAMS;
  }

  /**
   * Connect.
   */
  async connect() {
    this.db = new Sequelize({ ...this.params, operatorsAliases: Sequelize.Op });
    this.games = this.db.define('games', {
      gameState: {
        type: Sequelize.STRING,
      },
      gameID: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
    });
    await this.db.sync();
    return;
  }

  /**
   * Write the game state to the SQL object.
   * @param {string} id - The game id.
   * @param {object} store - A game state to persist.
   */
  async set(id, state) {
    const JSONstate = JSON.encode(state);
    this.games.findOne({ where: { gameID: id } }).then(game => {
      game.gameState = JSONstate;
      return;
    });
    return await this.games.create({ gameID: id, gameState: JSONstate });
  }

  /**
   * Read the game state from the SQL object.
   * @param {string} id - The game id.
   * @returns {object} - A game state, or undefined
   *                     if no game is found with this id.
   */
  async get(id) {
    const game = await this.games.findOne({ where: { gameID: id } });
    if (game === null) {
      return undefined; // this is what BGIO expects
    }
    return await JSON.decode(game.gameState);
  }

  /**
   * Check if a particular game id exists.
   * @param {string} id - The game id.
   * @returns {boolean} - True if a game with this id exists.
   */
  async has(id) {
    const game = await this.games.findOne({ where: { gameID: id } });
    return game !== null;
  }

  /**
   * Remove the game state from the SQL object.
   * @param {string} id - The game id.
   */
  async remove(id) {
    await this.games.destroy({ where: { gameID: id } });
  }

  /**
   * Return all keys.
   * @returns {array} - Array of keys (strings)
   */
  async list() {
    return [...(await this.games.primaryKeyAttributes)];
  }
}
