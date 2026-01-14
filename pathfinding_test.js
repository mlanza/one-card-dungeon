import {
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { paths } from "./ocd.js";

Deno.test("pathfinding - finds the shortest path to a target square", () => {
  const grid = [
    [null, null, null, 1, null],
    [null, null, null, 'X', null],
    [null, null, null, null, null],
    [null, 'X', null, 'X', null],
    [null, null, null, null, null]
  ];
  const source = [0, 3];
  const target = [4, 0];
  const result = paths(source, target, grid);
  const expectedPaths = [
    [
      [1, -1],
      [1, -1],
      [1, -1],
      [1, 0]
    ],
  ];
  assertEquals(result.length, expectedPaths.length);
  assertEquals(result, expectedPaths);
});

Deno.test("pathfinding - handles multiple shortest paths", () => {
  const grid = [
    [1, null, null],
    [null, null, null],
    [null, null, null],
  ];
  const source = [0, 0];
  const target = [2, 2];
  const result = paths(source, target, grid);
  const expected = [
    [ [1,1], [1,1] ]
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
        [null, null, 'X', 'X'],
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
            [1, -1]
        ]
    ];
    assertEquals(result, expected);
});

Deno.test("pathfinding - user scenario with diagonal choice", () => {
    const grid = [[null, null, 9], ["X", null, "X"], [null, null, null]];
    const source = [0, 2];
    const target = [2, 0];
    const result = paths(source, target, grid);
    const expected = [
        [[1, -1], [1, -1]]
    ];
    
    assertEquals(result, expected);
});

Deno.test("pathfinding - target is occupied, stops one move short", () => {
    const grid = [
        [null, null, null, 1, null],
        [null, null, null, 'X', null],
        [null, null, null, null, 9], // target occupied by 9
        [null, 'X', null, 'X', null],
        [null, null, null, null, null]
    ];
    const source = [0, 3];
    const target = [2, 4];
    const result = paths(source, target, grid);
    // Should stop at [1, 4] which is adjacent to the occupied target
    const expectedPaths = [
        [
            [1, 1]
        ]
    ];
    assertEquals(result.length, expectedPaths.length);
    assertEquals(result, expectedPaths);
});

Deno.test("pathfinding - target is vacant, reaches target", () => {
    const grid = [
        [null, null, null, 1, null],
        [null, null, null, 'X', null],
        [null, null, null, null, null], // target is vacant
        [null, 'X', null, 'X', null],
        [null, null, null, null, null]
    ];
    const source = [0, 3];
    const target = [2, 4];
    const result = paths(source, target, grid);
    // Should reach the target since it's vacant
    const expectedPaths = [
        [
            [1, 1],
            [1, 0]
        ]
    ];
    assertEquals(result.length, expectedPaths.length);
    assertEquals(result, expectedPaths);
});
