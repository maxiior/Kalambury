import json
from channels.generic.websocket import AsyncWebsocketConsumer
from typing import Tuple, List
import random
import uuid


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.group_code = 'chat_%s' % self.room_code
        self.user = None

        await self.channel_layer.group_add(
            self.group_code,
            self.channel_name
        )

        self.game_engine: GameEngine = GameEngine(
            self.room_code, self.channel_name)

        await self.accept()

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)

        # Send message to room group
        # await self.channel_layer.group_send(
        #    self.group_code,
        #    {
        #        'type': 'msg',
        #        'message': message + str(test)
        #    }
        # )

        engine_responses = self.game_engine.handleMessage(data)

        for receivers_list, response in engine_responses:
            await self.channel_layer.group_send(
                self.group_code,
                {
                    'receivers': receivers_list,
                    'payload': response,
                    'type': "msg"
                }
            )

        #test =test + 1
        # if self.user:
        #    await self.channel_layer.group_send(
        #        self.group_code,
        #        {
        #            'type': 'msg',
        #            'message': f"{message}. its me: {self.user}"
        #        }
        #    )

    # Receive message from room group
    async def msg(self, event):
        if self.channel_name in event['receivers']:
            await self.send(text_data=json.dumps(
                event['payload']
            ))

        # await self.send(text_data=json.dumps({
        #    'message': message,
        #    'debug': 'hello world'
        # }))

    async def disconnect(self, close_code):
        self.game_engine.disconnect()

        await self.channel_layer.group_discard(
            self.group_code,
            self.channel_name
        )


class GameStatus():
    playersIdList = []
    playersIdToUsername = {}
    playersIdToPoints = {}
    roomId = None
    hostId = None
    currentRoomId = None
    currentPassword: str = None
    currentRoundNumber: list = [0]
    wordToGuess = ""
    currentDrawerId: str = None
    currentStatus: str
    messageCounter = [0]


GAME_SERVERS: List[GameStatus] = []


class GameEngine():
    def __init__(self, roomId, playerId) -> None:
        global GAME_SERVERS
        self.player_id = playerId
        self.game_room = [x for x in GAME_SERVERS if x.roomId == roomId]
        print("Game servers counter: ", len(GAME_SERVERS))
        print("Initing room: ", roomId)
        if not self.game_room:
            self.__create_new_room(roomId)
        else:
            self.game_room: GameStatus = self.game_room[0]
            print("Found existing room", self.game_room.roomId)

        self.__join_player_to_existing_room()

    def handleMessage(self, message) -> Tuple[list, str]:
        websocket_responses = []

        if(message["type"] == "ChangeUsername"):
            current_name = self.__get_human_readable_username(self.player_id)
            self.__set_player_name(message["new_username"])

            # response = {
            #    "Message": f'Username: {current_name} Changes his name to: {message["new_username"]}'
            # }
            #websocket_responses.append((self.player_id, response))

        if(message["type"] == "ChatMessage"):
            response = {
                "type": "ChatMessage",
                "User": self.__get_human_readable_username(self.player_id),
                "Message": message["Message"]
            }

            if self.__guess_word(message["Message"]):
                websocket_responses.append((self.game_room.currentDrawerId, self.__get_message_with_full_word()))
            websocket_responses.append(
                (self.game_room.playersIdList, response))

        if(message["type"] == "CanvasUpdate"):
            websocket_responses.append((self.game_room.playersIdList, message))

        if(message["type"] == "StartGame"):
            self.__start_game()
            websocket_responses.append((self.game_room.currentDrawerId, self.__get_message_with_full_word()))

        if(message["type"] != "CanvasUpdate"):
            websocket_responses.append(
                (self.game_room.playersIdList, self.__get_game_status_message()))

        return websocket_responses

    def disconnect(self):
        print("Player disconnected")
        print(type(self.game_room))
        self.game_room.playersIdList.remove(self.player_id)
        del self.game_room.playersIdToUsername[self.player_id]

    def __get_game_status_message(self) -> dict:
        players_with_points = {}
        print(self.game_room.playersIdToPoints)
        for player in self.game_room.playersIdList:
            players_with_points[self.__get_human_readable_username(
                player)] = self.game_room.playersIdToPoints[player][0]
            
        response = {
            "type": "GameStatus",
            "status": self.game_room.currentStatus,
            "current_round": self.game_room.currentRoundNumber[0],
            "current_painter": self.__get_human_readable_username(self.game_room.currentDrawerId),
            "word_placeholder": self.__get_word_to_guess_placeholder(),
            "round_duration": 60,
            "player_list": players_with_points
        }

        response_as_chat = {
            "Message": json.dumps(response)
        }
        return response

    def __start_game(self):
        random_player_index = random.randint(
            0, len(self.game_room.playersIdList) - 1)
        self.game_room.currentStatus = "Started"
        self.game_room.wordToGuess = self.__get_random_word()
        self.game_room.currentDrawerId = self.game_room.playersIdList[random_player_index]

    def __guess_word(self, word) -> str:
        if word == self.game_room.wordToGuess:
            self.__set_player_points(self.player_id, self.__get_player_points(self.player_id) + 100)
            self.__set_player_points(self.game_room.currentDrawerId, self.__get_player_points(self.game_room.currentDrawerId) + 50)
            self.__new_round()
            return True

    def __new_round(self) -> str:
        players_without_current_painter = [x for x in self.game_room.playersIdList if x != self.game_room.currentDrawerId]
        if players_without_current_painter:
            random_player_index = random.randint(0, len(players_without_current_painter) - 1)
        else:
            random_player_index = 0
        self.game_room.wordToGuess = self.__get_random_word()
        self.game_room.currentDrawerId = self.game_room.playersIdList[random_player_index]
        print("New drawer:", self.__get_human_readable_username(self.game_room.currentDrawerId))

    def __get_message_with_full_word(self):
        response = {
            "type": "WordToDraw",
            "word": self.game_room.wordToGuess
        }
        return response

    def __get_random_word(self):
        # Implement real external source 
        words = ["Dom", "Zeszyt", "Banknot", "Komputer", "Ropucha", "Kasztan", "Obraz", "Szpital"]
        random_word = words[random.randint(0, len(words) - 1)]
        return random_word

    def __get_player_points(self, userId):
        return self.game_room.playersIdToPoints[userId][0]

    def __set_player_points(self, userId, points):\
        self.game_room.playersIdToPoints[userId][0] = points

    def __get_word_to_guess_placeholder(self):
        # TODO show minimum two random letters in random places
        return "_" * len(self.game_room.wordToGuess)

    def __join_player_to_existing_room(self):
        if not self.player_id in self.game_room.playersIdList:
            self.game_room.playersIdList.append(self.player_id)
            self.__set_player_name(f"RandomPlayerName_{uuid.uuid4()}")
            self.game_room.playersIdToPoints.update({self.player_id: [0]})

    def __create_new_room(self, roomId) -> None:
        self.game_room: GameStatus = GameStatus()
        self.game_room.hostId = self.player_id
        self.game_room.currentDrawerId = self.player_id
        self.game_room.currentStatus = "notStarted"
        self.game_room.roomId = roomId
        self.game_room.playersIdList = []
        self.game_room.playersIdToUsername = {}
        self.game_room.playersIdToPoints = {}

        GAME_SERVERS.append(self.game_room)

    def __get_human_readable_username(self, player_id):
        return self.game_room.playersIdToUsername[player_id]

    def __set_player_name(self, new_name):
        self.game_room.playersIdToUsername[self.player_id] = new_name
