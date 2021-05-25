import json
from channels.generic.websocket import AsyncWebsocketConsumer
from typing import Tuple, List
import random
import uuid
from GameEngine.WebSocketsAdapter import WebSocketsAdapter
from GameEngine.Game import Game


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.group_code = 'chat_%s' % self.room_code
        self.user = None

        await self.channel_layer.group_add(
            self.group_code,
            self.channel_name
        )

        #self.game_engine: GameEngine = GameEngine(
        #    self.room_code, self.channel_name)

        self.game_engine_v2: WebSocketsAdapter = WebSocketsAdapter(self.room_code, self.channel_name)

        await self.accept()

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)

        engine_responses = self.game_engine_v2.handle_message(data)

        for receivers_list, response in engine_responses:
            await self.channel_layer.group_send(
                self.group_code,
                {
                    'receivers': receivers_list,
                    'payload': response,
                    'type': "msg"
                }
            )

    # Receive message from room group
    async def msg(self, event):
        if self.channel_name in event['receivers']:
            await self.send(text_data=json.dumps(
                event['payload']
            ))

    async def disconnect(self, close_code):
        self.game_engine_v2.disconnect()

        await self.channel_layer.group_discard(
            self.group_code,
            self.channel_name
        )
