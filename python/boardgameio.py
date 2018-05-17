#
# Copyright 2018 The boardgame.io Authors
#
# Use of this source code is governed by a MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.
#

import logging, time
import socketIO_client as io


class Namespace(io.BaseNamespace):

    log = logging.getLogger('client.namespace')
    
    def __init__(self, *args):
        io.BaseNamespace.__init__(self, *args)
        self.bot = None
        self.previous_state_id = None
        self.actions = []

    def set_bot_info(self, bot):
        self.bot = bot
        return self
    
    def on_connect(self):
        self.log.info('connected') # to game <%s>' % self.bot.game_id)
    def on_disconnect(self):
        self.log.info('disconnected')
    def on_reconnect(self):
        self.log.info('reconnected')
    
    def on_sync(self, *args):
        game_id = args[0]
        state = args[1]
        state_id = state['_stateID']
        ctx = state['ctx']
        
        # is it my game and my turn to play?
        if game_id == self.bot.game_id:
            if not self.previous_state_id or state_id>=self.previous_state_id:

                self.previous_state_id = state_id
                self.log.debug('state = %s' % str(state))
                G = state['G']
                
                if 'gameover' in ctx:
                    # game over
                    self.bot.gameover(G, ctx)
                    
                elif self.bot.player_id in ctx['actionPlayers']:
                    self.log.info('phase is %s' % (ctx['phase']))
                    if not self.actions:
                        # plan next actions
                        self.actions = self.bot.think(G, ctx)
                        if type(self.actions) is not list:
                            self.actions = [self.actions]
                    if self.actions:
                        # pop next action
                        action = self.actions.pop(0)
                        self.log.info('sent action: %s' % action['payload'])
                        self.emit('action', action, state_id, game_id,
                                  self.bot.player_id)


class Bot(object):

    log = logging.getLogger('client.bot')
    
    def __init__(self, server='localhost', port='8000',
                 game_name='default', game_id='default',
                 player_id='1', num_players=2):
        """
        Connect to server with given game name, id and player id.
        Request initial synchronization.
        """
        self.game_id = game_name+':'+game_id
        self.player_id = player_id
        self.num_players = num_players
        
        # open websocket
        socket = io.SocketIO(server, port, wait_for_connection=False)
        self.io_namespace = socket.define(Namespace, '/'+game_name)
        self.io_namespace.set_bot_info(self)
        self.socket = socket
        
        # request initial sync
        self.io_namespace.emit('sync', self.game_id, player_id, self.num_players)

    def _create_action(self, action, type, args=[]):
        return {
            'type': action,
            'payload': {
                'type': type,
                'args': args,
                'playerID': self.player_id
            }
        }
        
    def make_move(self, type, *args):
        """ Create MAKE_MOVE action. """
        return self._create_action('MAKE_MOVE',type,list(args))

    def game_event(self, type):
        """ Create GAME_EVENT action. """
        return self._create_action('GAME_EVENT',type)

    def listen(self, timeout=1):
        """
        Listen and handle server events: when it is the bot's turn to play,
        method 'think' will be called with the game state and context.
        Return after 'timeout' seconds if no events.
        """
        self.socket.wait(seconds=timeout)

    def think(self, G, ctx):
        """
        To be overridden by the user.
        Shall return a list of actions, instantiated with make_move().
        """
        assert False

    def gameover(self, G, ctx):
        """
        To be overridden by the user.
        Shall handle game over.
        """
        assert False
