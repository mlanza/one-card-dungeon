import {
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { paths } from "./pathfinding.js";

Deno.test("pathfinding - finds the shortest path to an adjacent square", () => {
  const grid = [
    [null, null, null, 1, null],
    [null, null, null, 'X', null],
    [null, null, null, null, null],
    [null, 'X', null, 'X', null],
    [0, null, null, null, null]
  ];
  const source = [0, 3];
  const target = [4, 0];

  const result = paths(source, target, grid);

  // Expected path of positions:
  // [0,3] -> [0,2] -> [1,1] -> [2,0] -> [3,0]
  // Which corresponds to steps:
  // [[0, -1], [1, -1], [1, -1], [1, 0]]
  // The path has 4 steps.

  // Let's verify other possible paths are longer.
  // Another path: [0,3]->[0,2]->[1,2]->[2,2]->[2,1]->[3,1](blocked) - no
  // Path through [2,1] -> [3,0] is shorter.
  // [0,3]->[0,2]->[1,2]->[2,2]->[2,1]->[2,0]->[3,0] is 6 steps.

  const expectedPaths = [
    [
      [0, -1],
      [1, -1],
      [1, -1],
      [1, 0],
    ],
  ];

  assertEquals(result.length, expectedPaths.length);
  assertEquals(result, expectedPaths);
});

Deno.test("pathfinding - handles multiple shortest paths", () => {
  const grid = [
    [1, null, null],
    [null, null, null],
    [null, null, 0],
  ];
  const source = [0, 0];
  const target = [2, 2];

  const result = paths(source, target, grid);

  const expected = [
    [ [1,1], [0,1] ], // [0,0]->[1,1]->[1,2]
    [ [0,1], [1,1] ], // [0,0]->[0,1]->[1,2]
    [ [1,1], [1,0] ], // [0,0]->[1,1]->[2,1]
    [ [1,0], [1,1] ]  // [0,0]->[1,0]->[2,1]
  ];
  
  // Sort outer and inner arrays to make comparison stable
  const sortFn = (a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b));
  result.sort(sortFn);
  expected.sort(sortFn);

  assertEquals(result, expected);
});

Deno.test("pathfinding - no path available", () => {
  const grid = [
    [1, 'X', null],
    ['X', 'X', null],
    [null, null, 0],
  ];
  const source = [0, 0];
  const target = [2, 2];
  const result = paths(source, target, grid);
  assertEquals(result, []);
});

Deno.test("pathfinding - path is blocked, finds alternative", () => {
    const grid = [
        [1, null, null, null],
        ['X', 'X', 'X', null],
        [null, null, null, null],
        [null, 0, 'X', 'X'],
    ];
    const source = [0, 0];
    const target = [3, 1];
    const result = paths(source, target, grid);

    // direct path is [1,1],[1,0],[1,0] to [3,1]... but [1,1] is blocked via corner cutting
    // and [1,0] is blocked. So must go around.
    // [0,0]->[0,1]->[0,2]->[0,3]->[1,3]->[2,3]->[2,2]->[2,1]
    const expected = [
        [
            [0, 1],
            [0, 1],
            [0, 1],
            [1, 0],
            [1, 0],
            [0, -1],
            [0, -1]
        ]
    ];
    assertEquals(result, expected);
});
