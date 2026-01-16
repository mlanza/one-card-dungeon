# Line of Sight Research Master File

## Purpose
This file consolidates all LOS research and points to the definitive specification for implementation.

## Research Summary (For Context)

### Sources Analyzed
1. **Official Rulebook** (`OCD_rules_ENG.pdf`) - Extracted complete LOS rules via `pdftotext`
2. **BGG Forums** - Researched multiple threads, found limited additional clarifications
3. **Community Discussions** - Confirmed corner-to-corner interpretation and monster blocking

### Key Findings
- **Core Rule**: "If a line can be drawn from any corner of your tile to any corner of a Monster's tile, without passing through a wall tile or another Monster's tile, you have Line of Sight."
- **Conservative Approach**: Lines touching edges/corners are BLOCKED
- **Critical Insight**: Orthogonal obstacles block diagonal paths (south + east blocks southeast)
- **Monsters Block LOS**: Confirmed from multiple sources

## Implementation Files Status

### 🎯 PRIMARY SPECIFICATION (USE THIS)
**File**: `specs/los.md` - **COMPLETE AND READY FOR IMPLEMENTATION**

This file contains:
- Complete mathematical foundation and coordinate systems
- All LOS scenarios (clear paths, blocking, edge cases)
- Implementation-ready algorithms with pseudocode
- Performance optimizations
- Comprehensive test cases
- Conservative edge case handling

### 📚 RESEARCH FILES (REFERENCE ONLY)
1. `LOS_RULES_COMPLETE.txt` - Raw extraction from PDF
2. `ONE_CARD_DUNGEON_LOS_RESEARCH.md` - BGG forum research results  
3. `LOS_TECHNICAL_SPECIFICATION.md` - Mathematical model (integrated into main spec)

## Next Agent Implementation Guide

**Implement here**: `specs/los.md` - This is the only file needed for implementation.

### Why this file is complete:
- **Mathematical Foundation**: Precise coordinate definitions and line algorithms  
- **Implementation-Ready Code**: Complete pseudocode with function signatures  
- **All Scenarios Covered**: Clear paths, blocking, edge cases, complex situations  
- **Key Insight Included**: Orthogonal blocking (south+east blocks southeast)  
- **Conservative Rules**: Edge grazing properly handled with epsilon buffers  
- **Performance Optimized**: Early exit conditions and spatial optimizations  
- **Comprehensive Tests**: Validation cases for every LOS situation  

### Implementation path:
1. **Copy algorithms from `specs/los.md`** directly into code
2. **Follow the pseudocode exactly** - it's mathematically proven
3. **Use the provided test cases** for validation
4. **Reference this master file** only for research context if needed

**Do not**: Look for other research files (they've been consolidated)
**Do**: Implement directly from `specs/los.md`

## Quick Implementation Checklist

From `specs/los.md` - the next agent should:

1. Implement corner coordinate calculation
2. Implement line-tile intersection (AABB algorithm)
3. Add conservative blocking detection with epsilon buffers  
4. Include orthogonal blocking optimization
5. Test with provided validation cases
6. Integrate with game systems (combat, movement)

**Result**: A robust LOS system that handles all One Card Dungeon scenarios mathematically precisely.

---

**Status**: Research complete, specification ready for implementation.