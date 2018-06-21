#
# Copyright 2018 The boardgame.io Authors
#
# Use of this source code is governed by a MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.
#
# pylint: disable=invalid-name,import-error,no-self-use

"""
Boardgame.io python client.
"""

import logging
import socketIO_client as io

class Namespace(io.BaseNamespace):
    """
    SocketIO namespace providing handlers for events
    of the connection with the boardgame.io server.
    """
    log = logging.getLogger('client.namespace')

    def __init__(self, *args):
        io.BaseNamespace.__init__(self, *args)
        self.bot = None
        self.previous_state_id = None
        self.actions = []

    def set_bot_info(self, bot):
        """
        Provides access to the Bot class that owns the connection.
        FIXME: is made necessary since socketio does not provide (yet) a way
        to pass extra arguments to the ctor of the namespace at creation.
        """
        self.bot = bot
        return self

    def on_connect(self):
        """ Handle connection event. """
        self.log.info('connected') # to game <%s>' % self.bot.game_id)

    def on_disconnect(self):
        """ Handle disconnection event. """
        self.log.info('disconnected')
    def on_reconnect(self):
        """ Handle reconnection event. """
        self.log.info('reconnected')

    def on_sync(self, *args):
        """ Handle serve 'sync' event. """
        game_id = args[0]
        state = args[1]
        state_id = state['_stateID']
        ctx = state['ctx']

        # is it my game and my turn to play?
        if game_id == self.bot.game_id:
            if not self.previous_state_id or state_id >= self.previous_state_id:

                self.previous_state_id = state_id
                self.log.debug('state = %s', str(state))
                G = state['G']

                if 'gameover' in ctx:
                    # game over
                    self.bot.gameover(G, ctx)

                elif self.bot.player_id in ctx['actionPlayers']:
                    self.log.info('phase is %s', ctx['phase'])
                    if not self.actions:
                        # plan next actions
                        self.actions = self.bot.think(G, ctx)
                        if not isinstance(self.actions, list):
                            self.actions = [self.actions]
                    if self.actions:
                        # pop next action
                        action = self.actions.pop(0)
                        self.log.info('sent action: %s', action['payload'])
                        self.emit('action', action, state_id, game_id,
                                  self.bot.player_id)


class Bot(object):
    """
    Base class for boardgame.io bot.
    """
    log = logging.getLogger('client.bot')

    def __init__(self, server='localhost', port='8000',
                 options=None):
        """
        Connect to server with given game name, id and player id.
        Request initial synchronization.
        """
        opts = {'game_name'  : 'default',
                'game_id'    : 'default',
                'player_id'  : '1',
                'num_players': 2}
        opts.update(options or {})
        self.game_id = opts['game_name'] + ':' + opts['game_id']
        self.player_id = opts['player_id']
        self.num_players = opts['num_players']

        # open websocket
        socket = io.SocketIO(server, port, wait_for_connection=False)
        self.io_namespace = socket.define(Namespace, '/'+opts['game_name'])
        self.io_namespace.set_bot_info(self)
        self.socket = socket

        # request initial sync
        self.io_namespace.emit('sync', self.game_id, self.player_id, self.num_players)

    def _create_action(self, action, typ, args=None):
        if not args:
            args = []
        return {
            'type': action,
            'payload': {
                'type': typ,
                'args': args,
                'playerID': self.player_id
            }
        }

    def make_move(self, typ, *args):
        """ Create MAKE_MOVE action. """
        return self._create_action('MAKE_MOVE', typ, list(args))

    def game_event(self, typ):
        """ Create GAME_EVENT action. """
        return self._create_action('GAME_EVENT', typ)

    def listen(self, timeout=1):
        """
        Listen and handle server events: when it is the bot's turn to play,
        method 'think' will be called with the game state and context.
        Return after 'timeout' seconds if no events.
        """
        self.socket.wait(seconds=timeout)

    def think(self, _G, _ctx):
        """
        To be overridden by the user.
        Shall return a list of actions, instantiated with make_move().
        """
        assert False

    def gameover(self, _G, _ctx):
        """
        To be overridden by the user.
        Shall handle game over.
        """
        assert False
