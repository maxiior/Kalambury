

class Player:
    identifier = None
    name = None
    
    def __init__(self) -> None:
        self.__points = [0]

    def get_points(self):
        return self.__points[0]

    def set_points(self, points):
        self.__points[0] = points
