## How to Create New Levels
Levels are defined using 2D arrays where each string represents a tile at that position. Each row corresponds to the Z-axis, and each element in the row corresponds to the X-axis. The tile values determine terrain, walls, and special elements in the scene.

# Example

const hole1 = [
  ['C',  'B', 'B',  'B', 'C'],
  ['R',  '0',  '0',  'X',  'L'],
  ['R',  '0',  'LTB', 'TB', 'C'],
  ['R',  '0',  '0',  'S',  'L'],
  ['C',  'T', 'T',  'T', 'C']
];

## Tile Legend

These are the available course tiles and what they mean. 

# Course Symbols

0 -	Playable ground tile
X -	Hole (scoring zone)
S -	Start tile (player spawns here)

# Wall Strings
Walls are defined using any combination of the characters L, R, T, B:

L -	Left edge of the tile
R -	Right edge of the tile
T -	Top edge of the tile
B -	Bottom edge of the tile

You can combine them freely to build any wall structure

- L - single wall on the left

- LR - walls on both left and right

- LTB - walls on left, top, and bottom

- TB - walls on top and bottom only

# Corners

The corner is a special tile, that calculates all adjacent walls that have connecting, perpendicular 
walls, and puts a post in the corresponding corner:

C - corner at all places