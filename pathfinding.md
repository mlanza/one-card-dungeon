# Pathfinding Specification

This document outlines the functionality of the `paths` function, which is responsible for calculating optimal paths on a 2D grid. The implementation resides in `ocd.js` and uses standard `function` declarations.

## Overview

The `paths` function takes a grid map, a source coordinate, and a target coordinate. It calculates the most efficient path(s) for an actor to move from the source to a position orthogonally adjacent to the target.

## Function Signature

```js
export function paths(source, target, grid)
```

-   **`source`**: An array `[row, col]` representing the starting coordinates.
-   **`target`**: An array `[row, col]` representing the target's coordinates.
-   **`grid`**: A 2D array representing the map.

## Grid and Coordinates

The grid is a 2D array of any size. Each cell contains either `null` or a value representing an occupant or obstacle.

-   **Coordinates**: All coordinates are expressed as `[row, col]`.
-   **Passable Terrain**: A cell is considered "passable" if its content is `null`.
-   **Obstacles**: Any cell with a non-`null` value is considered an obstacle and is impassable.
    -   The `source` actor's starting position is always considered passable for the path calculation.
    -   The `target` actor's own square is considered impassable.

An external helper function, `_.getIn(grid, [row, col])`, is used to access cell contents.

## Movement Rules

Movement is calculated in steps, where each step is a `[row, col]` offset.

-   **8-Directional Movement**: Actors can move one square at a time, either orthogonally or diagonally. This corresponds to step offsets where `row` and `col` are `1`, `0`, or `-1` (but not `[0, 0]`).
-   **Diagonal Movement**: A diagonal move is only considered legitimate if a path of two orthogonal moves to the same destination square is also clear of obstacles. This "no corner cutting" rule prevents moving through the corner of two adjacent walls.

## Pathfinding Goal

The goal is not to land *on* the target's square, but to land on a passable square that is **orthogonally adjacent** to it (i.e., a Manhattan distance of 1). The algorithm finds the shortest path(s) to any such valid square.

## Algorithm

The function uses a **Breadth-First Search (BFS)** algorithm. Since each move (orthogonal or diagonal) has a uniform cost of 1 step, BFS is guaranteed to find the path(s) with the minimum number of steps.

If multiple paths are found that have the same, shortest length, the function will return all of them.

## Return Value

The function returns an array of paths. Each path is an array of step offsets. If no path is found, it returns an empty array.

### Example: Single Shortest Path

Given the following grid, a `source` at `[0, 3]`, and a `target` at `[4, 0]`:

```js
const grid = [
  [null, null, null, 1, null],
  [null, null, null, 'X', null],
  [null, null, null, null, null],
  [null, 'X', null, 'X', null],
  [0, null, null, null, null]
];

const p = paths([0, 3], [4, 0], grid);
```

The function will return:

```js
[
  [[0, -1], [1, -1], [1, -1], [1, 0]]
]
```
This path moves from `[0, 3]` to `[3, 0]`, a square orthogonally adjacent to the target.

### Example: Multiple Shortest Paths

Given a simple open grid, a `source` at `[0, 0]`, and a `target` at `[2, 2]`:

```js
const grid = [
  [1, null, null],
  [null, null, null],
  [null, null, 0],
];

const ps = paths([0, 0], [2, 2], grid);
```

The algorithm finds four equally short paths to the two squares adjacent to the target (`[1, 2]` and `[2, 1]`). The function will return:

```js
[
  [[1, 0], [1, 1]],
  [[1, 1], [1, 0]],
  [[0, 1], [1, 1]],
  [[1, 1], [0, 1]]
]
```