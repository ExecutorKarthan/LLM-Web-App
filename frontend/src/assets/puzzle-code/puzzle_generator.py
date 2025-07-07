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


def generate_path(size):
    """Generates a random path from top-left to bottom-right."""

    path = [(0, 0)]
    current_row, current_col = 0, 0

    while current_row < size - 1 or current_col < size - 1:
        # Possible moves: right or down
        possible_moves = []
        if current_row < size - 1:
            possible_moves.append((current_row + 1, current_col))
        if current_col < size - 1:
            possible_moves.append((current_row, current_col + 1))

        # Choose a random move
        next_row, next_col = random.choice(possible_moves)
        path.append((next_row, next_col))
        current_row, current_col = next_row, next_col

    return path



grid_size = 20
box_size = 20

# Generate a random path
path = generate_path(grid_size)

# Draw the grid with the path
draw_grid(grid_size, box_size, path)

