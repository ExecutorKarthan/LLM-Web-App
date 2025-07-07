import turtle
import random

def draw_grid(size, box_size, path):
    """Draws a grid with a path."""

    screen = turtle.Screen()
    screen.setup(width=size * box_size + 50, height=size * box_size + 50)
    screen.bgcolor("white")
    turtle_instance = turtle.Turtle()
    turtle_instance.speed(0)  # Fastest speed
    turtle_instance.hideturtle()
    turtle_instance.penup()

    for row in range(size):
        for col in range(size):
            x = (col - size // 2) * box_size
            y = (size // 2 - row) * box_size
            turtle_instance.goto(x, y)
            turtle_instance.pendown()

            # Determine color based on location and path
            if (row, col) == (0, 0):
                color = "green"  # Top-left corner
            elif (row, col) == (size-1, size-1):
                 color = "gold" # Bottom right corner
            elif (row, col) in path:
                color = "white"  # Path color
            else:
                color = "blue"  # Default color

            turtle_instance.fillcolor(color)
            turtle_instance.begin_fill()
            for _ in range(4):
                turtle_instance.forward(box_size)
                turtle_instance.left(90)
            turtle_instance.end_fill()
            turtle_instance.penup()


grid_size = 20
box_size = 20

# Generate a random path
path = [(0, 0), (1, 0), (2, 0), (2, 1), (2, 2), (3, 2), (4, 2), (4, 3), (4, 4), (5, 4), (6, 4), (7, 4), (7, 5), (7, 6), (7, 7), (8, 7), (8, 8), (8, 9), (9, 9), (9, 10), (10, 10), (11, 10), (11, 11), (12, 11), (13, 11), (13, 12), (13, 13), (14, 13), (15, 13), (15, 14), (15, 15), (15, 16), (16, 16), (17, 16), (17, 17), (17, 18), (17, 19), (18, 19), (19, 19)]

# Draw the grid with the path
draw_grid(grid_size, box_size, path)

