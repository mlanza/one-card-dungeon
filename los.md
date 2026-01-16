# Line of Sight Specification

## Function Signature
```javascript
function los(source, target, grid) // returns boolean
```

## Parameters
- `source`: [row, col] - Adventurer's position
- `target`: [row, col] - Monster's position  
- `grid`: 2D array where each cell is null (vacant) or occupied (non-null)

## LOS Rules (from OCD_rules_ENG.pdf)

**Core Rule**: Line of Sight exists if a line can be drawn from any corner of the source tile to any corner of the target tile, without passing through:
1. A wall tile
2. Another monster's tile (occupied cell)

## Implementation Approach

### Corner-Based LOS Check
1. **Define Corners**: Each tile has 4 corners (top-left, top-right, bottom-left, bottom-right)
2. **Check All Combinations**: Test lines from each source corner to each target corner (16 total combinations)
3. **Early Termination**: Return true if any valid line found

### Line Intersection Algorithm
For each line from source corner to target corner:
- Check if line passes through any wall tiles
- Check if line passes through any occupied tiles (except source/target)
- **Critical Rule**: Line must not pass through the interior of any blocking tile
- **Edge Touching**: Lines that only touch the edge/corner of a blocking tile are considered BLOCKED (no LOS)
- Use line-rectangle intersection for each grid cell

### Grid Cell Representation
- `null`: Vacant tile (passable)
- `wall`: Wall tile (blocks LOS)
- `occupied`: Monster/character tile (blocks LOS for other monsters)

### Edge Cases
- Source and target on same tile: Always true
- Adjacent tiles: Check corners carefully
- Diagonal adjacency: Verify line doesn't pass through blocking tiles
- **Edge/Corner Touching**: If LOS line only touches the edge or corner of a wall/occupied tile without passing through interior, LOS is BLOCKED
- **Case D Scenario**: When LOS line grazes the corner of a blocking tile, it's considered blocked even though it doesn't pass through the tile's interior

## Pseudocode
```javascript
function los(source, target, grid) {
  // Same tile - always have LOS
  if (source[0] === target[0] && source[1] === target[1]) {
    return true;
  }
  
  // Get all 4 corners for source and target tiles
  const sourceCorners = getCorners(source[0], source[1]);
  const targetCorners = getCorners(target[0], target[1]);
  
  // Check all corner-to-corner combinations
  for (let sc of sourceCorners) {
    for (let tc of targetCorners) {
      if (hasClearLine(sc, tc, grid, source, target)) {
        return true;
      }
    }
  }
  
  return false;
}
```

## Validation
- Test with clear line of sight
- Test with walls blocking
- Test with other monsters blocking  
- Test edge cases (adjacent, diagonal, same tile)
- **Test Case D**: Verify LOS is blocked when line only touches corner/edge of blocking tile
- **Test Case E**: Verify ambiguous grazing scenarios are blocked (conservative approach)
