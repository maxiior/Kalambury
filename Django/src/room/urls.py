from django.urls import path
from .views import index, room

app_name = 'room'

urlpatterns = [
    path('', index, name='index'),
    path('<str:room_code>/', room, name='room'),
]
