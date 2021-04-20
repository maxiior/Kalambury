from django.urls import path
from .views import index, room
from .views import create_room

app_name = 'room'

urlpatterns = [
    path('', index, name='index'),
    path('create/', create_room, name="create"),
    path('<str:room_code>/', room, name='room'),
]
