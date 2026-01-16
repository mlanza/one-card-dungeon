import _ from "./atomic_/core.js";

const vacant = _.isNil;

const samePos = _.eq;

function key(pos) {
    return pos.join(',');
}

function unkey(k) {
    return k.split(',').map(Number);
}

function manhattan(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function add(pos, step) {
    return [pos[0] + step[0], pos[1] + step[1]];
}

const STEPS = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
];

function toOffsets(posPath) {
    const steps = [];
    for (let i = 0; i < posPath.length - 1; i++) {
        const a = posPath[i];
        const b = posPath[i + 1];
        steps.push([b[0] - a[0], b[1] - a[1]]);
    }
    return steps;
}

function inBounds([row, col], size = [5, 5]) {
  const [height, width] = size;
  return row > -1 && row < height && col > -1 && col < width;
}

export default function paths(source, target, grid) {
    const grid_size = [grid.length, grid.length ? grid[0].length : 0];

    // If target is not vacant, find paths to adjacent positions instead
    const actualTarget = vacant(_.getIn(grid, target)) ? target : null;
    const adjacentTargets = actualTarget === null ?
        STEPS.map(step => add(target, step)).filter(pos =>
            inBounds(pos, grid_size) && vacant(_.getIn(grid, pos))
        ) : [];

    function passable(pos) {
        if (!inBounds(pos, grid_size)) return false;
        if (samePos(pos, source)) return true;
        return vacant(_.getIn(grid, pos));
    }

    function diagonalIsLegit(from, step) {
        const isDiagonal = step[0] !== 0 && step[1] !== 0;
        if (!isDiagonal) return true;
        const [dr, dc] = step;
        const orthA = add(from, [dr, 0]);
        const orthB = add(from, [0, dc]);
        return passable(orthA) || passable(orthB);
    }

    function neighbors(pos) {
        const result = [];
        for (const step of STEPS) {
            const nextPos = add(pos, step);
            if (passable(nextPos) && diagonalIsLegit(pos, step)) {
                result.push(nextPos);
            }
        }
        return result;
    }

    const sourceKey = key(source);
    const dist = new Map([[sourceKey, 0]]);
    const parents = new Map([[sourceKey, []]]);
    const queue = [source];
    let qi = 0;

    let goals = [];
    let minGoalDist = Infinity;

    while (qi < queue.length) {
        const current = queue[qi++];
        const currentKey = key(current);
        const currentDist = dist.get(currentKey);

        if (minGoalDist !== Infinity && currentDist > minGoalDist) {
            continue;
        }

        // Check if we've reached a valid goal
        const isGoal = actualTarget !== null ? samePos(current, actualTarget) :
            adjacentTargets.some(adj => samePos(current, adj));

        if (isGoal) {
            if (currentDist < minGoalDist) {
                minGoalDist = currentDist;
                goals = [currentKey];
            } else if (currentDist === minGoalDist) {
                goals.push(currentKey);
            }
            continue;
        }

        for (const neighbor of neighbors(current)) {
            const neighborKey = key(neighbor);
            const newDist = currentDist + 1;

            if (!dist.has(neighborKey) || newDist < dist.get(neighborKey)) {
                dist.set(neighborKey, newDist);
                parents.set(neighborKey, [currentKey]);
                queue.push(neighbor);
            } else if (newDist === dist.get(neighborKey)) {
                parents.get(neighborKey).push(currentKey);
            }
        }
    }

    if (goals.length === 0) return [];

    const memo = new Map();
    function buildPaths(nodeKey) {
        if (memo.has(nodeKey)) return memo.get(nodeKey);
        if (nodeKey === sourceKey) return [[source]];

        const result = [];
        for (const pKey of parents.get(nodeKey) || []) {
            const parentPaths = buildPaths(pKey);
            for (const pPath of parentPaths) {
                result.push([...pPath, unkey(nodeKey)]);
            }
        }
        memo.set(nodeKey, result);
        return result;
    }

    const allPaths = [];
    for (const goalKey of goals) {
        allPaths.push(...buildPaths(goalKey));
    }

    const offsetPaths = new Set();
    for (const path of allPaths) {
        offsetPaths.add(JSON.stringify(toOffsets(path)));
    }

    return Array.from(offsetPaths).map(p => JSON.parse(p));
}