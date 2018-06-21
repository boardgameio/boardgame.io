#!/usr/bin/python
#
# Copyright 2018 The boardgame.io Authors
#
# Use of this source code is governed by a MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.
#
# pylint: disable=invalid-name,multiple-imports,global-statement

# To play against this bot, start the tictactoe server from http://boardgame.io/#/multiplayer
# and start the bot with:
# $ python tictactoebot.py
# (will play player '1' by default)

"""
Boardgame.io python client example: starts a bot with player id '0'
that plays randomly against the other player '1'.
"""

import signal, random, logging
from boardgameio import Bot

class TicTacToeBot(Bot):
    """
    Example of use of base class boardgameio.Bot:
    - the bot connects to the multiplayer server at construction
    - each time it is the bot's turn to play, method 'think' is called
    - when game is over, method 'gameover' is called.
    """
    log = logging.getLogger('tictactoebot')

    def __init__(self):
        Bot.__init__(self, server='localhost', port=8000,
                     options={'game_name': 'default',
                              'num_players': 2,
                              'player_id': '1'})

    def think(self, G, _ctx):
        """ Called when it is this bot's turn to play. """
        cells = G['cells']
        # choose a random empty cell
        idx = -1
        while True and None in cells:
            idx = random.randint(0, len(cells)-1)
            if not cells[idx]:
                break
        self.log.debug('cell chosen: %d', idx)
        return self.make_move('clickCell', idx)

    def gameover(self, _G, ctx):
        """ Called when game is over. """
        self.log.info('winner is %s', ctx['gameover'])


running = False
log = logging.getLogger('main')
logging.basicConfig(level=logging.INFO)

def main():
    """ Start bot and listen continuously for events. """
    log.info('starting bot... (Ctrl-C to stop)')
    client = TicTacToeBot()
    global running
    running = True
    while running:
        client.listen()
    log.info('stopped.')

def stop(_signum, _frame):
    """ Stop program. """
    log.info('stopping...')
    global running
    running = False

# start process
if __name__ == '__main__':
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    main()
