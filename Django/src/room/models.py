from django.db import models

# Create your models here.

player_name_to_websocket_id = []


class Roles:
    host = 1,
    painter = 2,
    guesser = 3

class Player:
    name = None
    score = None
    role = None

class Message:
    type = None

class ChatMessage(Message):
    type = "ChatMessage"
    sender = None
    content = None

class CanvasUpdate(Message):
    type = "CanvasUpdate"
    content = None

class GameStarted(Message):
    type = "GameStarted"

class GameStatus(Message):
    type = "GameStatus"
    current_round = None
    current_round_painter = None
    word_placeholder = None
    round_start_time = None
    round_duration = None
    player_list = None

class RoundEnded(Message):
    type = "RoundEnd"
    word = None
    scoreboard = None

class WordSelection(Message):
    type = "WordSelection"
    word_to_draw = None
