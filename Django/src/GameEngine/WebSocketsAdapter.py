from GameEngine.Game import Game

from .Game import Game
from .Player import Player
from typing import List, Tuple

GAMES_DB: Game = []
# PLAYERS_DB:Player = []


class WebSocketsAdapter:
    def __init__(self, game_id, player_id) -> None:

        self.game: Game = None
        self.player: Player = None

        found_game = [x for x in GAMES_DB if x.identifier == game_id]
        if found_game:
            self.game = found_game[0]
        else:
            self.game = Game(game_id, player_id)
            GAMES_DB.append(self.game)

        self.player = self.game.get_player_by_id(player_id)

        if not self.player:
            self.player = self.game.create_player_with_given_id(player_id)

        self.game.create_new_game()
        self.responses: list = []

    def handle_message(self, message_as_dict):
        messages_type_handler = {
            "CanvasUpdate": self.__handle_canvas_update,
            "ChatMessage": self.__handle_chat_message,
            "ClockStart": self.__handle_clock_start_info,
            "StartGame": self.__handle_start_game,
            "ChangeUsername": self.__handle_change_username,
            "TimeOut": self.__handle_start_game,
        }

        # when message type not equals to key then, the handler will be executed
        messages_not_equal_type_handler = {
            "CanvasUpdate": self.__handle_game_status
        }

        for message_type in messages_type_handler.keys():
            if message_type == message_as_dict["type"]:
                messages_type_handler[message_type](message_as_dict)

        for message_type in messages_not_equal_type_handler.keys():
            if message_type != message_as_dict["type"]:
                messages_not_equal_type_handler[message_type](message_as_dict)

        responses = self.responses
        self.responses = []
        return responses

    def disconnect(self):
        self.game.disconnect(self.player)

    def __handle_game_status(self, message=None):
        response = {
            "type": "GameStatus",
            "status": self.game.status,
            "current_round": self.game.round_number,
            "current_painter": self.game.drawer.name,
            "word_placeholder": self.game.get_word_placeholder(),
            "round_duration": 60,
            "host": self.game.host.name,
            "player_list": self.__get_players_with_points(),
        }
        self.__send_to_all(response)

    def __handle_change_username(self, message):
        self.player.name = message["new_username"]

    def __handle_chat_message(self, message):
        response = {
            "type": "ChatMessage",
            "User": self.player.name,
            "Message": message["Message"]
        }
        #self.game.player = self.player
        is_guessed = self.game.guess_the_word(self.player, message["Message"])
        self.__send_to_all(response)
        if is_guessed:
            who_guessed = {
                "type": "ChatMessage",
                "User": "2daef51c-be1b-11eb-8529-0242ac130003",
                "Message": self.player.name + " zgadł hasło (" + message["Message"] + ")"
            }
            self.__send_to_all(who_guessed)
            self.__new_round()

    def __handle_start_game(self, message):
        self.__new_round()
        pass

    def __handle_canvas_update(self, message):
        self.__send_to_all(message)

    def __handle_clock_start_info(self, message):
        response = {
            "type": "ClockInfo",
            "status": "start"
        }
        self.__send_to_all(response)

    def __new_round(self):
        self.game.new_round()

        response = {
            "type": "ClockInfo",
            "status": "reset"
        }
        self.__send_to_all(response)

        response_with_word_to_draw = {
            "type": "WordToDraw",
            "word": self.game.word_to_guess
        }
        self.__send_to_drawer(response_with_word_to_draw)

    def __prepare_response(self, response: dict, receivers: List[Player]):
        receivers_ids = [x.identifier for x in receivers]
        self.responses.append(([x.identifier for x in receivers], response))

    def __send_to_all_except(self, response: dict, player: Player) -> List[Player]:
        receivers = [x for x in self.game.player_list if x.name != player.name]
        self.__prepare_response(response, receivers)

    def __send_to_host(self, response: dict) -> List[Player]:
        receivers = [self.game.host]
        self.__prepare_response(response, receivers)

    def __send_to_drawer(self, response: dict) -> List[Player]:
        receivers = [self.game.drawer]
        self.__prepare_response(response, receivers)

    def __send_to_all(self, response: dict) -> List[Player]:
        receivers = self.game.player_list
        self.__prepare_response(response, receivers)

    def __get_players_with_points(self):
        players_with_points = {}
        for player in self.game.player_list:
            players_with_points[player.name] = player.get_points()
        return players_with_points
