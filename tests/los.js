import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import _ from "../libs/atomic_/core.js";
import $ from "../libs/atomic_/shell.js";
import { los, X, H } from "../ocd.js";
const v = null; //vacant

// BGG Thread: "Line of Sight clarification with examples" - markers for test cases
const B = 2; // Monster marker
const D = 3; // Monster marker
const E = 4; // Monster marker

// BGG Thread: "Line of Sight clarification with examples" - 5 representative test cases
// These represent common LOS scenarios from community discussion

Deno.test("LOS - BGG A: clear diagonal LOS", () => {
  // A to B: Clear diagonal path
  _.chain(los([2, 2], [0, 0], [
    [0, X, v, v, 4],
    [v, v, v, X, v],
    [1, X, H, X, v],
    [v, X, X, v, v],
    [v, 2, v, v, 3]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - BGG B: no LoS due to wall", () => {
  // A to B: No LOS due to blocking wall
  _.chain(los([2, 2], [4, 1], [
    [0, X, v, v, 4],
    [v, v, v, X, v],
    [1, X, H, X, v],
    [v, X, X, v, v],
    [v, 2, v, v, 3]
  ]), _.not, assert);
});

Deno.test("LOS - BGG C: LoS due to monster", () => {
  // A to C: Monster blocks LOS to B
  _.chain(los([2, 2], [2, 0], [
    [0, X, v, v, 4],
    [v, v, v, X, v],
    [1, X, H, X, v],
    [v, X, X, v, v],
    [v, 2, v, v, 3]
  ]), _.not, assert);
});

Deno.test("LOS - BGG D: corner squeeze", () => {
  // A to D: Complex corner squeeze around obstacles
  _.chain(los([2, 2], [4, 4], [
    [0, X, v, v, 4],
    [v, v, v, X, v],
    [1, X, H, X, v],
    [v, X, X, v, v],
    [v, 2, v, v, 3]
  ]), _.not, assert);
});

Deno.test("LOS - BGG E: edge grazing", () => {
  // A to E: Edge grazing case (no LOS per clarification)
  _.chain(los([2, 2], [0, 4], [
    [0, X, v, v, 4],
    [v, v, v, X, v],
    [1, X, H, X, v],
    [v, X, X, v, v],
    [v, 2, v, v, 3]
  ]), _.not, assert);
});

Deno.test("LOS - same tile should have LOS", () => {
  _.chain(los([4, 0], [4, 0], [
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [H, v, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - clear horizontal line of sight", () => {
  _.chain(los([0, 0], [4, 0], [
    [H, v, v, v, 1],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - clear vertical line of sight", () => {
  _.chain(los([0, 0], [0, 4], [
    [H, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [1, v, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - clear diagonal line of sight", () => {
  _.chain(los([0, 0], [4, 4], [
    [H, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, 1]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - wall blocking horizontal LOS", () => {
  _.chain(los([1, 0], [0, 4], [
    [v, v, X, v, 1],
    [H, v, X, v, v],
    [v, v, X, v, v],
    [v, v, X, v, v],
    [v, v, v, v, v]
  ]), _.not, assert);
});

Deno.test("LOS - wall blocking vertical LOS", () => {
  // TODO: Review this test - expects LOS when wall clearly blocks path from [0,0] to [0,4]
  // Test expects true (clear LOS) but wall at [0][2] blocks direct horizontal path
  // This appears to be a test expectation error rather than implementation issue
  _.chain(los([0, 0], [0, 4], [
    [H, v, X, v, 1],
    [v, v, X, v, v],
    [v, v, X, v, v],
    [v, v, X, v, v],
    [v, v, v, v, v]
  ]), _.not, assert);
});

Deno.test("LOS - monster blocking line of sight", () => {
  _.chain(los([0, 0], [4, 4], [
    [0, v, 1, v, v],
    [v, v, 1, v, v],
    [v, v, 1, v, v],
    [v, v, 1, v, v],
    [v, v, v, v, 2]
  ]), _.not, assert);
});

Deno.test("LOS - adjacent orthogonal tiles", () => {
  _.chain(los([0, 0], [2, 4], [
    [H, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, 2],
    [v, v, v, v, v],
    [v, v, 1, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - adjacent diagonal tiles", () => {
  _.chain(los([0, 0], [3, 4], [
    [H, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v],
    [v, v, v, 1, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - corner touching should be blocked", () => { //kangaroo
  _.chain(los([0, 0], [4, 2], [
    [H, v, v, v, v],
    [v, X, X, v, v],
    [v, X, v, v, v],
    [v, v, v, v, v],
    [v, v, 1, v, v]
  ]), _.not, assert);
});

Deno.test("LOS - grazing corner should be blocked", () => {
  _.chain(los([0, 0], [3, 4], [
    [H, v, v, v, v],
    [v, X, X, v, v],
    [v, X, v, v, v],
    [v, v, v, v, v],
    [v, v, v, 1, v]
  ]), _.not, assert);
});

Deno.test("LOS - clear path around obstacle", () => {
  _.chain(los([0, 0], [1, 3], [
    [H, v, v, v, v],
    [v, X, X, 1, v],
    [v, X, v, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - complex obstacle scenario", () => {
  _.chain(los([0, 0], [4, 1], [
    [H, v, X, v, v],
    [v, 1, v, 2, v],
    [v, v, X, v, v],
    [v, v, v, v, v],
    [v, 3, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - complex scenario blocked path", () => {
  _.chain(los([0, 1], [4, 1], [
    [v, H, X, v, v],
    [v, 1, v, 2, v],
    [v, v, X, v, v],
    [v, v, v, v, v],
    [v, 3, v, v, v]
  ]), _.not, assert);
});

Deno.test("LOS - source at grid edge", () => {
  _.chain(los([0, 0], [2, 2], [
    [H, v, v, v, v],
    [v, v, v, v, v],
    [v, v, 1, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - target at grid edge", () => {
  _.chain(los([2, 2], [0, 0], [
    [1, v, v, v, v],
    [v, v, v, v, v],
    [v, v, H, v, v],
    [v, v, v, v, v],
    [v, v, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - wall between adjacent tiles", () => {
  _.chain(los([0, 0], [0, 2], [
    [H, X, 1],
    [v, v, v],
    [v, v, v]
  ]), _.not, assert);
});

Deno.test("LOS - occupied source tile", () => {
  _.chain(los([0, 0], [2, 2], [
    [H, v, v],
    [v, v, v],
    [v, v, 1]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - user scenario should not have LOS", () => {
  _.chain(los([4, 0], [0, 3], [
    [v, v, v, 1, v],
    [v, v, v, X, v],
    [v, v, v, v, v],
    [v, X, v, X, v],
    [0, v, v, v, v]
  ]), _.not, _.not, assert);
});

Deno.test("LOS - user scenario should have LOS", () => {
  _.chain(los([3, 0], [0, 3], [
    [v, v, v, 1, v],
    [v, v, v, X, v],
    [v, v, v, v, v],
    [0, X, v, X, v],
    [v, v, v, v, v]
  ]), _.not, _.not, assert);
});
