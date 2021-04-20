from os import read

from django.shortcuts import render
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import StaticHTMLRenderer, JSONRenderer
from rest_framework.response import Response
import json, uuid
from datetime import datetime


def index(request):
    return render(request, 'room/index.html')


def room(request, room_code):
    username = request.POST.get('username', None)
    return render(request, 'room/room.html', {
        'room_code': room_code,
        'username': username,
    })


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def create_room(request):
    """
    Retrieve, update or delete a code snippet.
    """
    response = {
        "status": "success",
        "id": f"{uuid.uuid4()}".replace("-", ""),
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    return Response(response)
