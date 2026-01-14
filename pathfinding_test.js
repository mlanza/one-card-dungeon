import {
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { paths } from "./ocd.js";

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
  const expectedPaths = [
    [
      [1, -1],
      [1, -1],
      [1, -1],
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
    [ [1,1], [0,1] ],
    [ [0,1], [1,1] ],
    [ [1,1], [1,0] ],
    [ [1,0], [1,1] ]
  ];
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
    const expected = [
        [
            [0, 1],
            [0, 1],
            [1, 1],
            [1, -1],
            [0, -1]
        ]
    ];
    assertEquals(result, expected);
});

Deno.test("pathfinding - user scenario with diagonal choice", () => {
    const grid = [[null, null, 9], ["X", null, "X"], [1, null, null]];
    const source = [0, 2];
    const target = [2, 0];
    const result = paths(source, target, grid);
    const expected = [
        [[1, -1], [1, 0]]
    ];
    
    assertEquals(result, expected);
});
