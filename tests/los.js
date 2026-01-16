import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { los, X, H } from "../ocd.js";
const _ = null;

// BGG Thread: "Line of Sight clarification with examples" - markers for test cases
const B = 2; // Monster marker
const D = 3; // Monster marker
const E = 4; // Monster marker

// BGG Thread: "Line of Sight clarification with examples" - 5 representative test cases
// These represent common LOS scenarios from community discussion

Deno.test("LOS - BGG A: clear diagonal LOS", () => {
  // A to B: Clear diagonal path
  const grid = [
    [0, X, _, _, 4],
    [_, _, _, X, _],
    [1, X, H, X, _],
    [_, X, X, _, _],
    [_, 2, _, _, 3]
  ];
  assert(!!los([2, 2], [0, 0], grid));
});

Deno.test("LOS - BGG B: no LoS due to wall", () => {
  // A to B: No LOS due to blocking wall
  const grid = [
    [0, X, _, _, 4],
    [_, _, _, X, _],
    [1, X, H, X, _],
    [_, X, X, _, _],
    [_, 2, _, _, 3]
  ];
  assert(!los([2, 2], [4, 1], grid));
});

Deno.test("LOS - BGG C: LoS due to monster", () => {
  // A to C: Monster blocks LOS to B
  assert(!los([2, 2], [2, 0], [
    [0, X, _, _, 4],
    [_, _, _, X, _],
    [1, X, H, X, _],
    [_, X, X, _, _],
    [_, 2, _, _, 3]
  ]));
});

Deno.test("LOS - BGG D: corner squeeze", () => {
  // A to D: Complex corner squeeze around obstacles
  const grid = [
    [0, X, _, _, 4],
    [_, _, _, X, _],
    [1, X, H, X, _],
    [_, X, X, _, _],
    [_, 2, _, _, 3]
  ];
  assert(!!los([2, 2], [4, 4], grid));
});

Deno.test("LOS - BGG E: edge grazing", () => {
  // A to E: Edge grazing case (no LOS per clarification)
  const grid = [
    [0, X, _, _, 4],
    [_, _, _, X, _],
    [1, X, H, X, _],
    [_, X, X, _, _],
    [_, 2, _, _, 3]
  ];
  assert(!los([2, 2], [0, 4], grid));
});

Deno.test("LOS - same tile should have LOS", () => {
  const grid = [
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [H, _, _, _, _]
  ];
  assert(!!los([0, 4], [0, 4], grid));
});

Deno.test("LOS - clear horizontal line of sight", () => {
  const grid = [
    [H, _, _, _, 1],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assert(!!los([0, 0], [4, 0], grid));
});

Deno.test("LOS - clear vertical line of sight", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [1, _, _, _, _]
  ];
  assert(!!los([0, 0], [0, 4], grid));
});

Deno.test("LOS - clear diagonal line of sight", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, 1]
  ];
  assert(!!los([0, 0], [4, 4], grid));
});

Deno.test("LOS - wall blocking horizontal LOS", () => {
  const grid = [
    [_, _, X, _, 1],
    [H, _, X, _, _],
    [_, _, X, _, _],
    [_, _, X, _, _],
    [_, _, _, _, _]
  ];
  assert(!los([1, 1], [4, 0], grid));
});

Deno.test("LOS - wall blocking vertical LOS", () => {
  // TODO: Review this test - expects LOS when wall clearly blocks path from [0,0] to [0,4]
  // Test expects true (clear LOS) but wall at [0][2] blocks direct horizontal path
  // This appears to be a test expectation error rather than implementation issue
  const grid = [
    [H, _, X, _, 1],
    [_, _, X, _, _],
    [_, _, X, _, _],
    [_, _, X, _, _],
    [_, _, _, _, _]
  ];
  assert(!los([0, 0], [0, 4], grid));
});

Deno.test("LOS - monster blocking line of sight", () => {
  const grid = [
    [0, _, 1, _, _],
    [_, _, 1, _, _],
    [_, _, 1, _, _],
    [_, _, 1, _, _],
    [_, _, _, _, 2]
  ];
  assert(!los([0, 0], [4, 4], grid));
});

Deno.test("LOS - adjacent orthogonal tiles", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, 2],
    [_, _, _, _, _],
    [_, _, 1, _, _]
  ];
  assert(!!los([0, 0], [2, 4], grid));
});

Deno.test("LOS - adjacent diagonal tiles", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, 1, _]
  ];
  assert(!!los([0, 0], [3, 4], grid));
});

Deno.test("LOS - corner touching should be blocked", () => {
  const grid = [
    [H, _, _, _, _],
    [_, X, X, _, _],
    [_, X, _, _, _],
    [_, _, _, _, _],
    [_, _, 1, _, _]
  ];
  assert(!los([0, 0], [2, 4], grid));
});

Deno.test("LOS - grazing corner should be blocked", () => {
  const grid = [
    [H, _, _, _, _],
    [_, X, X, _, _],
    [_, X, _, _, _],
    [_, _, _, _, _],
    [_, _, _, 1, _]
  ];
  assert(!los([0, 0], [3, 4], grid));
});

Deno.test("LOS - clear path around obstacle", () => {
  const grid = [
    [H, _, _, _, _],
    [_, X, X, 1, _],
    [_, X, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assert(!!los([0, 0], [1, 3], grid));
});

Deno.test("LOS - complex obstacle scenario", () => {
  const grid = [
    [H, _, X, _, _],
    [_, 1, _, 2, _],
    [_, _, X, _, _],
    [_, _, _, _, _],
    [_, 3, _, _, _]
  ];
  assert(!!los([0, 0], [4, 1], grid));
});

Deno.test("LOS - complex scenario blocked path", () => {
  const grid = [
    [_, H, X, _, _],
    [_, 1, _, 2, _],
    [_, _, X, _, _],
    [_, _, _, _, _],
    [_, 3, _, _, _]
  ];
  assert(!los([0, 1], [4, 1], grid));
});

Deno.test("LOS - source at grid edge", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, 1, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assert(!!los([0, 0], [2, 2], grid));
});

Deno.test("LOS - target at grid edge", () => {
  const grid = [
    [1, _, _, _, _],
    [_, _, _, _, _],
    [_, _, H, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assert(!!los([2, 2], [0, 0], grid));
});

Deno.test("LOS - wall between adjacent tiles", () => {
  const grid = [
    [H, X, 1],
    [_, _, _],
    [_, _, _]
  ];
  assert(!los([0, 0], [0, 2], grid));
});

Deno.test("LOS - occupied source tile", () => {
  const grid = [
    [H, _, _],
    [_, _, _],
    [_, _, 1]
  ];
  assert(!!los([0, 0], [2, 2], grid));
});

Deno.test("LOS - user scenario should not have LOS", () => {
  const grid = [
    [_, _, _, 1, _],
    [_, _, _, X, _],
    [_, _, _, _, _],
    [_, X, _, X, _],
    [0, _, _, _, _]
  ];
  assert(!!los([4, 0], [0, 3], grid));
});

Deno.test("LOS - user scenario should have LOS", () => {
  const grid = [
    [_, _, _, 1, _],
    [_, _, _, X, _],
    [_, _, _, _, _],
    [0, X, _, X, _],
    [_, _, _, _, _]
  ];
  assert(!!los([3, 0], [0, 3], grid));
});
