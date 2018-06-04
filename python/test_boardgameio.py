#
# Copyright 2018 The boardgame.io Authors
#
# Use of this source code is governed by a MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.
#
# pylint: disable=invalid-name,import-error,no-self-use,missing-docstring

# To run unit-tests:
# $ python -m unittest discover
# For coverage report:
# $ coverage run --source=boardgameio.py test_boardgameio.py
# $ coverage report

import unittest
import logging
import mock
import socketIO_client as io
from boardgameio import Namespace, Bot


logging.basicConfig(level=logging.DEBUG)


class TestNamespace(unittest.TestCase):

    def setUp(self):
        self.game_state = {'_stateID': 1234, 'G': {}, 'ctx': {
            'actionPlayers': ['1'],
            'phase': 'phase0'
        }}
        self.resulting_move = {'payload': 'action0'}
        # mock Bot instance
        self.botmock = mock.Mock(spec=Bot)()
        self.botmock.game_id = 'game0'
        self.botmock.player_id = self.game_state['ctx']['actionPlayers'][0]
        self.botmock.think.return_value = self.resulting_move
        # mock socket
        self.sockmock = mock.Mock(spec=io.SocketIO)()
        # instantiate SUT
        self.sut = Namespace(self.sockmock, 'default').set_bot_info(self.botmock)
        self.sut.emit = mock.MagicMock(name='emit')

    def test_on_sync_shall_call_think(self):
        # call Namespace.on_sync()
        self.sut.on_sync(self.botmock.game_id, self.game_state)
        self.botmock.think.assert_called_once_with(self.game_state['G'], self.game_state['ctx'])
        self.sut.emit.assert_called_once_with('action', self.resulting_move,
                                              self.game_state['_stateID'],
                                              self.botmock.game_id, self.botmock.player_id)

    def test_on_sync_shall_not_call_think_if_game_id_is_different(self):
        # call on_sync with another game id
        self.sut.on_sync('other-game', self.game_state)
        self.botmock.think.assert_not_called()
        self.sut.emit.assert_not_called()

    def test_on_sync_shall_not_call_think_if_player_id_is_not_active(self):
        # change active players in game state
        self.game_state['ctx']['actionPlayers'] = ['0', '2']
        # call on_sync with bot game id
        self.sut.on_sync(self.botmock.game_id, self.game_state)
        self.botmock.think.assert_not_called()
        self.sut.emit.assert_not_called()

    def test_on_sync_shall_call_gameover_if_game_is_over(self):
        # activate gameover in game state
        self.game_state['ctx']['gameover'] = ['0']
        # call on_sync with bot game id
        self.sut.on_sync(self.botmock.game_id, self.game_state)
        self.botmock.gameover.assert_called_once_with(self.game_state['G'], self.game_state['ctx'])
        self.sut.emit.assert_not_called()


class TestBot(unittest.TestCase):

    def setUp(self):
        self.game_state = {'_stateID': 1234, 'G': {}, 'ctx': {
            'actionPlayers': ['1'],
            'phase': 'phase0'
        }}
        self.resulting_move = {'payload': 'action0'}
        # mock socket
        io.SocketIO = mock.Mock(spec=io.SocketIO)
        # instantiate SUT
        self.sut = Bot()
        self.sut.think = mock.MagicMock(name='think')
        self.sut.gameover = mock.MagicMock(name='gameover')

    def test_make_move_shall_return_move_action(self):
        self.assertEqual(self.sut.make_move('type', 'foo', 'bar'),
                         {'type': 'MAKE_MOVE',
                          'payload': {
                              'type': 'type',
                              'args': ['foo', 'bar'],
                              'playerID': self.sut.player_id
                          }})

    def test_game_event_shall_return_event_action(self):
        self.assertEqual(self.sut.game_event('foobar'),
                         {'type': 'GAME_EVENT',
                          'payload': {
                              'type': 'foobar',
                              'args': [],
                              'playerID': self.sut.player_id}
                         })


if __name__ == '__main__':
    unittest.main()
