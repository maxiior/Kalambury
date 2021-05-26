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
        self.round_number:int = 0
        self.host:Player = None
        self.player_list:List[Player] = [] 
        self.drawer:Player = None
        self.status:GameStatus = GameStatus.not_started
        self.player:Player = None
        self.identifier = game_id
        

    def create_new_game(self):
        self.status = GameStatus.started
        if not self.drawer:
            self.drawer = self.player
        if not self.host:
            self.host = self.player
        self.word_to_guess = self.__get_random_word()
        return self

    def guess_the_word(self, word):
        print("Word to guess: ", self.word_to_guess)
        print("Word given: ", word)
        if word.lower() == self.word_to_guess.lower():
            self.player.set_points(self.player.get_points() + 100)
            self.drawer.set_points(self.drawer.get_points() + 50)
            print("Guessed word: ", self.word_to_guess)
            return True
        return False

    def new_round(self):
        if self.status == GameStatus.not_started:
            self.status = GameStatus.started
            
        players_without_drawer = [x for x in self.player_list if x.name != self.player.name]
        if len(players_without_drawer) == 0:
            self.drawer = self.player
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
        self.player = player
        return player

    def get_word_placeholder(self):
        return "_" * len(self.word_to_guess)

    def get_player_by_id(self, player_id) -> Player:
        player = [x for x in self.player_list if x.identifier == player_id]
        if player:
            return player[0]

    def disconnect(self):
        self.player_list.remove(self.player)

    def __get_random_word(self):
        # Implement real external source
        words = ["Dom", "Zeszyt", "Banknot", "Komputer",
                 "Ropucha", "Kasztan", "Obraz", "Szpital",
                 "Marcher", "Komin", "Harmonijka", "Kot"]
        if self.word_to_guess in words:
            words.remove(self.word_to_guess)
        random_word = words[random.randint(0, len(words) - 1)]
        return random_word


