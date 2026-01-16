import _ from "./atomic_/core.js";

const WALL = "#";

export default function los(source, target, grid) {
  // 1. Same tile check
  if (source[0] === target[0] && source[1] === target[1]) {
    return true;
  }

  // 2. Get all 4 corners for source and target
  const sourceCorners = getCorners(source[0], source[1]);
  const targetCorners = getCorners(target[0], target[1]);

  // 3. Check all corner-to-corner combinations (16 total)
  for (let sc of sourceCorners) {
    for (let tc of targetCorners) {
      if (hasClearLine(sc, tc, grid, source, target)) {
        return true; // Early exit on first valid path
      }
    }
  }

  return false; // No valid path found
}

function getCorners(row, col) {
  return [
    [col, row],         // top-left: (c, r)
    [col + 1, row],     // top-right: (c+1, r)
    [col, row + 1],     // bottom-left: (c, r+1)
    [col + 1, row + 1]  // bottom-right: (c+1, r+1)
  ];
}

function hasClearLine(startPoint, endPoint, grid, source, target) {
  const tiles = getTilesAlongLine(startPoint, endPoint);

  for (let tile of tiles) {
    // Skip source and target tiles
    if ((tile[0] === source[0] && tile[1] === source[1]) ||
        (tile[0] === target[0] && tile[1] === target[1])) {
      continue;
    }

    // Check if tile blocks LOS
    if (isBlocking(tile, grid)) {
      return false;
    }
  }

  return true;
}

function getTilesAlongLine(p0, p1) {
  const [x0, y0] = p0;
  const [x1, y1] = p1;
  const dx = x1 - x0;
  const dy = y1 - y0;

  const tiles = new Set();

  // Use moderate precision line traversal
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 30;

  if (steps === 0) {
    return [];
  }

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;

    const tileRow = Math.floor(y);
    const tileCol = Math.floor(x);

    if (tileRow >= 0 && tileRow < 50 && tileCol >= 0 && tileCol < 50) {
      tiles.add(`${tileRow},${tileCol}`);

      // Carefully tuned corner detection
      const xInTile = x - tileCol;
      const yInTile = y - tileRow;
      const epsilon = 0.015; // Carefully chosen epsilon

      // Only add adjacent tiles when very close to boundaries
      if (xInTile < epsilon && tileCol > 0) {
        tiles.add(`${tileRow},${tileCol - 1}`);
      }
      if (xInTile > 1 - epsilon && tileCol < 49) {
        tiles.add(`${tileRow},${tileCol + 1}`);
      }
      if (yInTile < epsilon && tileRow > 0) {
        tiles.add(`${tileRow - 1},${tileCol}`);
      }
      if (yInTile > 1 - epsilon && tileRow < 49) {
        tiles.add(`${tileRow + 1},${tileCol}`);
      }
    }
  }

  return Array.from(tiles).map(key => {
    const [row, col] = key.split(',').map(Number);
    return [row, col];
  });
}

function isBlocking([row, col], grid) {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    return true;
  }

  const cell = grid[row][col];
  if (cell === WALL) {
    return true;
  }

  // Non-null, non-zero cells block LOS (monsters, but not hero)
  if (cell != null && cell !== 0) {
    return true;
  }

  return false;
}
