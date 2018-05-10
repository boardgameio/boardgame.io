#!/usr/bin/python
#
# Copyright 2018 The boardgame.io Authors
#
# Use of this source code is governed by a MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.
#

# To play against this bot, start the tictactoe server from http://boardgame.io/#/multiplayer
# and start the bot with:
# $ python tictactoebot.py
# (will play player '1' by default)


import sys, argparse, copy, signal, json, random, time, logging, sys, logging
from boardgameio import Bot


class TicTacToeBot(Bot):

    log = logging.getLogger('tictactoebot')

    def __init__(self):
        Bot.__init__(self, server='localhost', port=8000, game_name='default', num_players=2, player_id='1')
    
    # Called when it is this bot's turn to play.
    def think(self, G, ctx):
        cells = G['cells']
        # choose a random empty cell
        idx = -1
        while True and None in cells:
            idx = random.randint(0, len(cells)-1)
            if not cells[idx]:
                break
        self.log.debug('cell chosen: '+str(idx))
        return self.make_move('clickCell', idx)

    # Called when game is over.
    def gameover(self, G, ctx):
        self.log.info('winner is '+ctx['gameover'])


running = False
log = logging.getLogger('main')
logging.basicConfig(level=logging.INFO)

def main(argv=sys.argv):
    log.info('starting bot... (Ctrl-C to stop)')
    client = TicTacToeBot()
    global running
    running = True
    while running:
        client.listen()
    log.info('stopped.')

def stop(signum, frame):
    log.info('stopping...')
    global running
    running = False
    
# start process
if __name__ == '__main__':
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    main()
