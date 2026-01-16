# One Card Dungeon - Comprehensive Line of Sight Technical Specification

## Executive Summary

This document provides a complete mathematical foundation and algorithmic specification for implementing Line of Sight (LOS) in One Card Dungeon. It covers all possible scenarios, edge cases, and provides implementable algorithms based on the official rule: "If a line can be drawn from any corner of your tile to any corner of a Monster's tile, without passing through a wall tile or another Monster's tile, you have Line of Sight."

## Table of Contents
1. [Mathematical Foundation](#mathematical-foundation)
2. [Complete LOS Scenarios](#complete-los-scenarios)
3. [Collision Detection Algorithms](#collision-detection-algorithms)
4. [Implementation Specification](#implementation-specification)
5. [Edge Cases and Validation](#edge-cases-and-validation)
6. [Performance Considerations](#performance-considerations)

---

## Mathematical Foundation

### Coordinate System

#### Grid Coordinate System
- **Grid Position**: Tiles are indexed as `[row, col]` where `row, col ∈ ℤ`
- **Origin**: Top-left corner of grid is `[0, 0]`
- **Tile Unit**: Each tile occupies exactly 1 unit² in coordinate space

#### Mathematical Tile Representation
For tile at position `[r, c]`:
- **Top-Left Corner**: `(c, r)`
- **Top-Right Corner**: `(c + 1, r)`
- **Bottom-Left Corner**: `(c, r + 1)`
- **Bottom-Right Corner**: `(c + 1, r + 1)`
- **Center Point**: `(c + 0.5, r + 0.5)`

#### Corner Set Definition
For tile at `[r, c]`, the set of corners `C(r, c)` is:
```
C(r, c) = {
  (c, r),     // Top-Left
  (c + 1, r), // Top-Right
  (c, r + 1), // Bottom-Left
  (c + 1, r + 1) // Bottom-Right
}
```

### Line Mathematics

#### Parametric Line Equation
For points `P₀ = (x₀, y₀)` and `P₁ = (x₁, y₁)`:
```
L(t) = P₀ + t(P₁ - P₀), where t ∈ [0, 1]
L(t) = (x₀ + t·dx, y₀ + t·dy), where dx = x₁ - x₀, dy = y₁ - y₀
```

#### Line-AABB Intersection Algorithm
For line segment from `P₀` to `P₁` and axis-aligned bounding box `[minX, maxX] × [minY, maxY]`:

```
function lineIntersectsAABB(P0, P1, box):
    tEnter = 0, tExit = 1
    
    for each axis (x, y):
        if P1.axis == P0.axis:
            if P0.axis < box.min || P0.axis > box.max:
                return false
        else:
            t1 = (box.min - P0.axis) / (P1.axis - P0.axis)
            t2 = (box.max - P0.axis) / (P1.axis - P0.axis)
            
            tEnter = max(tEnter, min(t1, t2))
            tExit = min(tExit, max(t1, t2))
    
    return tEnter <= tExit
```

### Conservative Blocking Principle

**Definition**: A line is considered BLOCKED if:
1. It passes through the interior of any blocking tile
2. It touches exactly on the edge or corner of any blocking tile
3. The line passes within ε distance of any blocking tile edge, where ε → 0⁺

**Mathematical Formulation**:
For line segment `L` and blocking tile `T`:
```
blocked(L, T) = {
  true,  if interior(L) ∩ interior(T) ≠ ∅
  true,  if L ∩ boundary(T) ≠ ∅
  false, otherwise
}
```

---

## Complete LOS Scenarios

### 1. Clear Path Scenarios

#### 1.1 Orthogonal Clear Paths
- **Horizontal**: Source and target on same row, no intervening obstacles
- **Vertical**: Source and target on same column, no intervening obstacles
- **Mathematical Condition**: All corner-to-corner lines remain within unobstructed tiles

#### 1.2 Diagonal Clear Paths
- **Perfect Diagonal**: `|target.row - source.row| = |target.col - source.col|`
- **Off-Diagonal**: Different row/column distances, still clear path
- **Corner Advantage**: 16 possible corner combinations increase success probability

#### 1.3 Multi-Path Clear Scenarios
- **At Least One Valid**: Only need ONE successful corner-to-corner line
- **Redundant Paths**: Multiple corners may provide clear paths
- **Permissive by Design**: Corner-to-corner method intentionally permissive

### 2. Wall Blocking Scenarios

#### 2.1 Full Wall Blockage
```
Scenario: Wall tile completely blocks line of sight
Grid:     [S][W][T]  (S=Source, W=Wall, T=Target)
Result:   NO LOS - all 16 corner paths pass through wall interior
```

#### 2.2 Partial Wall Blockage
```
Scenario: Wall blocks some but not all corner paths
Grid:     
  [S][ ][ ]
  [ ][W][T]

Result:   MAYBE LOS - depends on corner selection
          - Top-Left to Bottom-Right: BLOCKED
          - Bottom-Right to Top-Left: CLEAR
```

#### 2.3 Corner Grazing Scenarios

**Case A: Direct Corner Touch**
```
Grid:     
  [S][ ]
  [ ][W][T]

Result:   BLOCKED (conservative approach)
          Line from bottom-right of S to top-left of T
          touches W corner exactly
```

**Case B: Edge Grazing**
```
Grid:
  [S][ ][ ]
  [ ][W][W][T]

Result:   BLOCKED
          Line grazes edge of wall without entering interior
```

#### 2.4 Wall Maze Scenarios
- **L-Shaped Walls**: Create LOS channels
- **U-Shaped Walls**: May completely enclose areas
- **Corridor Effects**: Funnel LOS through narrow openings

### 3. Monster Blocking Scenarios

#### 3.1 Single Monster Blockage
- **Complete Obstruction**: Monster tiles behave identically to walls for LOS
- **Tactical Shielding**: Front-rank monsters protect back-rank monsters
- **Order Dependency**: Attack sequence matters in multi-monster scenarios

#### 3.2 Monster Formation Scenarios

**Line Formation**:
```
Grid: [S][M1][M2][T]
Result: S→M1: YES, S→M2: NO, S→T: NO
```

**Diagonal Formation**:
```
Grid:
  [S][ ][ ]
  [ ][M1][ ]
  [ ][ ][M2][T]
Result: S→M1: YES, S→M2: YES (corner path), S→T: NO
```

#### 3.3 Monster-Wall Combinations
- **Hybrid Obstacles**: Mixed wall and monster blocking
- **Complex Geometries**: Create interesting tactical situations
- **Conservative Rules**: Apply same blocking criteria to both obstacle types

### 4. Complex Multi-Obstacle Scenarios

#### 4.1 Sequential Blocking
```
Grid:
  [S][ ][W][ ][T]
  [ ][M1][M2][ ][ ]

Result: Multiple obstacles create compound blocking
        Need to check ALL obstacles for EACH corner path
```

#### 4.2 Narrow Passage Navigation
```
Grid:
  [S][W][W][T]
  [ ][ ][ ][ ]
  [ ][W][W][ ]

Result: Only specific corner paths may navigate the corridor
        Conservative approach may block ambiguous paths
```

#### 4.3 Corner Squeeze Scenarios
```
Grid:
  [S][ ][ ]
  [ ][W][ ]
  [ ][ ][T]

Result: Single corner path through diagonal gap
        Success depends on precise mathematical intersection
```

### 5. Edge Cases

#### 5.1 Adjacent Tiles
- **Orthogonal Adjacency**: `[r, c]` and `[r, c±1]` or `[r±1, c]`
- **Diagonal Adjacency**: `[r, c]` and `[r±1, c±1]`
- **Same Tile**: `[r, c]` and `[r, c]` (always has LOS)

#### 5.2 Grid Boundary Cases
- **Edge Tiles**: Source or target on grid boundary
- **Corner Tiles**: Source or target in grid corner
- **Out-of-Bounds**: Lines extending beyond grid boundaries (BLOCKED)

#### 5.3 Degenerate Cases
- **Zero Distance**: Source and target at same position
- **Single Tile Grid**: Minimal grid size scenarios
- **All Obstacles**: Grid filled with blocking tiles

---

## Collision Detection Algorithms

### 1. Line-Tile Intersection Algorithm

#### Core Algorithm
```javascript
function lineIntersectsTile(P0, P1, tileRow, tileCol) {
    // Define tile boundaries
    const tileLeft = tileCol;
    const tileRight = tileCol + 1;
    const tileTop = tileRow;
    const tileBottom = tileRow + 1;
    
    // Calculate line parameters
    const dx = P1[0] - P0[0];
    const dy = P1[1] - P0[1];
    
    // Handle vertical lines
    if (Math.abs(dx) < EPSILON) {
        const x = P0[0];
        if (x < tileLeft - EPSILON || x > tileRight + EPSILON) {
            return false; // Line outside tile x-range
        }
        
        // Check y-range overlap
        const yMin = Math.min(P0[1], P1[1]);
        const yMax = Math.max(P0[1], P1[1]);
        return !(yMax < tileTop - EPSILON || yMin > tileBottom + EPSILON);
    }
    
    // Handle horizontal lines
    if (Math.abs(dy) < EPSILON) {
        const y = P0[1];
        if (y < tileTop - EPSILON || y > tileBottom + EPSILON) {
            return false; // Line outside tile y-range
        }
        
        // Check x-range overlap
        const xMin = Math.min(P0[0], P1[0]);
        const xMax = Math.max(P0[0], P1[0]);
        return !(xMax < tileLeft - EPSILON || xMin > tileRight + EPSILON);
    }
    
    // General case: parametric line-rectangle intersection
    let tEnter = 0, tExit = 1;
    
    // Check x boundaries
    const tx1 = (tileLeft - P0[0]) / dx;
    const tx2 = (tileRight - P0[0]) / dx;
    tEnter = Math.max(tEnter, Math.min(tx1, tx2));
    tExit = Math.min(tExit, Math.max(tx1, tx2));
    
    // Check y boundaries
    const ty1 = (tileTop - P0[1]) / dy;
    const ty2 = (tileBottom - P0[1]) / dy;
    tEnter = Math.max(tEnter, Math.min(ty1, ty2));
    tExit = Math.min(tExit, Math.max(ty1, ty2));
    
    return tEnter <= tExit + EPSILON;
}
```

#### Conservative Edge Detection
```javascript
function conservativeEdgeIntersection(P0, P1, tileRow, tileCol) {
    // Define expanded boundaries for conservative approach
    const buffer = EPSILON;
    const tileLeft = tileCol - buffer;
    const tileRight = tileCol + 1 + buffer;
    const tileTop = tileRow - buffer;
    const tileBottom = tileRow + 1 + buffer;
    
    // Use line-rectangle intersection with expanded boundaries
    return lineIntersectsExpandedRectangle(P0, P1, 
        tileLeft, tileTop, tileRight, tileBottom);
}
```

### 2. Corner-to-Corner LOS Algorithm

#### Primary LOS Function
```javascript
function hasLineOfSight(source, target, grid) {
    // Early exit: same tile always has LOS
    if (source[0] === target[0] && source[1] === target[1]) {
        return true;
    }
    
    // Get all corners for source and target tiles
    const sourceCorners = getCorners(source[0], source[1]);
    const targetCorners = getCorners(target[0], target[1]);
    
    // Check all corner-to-corner combinations
    for (const sc of sourceCorners) {
        for (const tc of targetCorners) {
            if (hasClearCornerPath(sc, tc, grid, source, target)) {
                return true; // Early success - only need one valid path
            }
        }
    }
    
    return false; // All corner paths blocked
}
```

#### Clear Path Validation
```javascript
function hasClearCornerPath(startCorner, endCorner, grid, source, target) {
    const tilesToCheck = getTilesAlongLine(startCorner, endCorner, grid);
    
    for (const [row, col] of tilesToCheck) {
        // Skip source and target tiles
        if ((row === source[0] && col === source[1]) || 
            (row === target[0] && col === target[1])) {
            continue;
        }
        
        // Check if tile blocks LOS
        if (isBlockingTile(row, col, grid)) {
            // Conservative check: does line touch this tile?
            if (conservativeEdgeIntersection(startCorner, endCorner, row, col)) {
                return false; // Path blocked
            }
        }
    }
    
    return true; // Clear path found
}
```

#### Tile Enumeration Algorithm
```javascript
function getTilesAlongLine(P0, P1, grid) {
    const tiles = new Set();
    const steps = Math.max(
        Math.abs(P1[0] - P0[0]), 
        Math.abs(P1[1] - P0[1])
    ) * 4; // High resolution for accuracy
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = P0[0] + t * (P1[0] - P0[0]);
        const y = P0[1] + t * (P1[1] - P0[1]);
        
        const tileRow = Math.floor(y);
        const tileCol = Math.floor(x);
        
        // Only add valid grid tiles
        if (tileRow >= 0 && tileRow < grid.length && 
            tileCol >= 0 && tileCol < grid[0].length) {
            tiles.add(`${tileRow},${tileCol}`);
        }
    }
    
    return Array.from(tiles).map(key => key.split(',').map(Number));
}
```

### 3. Key Insight: Orthogonal Blocking Principle

**Theorem**: If obstacles exist at orthogonal positions relative to the source (e.g., one directly south and one directly east), then LOS to the diagonal position (e.g., southeast) is impossible.

**Mathematical Proof**:
```
Given: Source at S(r, c), obstacles at O₁(r+Δy, c) and O₂(r, c+Δx)
To prove: No LOS exists to target T(r+Δy, c+Δx)

Proof:
1. Any line from any corner of S to any corner of T must pass through
   either the region x ∈ [c, c+Δx] or y ∈ [r, r+Δy]
2. Obstacle O₁ blocks all paths that go through y ∈ [r+Δy, r+Δy+1]
3. Obstacle O₂ blocks all paths that go through x ∈ [c+Δx, c+Δx+1]
4. Any path to T must intersect at least one of these regions
5. Therefore, all corner-to-corner paths are blocked
∎
```

**Implementation**:
```javascript
function checkOrthogonalBlocking(source, target, grid) {
    // Calculate direction vectors
    const dx = target[1] - source[1];
    const dy = target[0] - source[0];
    
    // Only applies to diagonal directions
    if (dx === 0 || dy === 0) return false;
    
    // Check for orthogonal obstacles
    const southObstacle = grid[source[0] + Math.sign(dy)][source[1]];
    const eastObstacle = grid[source[0]][source[1] + Math.sign(dx)];
    
    return (isBlocking(southObstacle) && isBlocking(eastObstacle));
}
```

---

## Implementation Specification

### 1. Function Signature

```javascript
function los(source, target, grid) // returns boolean
```

**Parameters**:
- `source`: `[number, number]` - `[row, col]` of source tile
- `target`: `[number, number]` - `[row, col]` of target tile  
- `grid`: `Array<Array<any>>` - 2D grid representation

**Returns**: `boolean` - `true` if LOS exists, `false` otherwise

### 2. Grid Representation

```javascript
const GRID_CONSTANTS = {
    EMPTY: null,           // Empty tile
    WALL: '#',            // Wall tile (blocks LOS)
    OCCUPIED: 'M'         // Monster/Character (blocks LOS for others)
};

// Example grid
const grid = [
    [null, null, '#', null, 'M'],  // Row 0
    [null, '#', '#', null, null],  // Row 1
    ['M', null, '#', null, null],  // Row 2
    // ... more rows
];
```

### 3. Core Implementation Algorithm

```javascript
function los(source, target, grid) {
    // 1. Early exit: same tile
    if (source[0] === target[0] && source[1] === target[1]) {
        return true;
    }
    
    // 2. Pre-check: orthogonal blocking optimization
    if (checkOrthogonalBlocking(source, target, grid)) {
        return false;
    }
    
    // 3. Generate corner combinations
    const sourceCorners = getCorners(source[0], source[1]);
    const targetCorners = getCorners(target[0], target[1]);
    
    // 4. Test all corner-to-corner paths
    for (const sc of sourceCorners) {
        for (const tc of targetCorners) {
            if (testCornerPath(sc, tc, grid, source, target)) {
                return true; // Success: found clear path
            }
        }
    }
    
    // 5. All paths blocked
    return false;
}
```

### 4. Helper Functions

```javascript
// Get all 4 corners of a tile
function getCorners(row, col) {
    return [
        [col, row],         // Top-Left
        [col + 1, row],     // Top-Right
        [col, row + 1],     // Bottom-Left
        [col + 1, row + 1]  // Bottom-Right
    ];
}

// Check if a tile blocks LOS
function isBlockingTile(row, col, grid) {
    // Out of bounds blocks LOS
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return true;
    }
    
    const cell = grid[row][col];
    return cell === GRID_CONSTANTS.WALL || 
           (cell != null && cell !== GRID_CONSTANTS.EMPTY);
}

// Conservative path test
function testCornerPath(start, end, grid, source, target) {
    const tiles = getTilesAlongLine(start, end, grid);
    
    for (const [row, col] of tiles) {
        // Skip source and target
        if (isSamePosition([row, col], source) || isSamePosition([row, col], target)) {
            continue;
        }
        
        if (isBlockingTile(row, col, grid)) {
            // Conservative check: any intersection = blocked
            if (lineIntersectsTile(start, end, row, col)) {
                return false;
            }
        }
    }
    
    return true;
}

// Utility functions
function isSamePosition(pos1, pos2) {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
}

const EPSILON = 1e-10; // Floating point precision
```

---

## Edge Cases and Validation

### 1. Critical Test Cases

#### Case 1: Corner Grazing
```javascript
// Line should be blocked when touching corner
const grid = [
    ['S', null, null],
    [null, 'W', 'T']
];
// Expected: false (blocked by conservative corner touching)
```

#### Case 2: Diagonal Squeeze
```javascript
// Narrow diagonal passage
const grid = [
    ['S', null, null, 'T'],
    [null, 'W', 'W', null]
];
// Expected: true (corner path through gap)
```

#### Case 3: Orthogonal Blocking
```javascript
// Obstacles south and east block southeast LOS
const grid = [
    ['S', 'W', null],
    ['W', null, 'T']
];
// Expected: false (orthogonal blocking theorem)
```

#### Case 4: Edge Boundary
```javascript
// Source/target at grid edge
const grid = [
    ['S', null, null, null, 'T'],
    [null, null, null, null, null]
];
// Expected: true (clear path along edge)
```

### 2. Validation Metrics

#### Algorithm Correctness
- **Coverage**: Test all 16 corner combinations
- **Conservatism**: Block ambiguous edge cases
- **Performance**: Early exit on first success

#### Mathematical Accuracy
- **Precision**: Handle floating-point edge cases
- **Boundary Detection**: Proper tile boundary intersection
- **Edge Cases**: Zero-length lines, vertical/horizontal lines

#### Game Rule Compliance
- **Corner-to-Corner**: Strict adherence to official rule
- **Blocking Logic**: Walls and monsters block identically
- **Permissive Design**: Maximum LOS within constraints

### 3. Test Suite Structure

```javascript
// Validation test categories
const TEST_CATEGORIES = {
    CLEAR_PATHS: 'Clear LOS scenarios',
    WALL_BLOCKING: 'Wall blocking scenarios',
    MONSTER_BLOCKING: 'Monster blocking scenarios',
    EDGE_GRAZING: 'Corner/edge grazing scenarios',
    ORTHOGONAL_BLOCKING: 'Orthogonal blocking theorem',
    BOUNDARY_CASES: 'Grid boundary scenarios',
    ADJACENT_TILES: 'Adjacent tile scenarios',
    COMPLEX_GEOMETRY: 'Multi-obstacle scenarios'
};
```

---

## Performance Considerations

### 1. Optimization Strategies

#### Early Exit Conditions
- Same tile detection
- Orthogonal blocking check
- First valid corner path

#### Spatial Optimization
- Bounding box checks
- Tile enumeration caching
- Line segment simplification

#### Computational Complexity
- **Best Case**: O(1) - same tile
- **Average Case**: O(16 × n) where n = tiles along line
- **Worst Case**: O(16 × rows × cols) - full grid traversal

### 2. Memory Efficiency

#### Grid Representation
- Use efficient 2D array structure
- Minimize object creation
- Reuse corner coordinates

#### Algorithm Caching
- Cache corner calculations
- Store line intersection results
- Optimize tile enumeration

### 3. Precision vs Performance Trade-offs

#### Floating Point Handling
- Use appropriate epsilon values
- Balance accuracy with speed
- Consider integer alternatives where possible

#### Resolution Tuning
- Adjust line sampling resolution
- Balance between accuracy and performance
- Target minimum viable precision

---

## Conclusion

This specification provides a complete mathematical foundation and implementation guide for LOS in One Card Dungeon. The corner-to-corner approach, combined with conservative edge handling, ensures accurate and game-compliant behavior while maintaining good performance characteristics.

The key insight about orthogonal blocking provides both an optimization opportunity and deeper understanding of the geometric constraints involved. The implementation balances mathematical rigor with practical game requirements, ensuring reliable and intuitive LOS determination across all possible scenarios.

**Next Steps**:
1. Implement the core LOS algorithm using the provided specification
2. Develop comprehensive test suite covering all scenarios
3. Optimize performance based on profiling results
4. Validate against real gameplay scenarios and edge cases

---

**Document Version**: 1.0  
**Last Updated**: January 15, 2026  
**Author**: LOS Technical Specification Team