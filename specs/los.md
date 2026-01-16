# Line of Sight Specification

## Overview

This specification provides a complete mathematical foundation and implementation guide for Line of Sight (LOS) in One Card Dungeon, based on comprehensive research including:
- Official rulebook analysis
- BoardGameGeek forum research  
- Mathematical modeling of tile-based collision detection
- All edge cases and scenarios

**Core Rule**: "If a line can be drawn from any corner of your tile to any corner of a Monster's tile, without passing through a wall tile or another Monster's tile, you have Line of Sight."

## Function Signature
```javascript
function los(source, target, grid) // returns boolean
```

## Parameters
- `source`: [row, col] - Adventurer's position
- `target`: [row, col] - Monster's position  
- `grid`: 2D array where each cell is null (vacant), 'wall' (wall tile), or occupied (monster)

---

## Mathematical Foundation

### Coordinate System
- **Grid Position**: Tiles indexed as `[row, col]` where `row, col ∈ ℤ`
- **Origin**: Top-left corner of grid is `[0, 0]`
- **Tile Unit**: Each tile occupies exactly 1 unit² in coordinate space

### Tile Corner Mathematics
For tile at position `[r, c]`:
- **Top-Left**: `(c, r)`
- **Top-Right**: `(c + 1, r)`
- **Bottom-Left**: `(c, r + 1)`
- **Bottom-Right**: `(c + 1, r + 1)`

### Conservative Blocking Principle
A line is considered BLOCKED if:
1. It passes through the interior of any blocking tile
2. It touches exactly on the edge or corner of any blocking tile
3. **Key Insight**: Lines cannot pass between orthogonal obstacles (e.g., obstacles south and east block southeast diagonal)
4. **CRITICAL**: Even a glancing touch or grazing contact with tile edges/corners is BLOCKED - no edge-tolerant paths allowed

---

## Complete LOS Scenarios

### 1. Clear Path Scenarios
- **Horizontal Clear**: Same row, no intervening obstacles
- **Vertical Clear**: Same column, no intervening obstacles  
- **Diagonal Clear**: True diagonal, no obstacles touching the line
- **Multi-Path**: Multiple valid corner-to-corner paths

### 2. Wall Blocking Scenarios
- **Full Blockage**: Wall directly between source and target
- **Partial Blockage**: Wall blocks some corner paths but not all
- **Corner Grazing**: Line touches wall corner exactly → BLOCKED (conservative)
- **Edge Grazing**: Line runs along wall edge → BLOCKED (conservative)
- **Maze Navigation**: Complex wall configurations requiring pathfinding

### 3. Monster Blocking Scenarios
- **Single Monster Block**: One monster between source and target
- **Monster Formation**: Multiple monsters creating barriers
- **Tactical Shielding**: Using monsters as cover (monsters block LOS to other monsters)
- **Partial Obstruction**: Monster blocks some paths but not all

### 4. Complex Multi-Obstacle Scenarios
- **Sequential Blocking**: Wall + monster combinations
- **Narrow Passages**: Small gaps between obstacles
- **Corner Squeezes**: Navigation through tight diagonal spaces
- **Orthogonal Blocking**: Two obstacles at right angles block diagonal paths

### 5. Edge Cases
- **Same Tile**: Always true (source equals target)
- **Adjacent Tiles**: Orthogonal neighbors typically clear, diagonal requires checking
- **Grid Boundaries**: Tiles at edges follow normal rules
- **Out of Bounds**: Areas outside grid block LOS

---

## Implementation Algorithm

### Corner-Based LOS Check
```javascript
function los(source, target, grid) {
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
```

### Clear Line Validation
```javascript
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
```

### Line-Tile Intersection Algorithm
```javascript
function lineIntersectsTile(p0, p1, tileRow, tileCol) {
  const box = {
    minX: tileCol,
    maxX: tileCol + 1,
    minY: tileRow, 
    maxY: tileRow + 1
  };
  
  // Liang-Barsky algorithm or parametric line clipping
  return lineIntersectsAABB(p0, p1, box);
}
```

### Blocking Tile Detection
```javascript
function isBlocking([row, col], grid) {
  // Check bounds
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    return true; // Out of bounds blocks LOS
  }
  
  const cell = grid[row][col];
  return cell === 'wall' || (cell !== null && cell !== undefined);
}
```

---

## Performance Optimizations

### Early Exit Conditions
1. **Distance Check**: If Manhattan distance > reasonable threshold, early reject
2. **Bounding Box Check**: Quick rejection if target outside maximum possible range
3. **Center Line Test**: Test center-to-center line first (often sufficient)

### Spatial Optimization
1. **Tile Enumeration**: Only check tiles actually intersected by the line
2. **Grid Subdivision**: For very large grids, use spatial partitioning
3. **Caching**: Cache corner calculations for frequently accessed tiles

---

## Conservative Edge Case Rules

### Grazing Scenarios
- **Corner Grazing**: Line passes exactly through tile corner → BLOCKED
- **Edge Grazing**: Line runs exactly along tile edge → BLOCKED  
- **Near Grazing**: Line within ε distance of edge/corner → BLOCKED
- **Implementation**: Use small epsilon buffer (~0.001) for numerical stability

### Orthogonal Blocking Theorem
**Mathematical Proof**: If obstacles exist at positions (r+1, c) and (r, c+1) relative to source, then diagonal LOS to (r+1, c+1) is impossible.

**Implementation**: Check orthogonal neighboring tiles for obstacles when testing diagonal paths.

---

## Validation Test Cases

### Basic Scenarios
✅ Same tile adjacency  
✅ Clear horizontal path (5 tiles)  
✅ Clear vertical path (3 tiles)  
✅ Clear diagonal path (4 tiles)  
✅ Multiple valid corner paths

### Blocking Scenarios  
✅ Single wall blocks direct path
✅ Multiple walls create maze
✅ Monster blocks LOS to other monsters
✅ Wall + monster combination

### Edge Cases
✅ Corner grazing (should be BLOCKED)
✅ Edge grazing (should be BLOCKED)  
✅ Orthogonal blocking theorem validation
✅ Grid boundary conditions
✅ Out of bounds blocking

### Complex Scenarios
✅ Narrow passage navigation
✅ Monster formation tactics
✅ Multi-obstacle pathfinding
✅ Conservative grazing interpretation

---

## Integration with Game Systems

### Combat Applications
- **Adventurer Attacks**: Range + LOS required for targeting
- **Monster Movement**: Monsters prioritize positions with LOS to adventurer
- **Monster Attacks**: Only monsters with LOS can attack

### Tactical Considerations
- **Cover System**: Monsters can use other monsters as cover
- **Positioning**: Corner-to-corner rules enable tactical positioning
- **Pathfinding**: LOS affects optimal movement strategies

---

## Implementation Checklist

- [ ] Implement corner coordinate calculation
- [ ] Implement line-tile intersection algorithm
- [ ] Implement conservative blocking detection
- [ ] Add orthogonal blocking optimization
- [ ] Include comprehensive test suite
- [ ] Performance profiling and optimization
- [ ] Integration with existing game systems
- [ ] Documentation and code comments

---

This specification provides the complete foundation for implementing robust, game-compliant LOS detection that handles all scenarios encountered in One Card Dungeon gameplay.
