import _ from "./libs/atomic_/core.js";

export function level(level, h = hero(6)){
  const m = monster("spider", 5, 4, 4, 3);
  const w = wall();
  const _ = null;
  return [
    [_, _, _, m, _],
    [_, _, _, w, _],
    [_, _, _, _, m],
    [_, w, _, w, _],
    [h, _, _, _, _]
  ];
}

export function init(){
  const dungeon = level(1);
  return {
    hero: [4, 0],
    monsters: [[0, 3], [2, 4]],
    dungeon
  }
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
  return function(state){
    const {energy, hero} = state;
    const increase = _.first(energy);
    const path = _.toArray(_.concat(["dungeon"], hero));
    debugger
    return _.chain(state,
      _.update(_, "energy", _.pipe(_.rest, _.toArray)),
      _.updateIn(_, path, function(hero){
        const {earned} = hero;
        const base = earned[attribute];
        const value = base + increase;
        return _.assoc(hero, attribute, value);
      }));
  }
}
