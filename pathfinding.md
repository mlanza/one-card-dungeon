I want you to write a JS pathfinding function for me.  It may use recursive parts if that helps keep it simple.

```js
const grid = [
  [null, null, null, 1, null],
  [null, null, null, 'X', null],
  [null, null, null, null, null],
  [null, 'X', null, 'X', null],
  [0, null, null, null, null]];

function paths(source, target, grid){
    const [row, col] = source;
    const [rows...] = grid;
    //..
    return [path1, path2, ...];
}

function vacant(contents){
  return contents == null;
}

const ps = paths([0, 3], [4, 0], grid); // a 1 and a 0 at these locations, 'X' unpassable
```

I will give it a grid (in this instance a 5x5 array, but the algorithm ought work with any size) whose cells will be either null or not. I will identify two actors in the system--the source and the target--by their coordinates, always [row, col].  This function will return one or more paths each of which is an array of steps, where each step is an offset ([r, c]) beginning from the source and ending as close to orthogonally adjacent to the target as possible.  An offset always has 2 parts, with some combination of 0, 1, -1 values. Those are the only legitimate values.

Diagonal moves can be legitimate.  To determine apply this rule: a diagnonal is legitimate if the same spot is also reachable via 2 orthogonal, unblocked moves.  A cell whose contents are not `vacant` is considered blocked.  One diagonal move is more efficient that 2 orthogonal moves to the same spot for efficiency purposes.

Assume the existence of a _.getIn function which can pull the contents of a cell out of the grid like so: `_.getIn(grid, [row, col])`.

The algorithm returns the most efficient path or, if several are equally efficient, multiple.

I prefer you create helper function to make the individual validations more evident.

---

I asked for this from a different agent and got [this](./pathfinding.js).  And the path it returned when I ran it was what follows.

```js
const result = [[0, -1], [1, -1], [1, -1], [1, 0]];
````

It does not look legitimate to my eyes.  I would've expected motion to be down and to the left and this is not that.
