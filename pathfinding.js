import _ from "./libs/atomic_/core.js";

const vacant = (contents) => contents == null;
const inBounds = (pos, grid) => {
    const [r, c] = pos;
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;
    return r >= 0 && r < rows && c >= 0 && c < cols;
};
const cell = (pos, grid) => _.getIn(grid, pos);
const samePos = (a, b) => a[0] === b[0] && a[1] === b[1];
const key = (pos) => pos.join(',');
const unkey = (k) => k.split(',').map(Number);
const manhattan = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const add = (pos, step) => [pos[0] + step[0], pos[1] + step[1]];
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

export function paths(source, target, grid) {

    function passable(pos) {
        if (!inBounds(pos, grid)) return false;
        if (samePos(pos, source)) return true;
        if (samePos(pos, target)) return false; // Cannot move into target's square
        return vacant(cell(pos, grid));
    }

    function diagonalIsLegit(from, step) {
        const isDiagonal = step[0] !== 0 && step[1] !== 0;
        if (!isDiagonal) return true;
        const [dr, dc] = step;
        const orthA = add(from, [dr, 0]);
        const orthB = add(from, [0, dc]);
        return passable(orthA) && passable(orthB);
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

    // --- Uniform Cost Search (BFS since all step costs are 1) to find all shortest paths ---
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

        if (manhattan(current, target) === 1) {
            if (currentDist < minGoalDist) {
                minGoalDist = currentDist;
                goals = [currentKey];
            } else if (currentDist === minGoalDist) {
                goals.push(currentKey);
            }
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

    // --- Reconstruct all shortest paths to the goal(s) ---
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

export default paths;
