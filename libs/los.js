import _ from "./atomic_/core.js";

const WALL = "#";

export default function los(source, target, grid) {
  // Same tile - always have LOS
  if (source[0] === target[0] && source[1] === target[1]) {
    return true;
  }
  
  // Get all 4 corners for source and target tiles
  const sourceCorners = getCorners(source[0], source[1]);
  const targetCorners = getCorners(target[0], target[1]);
  
  // Check all corner-to-corner combinations
  for (let i = 0; i < sourceCorners.length; i++) {
    for (let j = 0; j < targetCorners.length; j++) {
      const sc = sourceCorners[i];
      const tc = targetCorners[j];
      // Skip corners that are outside the grid bounds
      if (sc[0] < 0 || sc[1] < 0 || sc[0] > grid[0].length || sc[1] > grid.length ||
          tc[0] < 0 || tc[1] < 0 || tc[0] > grid[0].length || tc[1] > grid.length) {
        continue;
      }
      if (hasClearLine(sc, tc, grid, source, target)) {
        return true;
      }
    }
  }
  
  return false;
}

function getCorners(row, col) {
  // Return 4 corners of the tile: [x, y] coordinates
  // x = column, y = row, each tile is 1x1 unit
  return [
    [col, row],           // top-left
    [col + 1, row],       // top-right
    [col, row + 1],       // bottom-left
    [col + 1, row + 1]    // bottom-right
  ];
}

function hasClearLine(start, end, grid, source, target) {
  // Conservative approach: check if line passes through OR touches blocking tiles
  const [x0, y0] = start;
  const [x1, y1] = end;
  
  // Use a fine-grained step to check all points along the line
  const steps = 200;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    
    // Check all nearby tiles for edge/corner touching
    const nearbyTiles = getNearbyTiles(x, y, grid);
    
    for (const [row, col] of nearbyTiles) {
      // Skip source and target tiles
      if (!((row === source[0] && col === source[1]) || 
            (row === target[0] && col === target[1]))) {
        
        // Check if this tile blocks LOS
        if (isBlocking(row, col, grid)) {
          // Check if line touches this tile (edge or corner)
          if (lineTouchesTile(x0, y0, x1, y1, row, col)) {
            return false;
          }
        }
      }
    }
  }
  
  return true;
}

function getNearbyTiles(x, y, grid) {
  // Get all tiles that could be touched by a point at (x, y)
  const tiles = [];
  const centerCol = Math.floor(x);
  const centerRow = Math.floor(y);
  
  // Add the center tile and adjacent tiles, but stay within grid bounds
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const row = centerRow + dr;
      const col = centerCol + dc;
      // Only add tiles that are within grid bounds
      if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
        tiles.push([row, col]);
      }
    }
  }
  
  return tiles;
}

function lineTouchesTile(x0, y0, x1, y1, tileRow, tileCol) {
  // Check if line segment touches tile rectangle
  const tileLeft = tileCol;
  const tileRight = tileCol + 1;
  const tileTop = tileRow;
  const tileBottom = tileRow + 1;
  
  // Check if either endpoint is inside tile
  if ((x0 >= tileLeft && x0 <= tileRight && y0 >= tileTop && y0 <= tileBottom) ||
      (x1 >= tileLeft && x1 <= tileRight && y1 >= tileTop && y1 <= tileBottom)) {
    return true;
  }
  
  // Check if line intersects any edge of tile (including corners)
  return lineIntersectsLine(x0, y0, x1, y1, tileLeft, tileTop, tileRight, tileTop) ||  // Top
         lineIntersectsLine(x0, y0, x1, y1, tileLeft, tileBottom, tileRight, tileBottom) ||  // Bottom
         lineIntersectsLine(x0, y0, x1, y1, tileLeft, tileTop, tileLeft, tileBottom) ||  // Left
         lineIntersectsLine(x0, y0, x1, y1, tileRight, tileTop, tileRight, tileBottom);  // Right
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if two line segments intersect
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 0.0001) {
    // Lines are parallel - check if they're collinear and overlapping
    // Check if endpoints lie on the other line
    if (pointOnLine(x1, y1, x3, y3, x4, y4) || pointOnLine(x2, y2, x3, y3, x4, y4) ||
        pointOnLine(x3, y3, x1, y1, x2, y2) || pointOnLine(x4, y4, x1, y1, x2, y2)) {
      return true; // Lines are collinear and overlapping
    }
    return false;
  }
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function pointOnLine(px, py, x1, y1, x2, y2) {
  // Check if point (px, py) lies on line segment from (x1, y1) to (x2, y2)
  const cross = (px - x1) * (y2 - y1) - (py - y1) * (x2 - x1);
  if (Math.abs(cross) > 0.0001) return false;
  
  const dot = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
  if (dot < 0) return false;
  
  const squaredLength = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  return dot <= squaredLength;
}

function isBlocking(row, col, grid) {
  // Check if position is out of bounds
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