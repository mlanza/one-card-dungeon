export function init(level){
  return {
    start: [0, 4],
    dungeon: [[null, null, null, "W", null]]
  };
}


export function rollEnergyDice(state){
  state.dungeon = [];
  const {start, dungeon} = state;
  const [r1, r2, r3, r4, r5] = dungeon;
  const newStart = [5, 6];
  return {...state, start: newStart, energyDicePool: [1, 5, 6], assignedEnergyDice: []}
}

export function assignEnergyDie(slot){
  return function(state){
    return {...state, energyDicePool: [5, 6], assignedEnergyDice: [null, 1, null]}
  }
}
