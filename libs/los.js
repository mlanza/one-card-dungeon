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
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 100;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    
    const tileRow = Math.floor(y);
    const tileCol = Math.floor(x);
    tiles.add(`${tileRow},${tileCol}`);
    
    // Edge grazing detection - check if line touches tile edges
    const xInTile = x - tileCol;
    const yInTile = y - tileRow;
    const epsilon = 0.001; // Small threshold for edge detection
    
    // Check if line touches any tile edge (conservative blocking)
    if (xInTile < epsilon || xInTile > 1 - epsilon || 
        yInTile < epsilon || yInTile > 1 - epsilon) {
      
      // If touching left edge and there's a tile to the left
      if (xInTile < epsilon && tileCol > 0) {
        tiles.add(`${tileRow},${tileCol - 1}`);
      }
      // If touching right edge and there's a tile to the right
      if (xInTile > 1 - epsilon) {
        tiles.add(`${tileRow},${tileCol + 1}`);
      }
      // If touching top edge and there's a tile above
      if (yInTile < epsilon && tileRow > 0) {
        tiles.add(`${tileRow - 1},${tileCol}`);
      }
      // If touching bottom edge and there's a tile below
      if (yInTile > 1 - epsilon) {
        tiles.add(`${tileRow + 1},${tileCol}`);
      }
      
      // Corner touching - include diagonal neighbors
      if (xInTile < epsilon && yInTile < epsilon && tileCol > 0 && tileRow > 0) {
        tiles.add(`${tileRow - 1},${tileCol - 1}`);
      }
      if (xInTile > 1 - epsilon && yInTile < epsilon && tileRow > 0) {
        tiles.add(`${tileRow - 1},${tileCol + 1}`);
      }
      if (xInTile < epsilon && yInTile > 1 - epsilon && tileCol > 0) {
        tiles.add(`${tileRow + 1},${tileCol - 1}`);
      }
      if (xInTile > 1 - epsilon && yInTile > 1 - epsilon) {
        tiles.add(`${tileRow + 1},${tileCol + 1}`);
      }
    }
  }
  
  // Convert Set back to array of [row, col] pairs
  return Array.from(tiles).map(key => {
    const [row, col] = key.split(',').map(Number);
    return [row, col];
  });
}

function isBlocking([row, col], grid) {
  // Check bounds
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    return true; // Out of bounds blocks LOS
  }
  
  const cell = grid[row][col];
  // Wall blocks LOS
  if (cell === WALL) {
    return true;
  }
  
  // Occupied tiles (non-null, non-WALL) block LOS
  if (cell != null && cell !== WALL) {
    return true;
  }
  
  return false;
}