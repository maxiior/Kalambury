import json
from channels.generic.websocket import AsyncWebsocketConsumer
from typing import Tuple, List
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
    currentDrawer: str = None
    maxRoundsNumber: list = [5]
    isStarted: bool = False
    messageCounter = [0]


GAME_SERVERS: List[GameStatus] = []


class GameEngine():
    def __init__(self, roomId, playerId) -> None:
        global GAME_SERVERS
        self.player_id = playerId
        self.game_room = [x for x in GAME_SERVERS if x.roomId == roomId]
        print("Initing room: ", roomId)
        if not self.game_room:
            self.__createNewRoom(roomId)
        else:
            self.game_room: GameStatus = self.game_room[0]

        self.__join_player_to_existing_room()

    def handleMessage(self, message) -> Tuple[list, str]:
        websocket_responses = []

        if(message["type"] == "ChangeUsername"):
            current_name = self.__get_human_readable_username(self.player_id)
            self.__set_player_name(message["new_username"])

            response = {
                "Message": f'Username: {current_name} Changes his name to: {message["new_username"]}'
            }
            websocket_responses.append((self.player_id, response))

        if(message["type"] == "ChatMessage"):
            response = {
                "type": "ChatMessage",
                "User": self.__get_human_readable_username(self.player_id),
                "Message": message["Message"]
            }
            websocket_responses.append(
                (self.game_room.playersIdList, response))

        if(message["type"] == "PlayersIdList"):
            names = []
            for id in self.game_room.playersIdList:
                names.append(self.__get_human_readable_username(id))
            response = {
                "type": "PlayersIdList",
                "Users": names
            }
            websocket_responses.append(
                (self.game_room.playersIdList, response))

        if(message["type"] == "CanvasUpdate"):
            websocket_responses.append((self.game_room.playersIdList, message))

        self.game_room.messageCounter[0] = self.game_room.messageCounter[0] + 1
        response = {
            "Message": f"Extra message From server to all: Message counter: {self.game_room.messageCounter[0]}"
        }

        if(message["type"] != "CanvasUpdate"):
            websocket_responses.append(
                (self.game_room.playersIdList, response))
            websocket_responses.append(
                (self.game_room.playersIdList, self.getGameStatusMessage()))

        return websocket_responses

    # def getLobbyStatusMessage(self) -> dict:
    #    response = {
    #        "type": "LobbyStatus",
    #        "round_start_time": 12,
    #        "round_duration": 60,
    #        "player_list": [x for x in self.game_room.playersIdToUsername.values()]
    #    }
    #
    #    response_as_chat =  {
    #        "ChatMessage": json.dumps(response)
    #    }
    #    return response_as_chat

    def getGameStatusMessage(self) -> dict:
        players_with_points = {}
        print(self.game_room.playersIdToPoints)
        for player in self.game_room.playersIdList:
            players_with_points[self.__get_human_readable_username(
                player)] = self.game_room.playersIdToPoints[player][0]
        response = {
            "type": "GameStatus",
            "current_round": self.game_room.currentRoundNumber[0],
            "current_painter": self.__get_human_readable_username(self.game_room.hostId),
            "word_placeholder": "word_place_holder",
            "round_start_time": 12,
            "round_duration": 60,
            "player_list": players_with_points
        }

        response_as_chat = {
            "Message": json.dumps(response)
        }
        return response_as_chat

    def __roundStarted(self) -> str:
        pass

    def __roundEnded(self) -> str:
        pass

    def __game_End(self) -> str:
        pass

    def __getRandomWord(self):
        return "RandomWord"  # Chosen by fair dice roll

    def disconnect(self):
        print("Player disconnected")
        print(type(self.game_room))
        self.game_room.playersIdList.remove(self.player_id)
        del self.game_room.playersIdToUsername[self.player_id]

    def __join_player_to_existing_room(self):
        if not self.player_id in self.game_room.playersIdList:
            self.game_room.playersIdList.append(self.player_id)
            self.__set_player_name(f"RandomPlayerName_{uuid.uuid4()}")
            self.game_room.playersIdToPoints.update({self.player_id: [0]})

    def __createNewRoom(self, roomId) -> None:
        self.game_room: GameStatus = GameStatus()
        self.game_room.isStarted = False
        self.game_room.hostId = self.player_id

        GAME_SERVERS.append(self.game_room)

    def __get_human_readable_username(self, player_id):
        return self.game_room.playersIdToUsername[player_id]

    def __set_player_name(self, new_name):
        self.game_room.playersIdToUsername[self.player_id] = new_name
