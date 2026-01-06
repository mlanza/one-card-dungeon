import _ from "./atomic_/core.js";

export function rolling(...dice){
  let rolls = _.cycle(dice);
  return function(){
    const roll = _.first(rolls);
    rolls = _.rest(rolls);
    return roll;
  }
}

export function die(sides = 6){
  return _.randInt(sides) + 1;
}
