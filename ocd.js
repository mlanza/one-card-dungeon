import _ from "./libs/atomic_/core.js";

export function level(level, h = hero()){
  const m = monster("spider", 2, 5, 4, 4, 3);
  const w = "X";
  const _ = null;
  const occupants = [h, m, m];
  const dungeon = [
    [_, _, _, 1, _],
    [_, _, _, w, _],
    [_, _, _, _, 2],
    [_, w, _, w, _],
    [0, _, _, _, _]
  ];
  return {dungeon, occupants};
}

export function init(){
  return level(1);
}

function wall(){
  return {type: "wall"};
}

function monster(type, health, speed, attack, defense, range){
  return {type, health, speed, attack, defense, range};
}

function hero(kind = null){
  const earned = {speed: 1, attack: 1, defense: 1, range: 2};
  return {type: "hero", health: 6, kind, earned};
}

export function energize(die){
  const energy = _.chain(die, _.repeatedly(3, _), _.toArray);
  return function(state){
    return {...state, energy};
  }
}

export function assignEnergy(attribute){
  if (!["speed", "attack", "defense"].includes(attribute)) {
    throw new Error("Invalid attribute selection.");
  }
  return function(state){
    const {energy} = state;
    const increase = _.first(energy);
    return _.chain(state,
      _.update(_, "energy", _.pipe(_.rest, _.toArray)),
      _.updateIn(_, ["occupants", 0], function(hero){
        const {earned} = hero;
        const base = earned[attribute];
        const value = base + increase;
        return _.assoc(hero, attribute, value);
      }));
  }
}
