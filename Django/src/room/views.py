from django.shortcuts import render


def index(request):
    return render(request, 'room/index.html')


def room(request, room_code):
    username = request.POST.get('username', None)
    return render(request, 'room/room.html', {
        'room_code': room_code,
        'username': username,
    })
