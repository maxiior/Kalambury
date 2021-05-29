from GameEngine.Player import Player
from .Room import Room
import random
from typing import List, Tuple


class GameStatus:
    not_started = "notStarted"
    started = "started"
    ended = "Ended"


class Game:
    def __init__(self, game_id, player) -> None:
        self.identifier = None
        self.word_to_guess = ""
        self.words_used = []
        self.round_number:int = 0
        self.host:Player = None
        self.player_list:List[Player] = [] 
        self.drawer:Player = None
        self.status:GameStatus = GameStatus.not_started
        self.identifier = game_id
        

    def create_new_game(self):
        self.status = GameStatus.started
        if not self.drawer:
            self.drawer = self.player_list[0]
        if not self.host:
            self.host = self.player_list[0]
        if not self.word_to_guess:
            self.word_to_guess = self.__get_random_word()
        return self

    def guess_the_word(self, player:Player, word:str):
        if word.lower() == self.word_to_guess.lower():
            player.set_points(player.get_points() + 100)
            self.drawer.set_points(self.drawer.get_points() + 50)
            return True
        return False

    def new_round(self):
        if self.status == GameStatus.not_started:
            self.status = GameStatus.started
            
        players_without_drawer = [x for x in self.player_list if x.name != self.drawer.name]
        if len(players_without_drawer) == 0:
            self.drawer = self.player_list[0]
        else:
            self.drawer = players_without_drawer[random.randint(0, len(players_without_drawer) - 1)]
        self.word_to_guess = self.__get_random_word()

        self.round_number = self.round_number + 1

    def create_player_with_given_id(self, player_id) -> Player:
        if self.get_player_by_id(player_id):
            raise Exception("Player with given id exists. Cannot create new with given id.")
        player = Player()
        player.identifier = player_id
        player.name = f"NewPlayer_{random.randint(0,999)}"
        self.player_list.append(player)
        return player

    def get_word_placeholder(self):
        return "_" * len(self.word_to_guess)

    def get_player_by_id(self, player_id) -> Player:
        player = [x for x in self.player_list if x.identifier == player_id]
        if player:
            return player[0]

    def disconnect(self, player:Player):
        self.player_list.remove(player)

    def __get_random_word(self):
        # Implement real external source
        words_all = ["Dom", "Zeszyt", "Banknot", "Komputer",
                 "Ropucha", "Kasztan", "Obraz", "Szpital",
                 "Marchew", "Komin", "Harmonijka", "Kot"]
        words_available = [x for x in words_all if x not in self.words_used]
        random_word = words_available[random.randint(0, len(words_available) - 1)]
        self.words_used.append(random_word)
        return random_word


