import {
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { los, X, H } from "../ocd.js";
const _ = null;

Deno.test("LOS - same tile should have LOS", () => {
  const grid = [
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [H, _, _, _, _]
  ];
  assertEquals(los([0, 4], [0, 4], grid), true);
});

Deno.test("LOS - clear horizontal line of sight", () => {
  const grid = [
    [H, _, _, _, 1],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assertEquals(los([0, 0], [4, 0], grid), true);
});

Deno.test("LOS - clear vertical line of sight", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [1, _, _, _, _]
  ];
  assertEquals(los([0, 0], [0, 4], grid), true);
});

Deno.test("LOS - clear diagonal line of sight", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, 1]
  ];
  assertEquals(los([0, 0], [4, 4], grid), true);
});

Deno.test("LOS - wall blocking horizontal LOS", () => {
  const grid = [
    [_, _, X, _, 1],
    [H, _, X, _, _],
    [_, _, X, _, _],
    [_, _, X, _, _],
    [_, _, _, _, _]
  ];
  assertEquals(los([1, 1], [4, 0], grid), false);
});

Deno.test("LOS - wall blocking vertical LOS", () => {
  const grid = [
    [H, _, X, _, _],
    [_, _, X, _, _],
    [_, _, X, _, _],
    [_, _, X, _, _],
    [1, _, _, _, _]
  ];
  assertEquals(los([0, 0], [0, 4], grid), true);
});

Deno.test("LOS - monster blocking line of sight", () => {
  const grid = [
    [0, _, 1, _, _],
    [_, _, 1, _, _],
    [_, _, 1, _, _],
    [_, _, 1, _, _],
    [_, _, _, _, 2]
  ];
  assertEquals(los([0, 0], [4, 4], grid), false);
});

Deno.test("LOS - adjacent orthogonal tiles", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, 2],
    [_, _, _, _, _],
    [_, _, 1, _, _]
  ];
  assertEquals(los([0, 0], [2, 4], grid), true);
});

Deno.test("LOS - adjacent diagonal tiles", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, 1, _]
  ];
  assertEquals(los([0, 0], [3, 4], grid), true);
});

Deno.test("LOS - corner touching should be blocked", () => {
  const grid = [
    [H, _, _, _, _],
    [_, X, X, _, _],
    [_, X, _, _, _],
    [_, _, _, _, _],
    [_, _, 1, _, _]
  ];
  assertEquals(los([0, 0], [2, 4], grid), false);
});

Deno.test("LOS - grazing corner should be blocked", () => {
  const grid = [
    [H, _, _, _, _],
    [_, X, X, _, _],
    [_, X, _, _, _],
    [_, _, _, _, _],
    [_, _, _, 1, _]
  ];
  assertEquals(los([0, 0], [3, 4], grid), false);
});

Deno.test("LOS - clear path around obstacle", () => {
  const grid = [
    [H, _, _, _, _],
    [_, X, X, 1, _],
    [_, X, _, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assertEquals(los([0, 0], [1, 3], grid), true);
});

Deno.test("LOS - complex obstacle scenario", () => {
  const grid = [
    [H, _, X, _, _],
    [_, 1, _, 2, _],
    [_, _, X, _, _],
    [_, _, _, _, _],
    [_, 3, _, _, _]
  ];
  assertEquals(los([0, 0], [4, 1], grid), true);
});

Deno.test("LOS - complex scenario blocked path", () => {
  const grid = [
    [_, H, X, _, _],
    [_, 1, _, 2, _],
    [_, _, X, _, _],
    [_, _, _, _, _],
    [_, 3, _, _, _]
  ];
  assertEquals(los([0, 1], [4, 1], grid), false);
});

Deno.test("LOS - source at grid edge", () => {
  const grid = [
    [H, _, _, _, _],
    [_, _, _, _, _],
    [_, _, 1, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assertEquals(los([0, 0], [2, 2], grid), true);
});

Deno.test("LOS - target at grid edge", () => {
  const grid = [
    [1, _, _, _, _],
    [_, _, _, _, _],
    [_, _, H, _, _],
    [_, _, _, _, _],
    [_, _, _, _, _]
  ];
  assertEquals(los([2, 2], [0, 0], grid), true);
});

Deno.test("LOS - wall between adjacent tiles", () => {
  const grid = [
    [H, X, 1],
    [_, _, _],
    [_, _, _]
  ];
  assertEquals(los([0, 0], [0, 2], grid), false);
});

Deno.test("LOS - occupied source tile", () => {
  const grid = [
    [H, _, _],
    [_, _, _],
    [_, _, 1]
  ];
  assertEquals(los([0, 0], [2, 2], grid), true);
});

Deno.test("LOS - user scenario should not have LOS", () => {
  const grid = [
    [_, _, _, 1, _],
    [_, _, _, X, _],
    [_, _, _, _, _],
    [_, X, _, X, _],
    [0, _, _, _, _]
  ];
  assertEquals(los([4, 0], [0, 3], grid), true);
});

Deno.test("LOS - user scenario should have LOS", () => {
  const grid = [
    [_, _, _, 1, _],
    [_, _, _, X, _],
    [_, _, _, _, _],
    [0, X, _, X, _],
    [_, _, _, _, _]
  ];
  assertEquals(los([3, 0], [0, 3], grid), true);
});
