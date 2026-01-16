# Line of Sight Specification

## Overview

The game has a concept of line of sight (los).  I am working on my own algorithm and it is close to working but not quite.

The essence of it already exists in [the code](../ocd.js) in the `los` function. 

```js
export function los(source, target, dungeon){
  if (_.eq(source, target)) return [[0, 0]];
  const modified = blot([source, target], dungeon);
  const cleared = bulldoze(dungeon);
  const cost = _.chain(paths(source, target, cleared), cheapest, _.first, dist);
  return _.chain(paths(source, target, modified), _.filtera(function(path){
    return dist(path) <= cost;
  }, _), _.seq);
}
```

The `modified` instance of the dungeon removes the source and the target from the equation, allowing a complete path between the two.  The `cleared` instance removes everything: a totally hollow shell.  Zero obstacles.  It then uses the pathfinding (e.g., `path`), selects the cheapest routes.  The cost for diagonal moves is 3, orthogonal 2.  It, thus, takes the distance (e.g., `dist`) for one of the cheapest routes.  It uses that to select from the paths found in the dungeon with obstacles with a similarly cheap distance cost.  If it finds one (or more) it assumes line of sight. The `seq` function returns `null` if the set is empty since `null` can be used in truthy checks.

That logic is mostly sound.  There is one test, marked `kangaroo` which is not passing.  The test as it's coded is correct, but it's not passing.  That is the part we are working on.

I want you to create a separate function which takes the paths returned by `los` and further filters them.  In this instance the movement pattern returned is a hard hook: S, S, SE, SE.  It is just barely impermissible.

I am thinking that there is some math, some way of evaluating the paths being returned computationally, not notice said hooks (hard, not soft) and think better of them (they illustrate the lack of visibility) and thus exclude them.  I don't know if the algorithm has to evaluate the whole set of steps in a mathy way or if it has to evaluate change of direction over time, in light of what came before.  That's the job I'm giving you.

You are writing `weeded`. It is a function that takes the output of `los` and goes one extra step in filtering.  In this way, you can update [the test](../tests/los.js) by plugging `weeds` into them and determining if your work is sound. In theory, you will to this to all the prior tests as well, one at a time.  Start by writing `weeds` and using it on the one bad test, then plug it into the good tests and confirm they still pass.  You are not changing any of the tests themselves, except for this added layer.  You are also not changing `los`, only `weeds`.

```js
Deno.test("LOS - corner touching should be blocked", () => { //kangaroo
  _.chain(los([0, 0], [4, 2], [
    [H, v, v, v, v],
    [v, X, X, v, v],
    [v, X, v, v, v],
    [v, v, v, v, v],
    [v, v, 1, v, v]
  ]), weeds, _.not, assert);
});
````

To get firmer understanding, you may always read [the rules on los](../OCD_rules_ENG.pdf).
