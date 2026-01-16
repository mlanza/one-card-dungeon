import _ from "./libs/atomic_/core.js";
import {add, paths} from "./libs/paths.js";
export { default as paths } from "./libs/paths.js";

const WALL = "#";
const HERO = 0;
export const H = HERO;
export const X = WALL;

const isHero = _.eq(HERO, _);
const isMonster = _.notEq(HERO, _);

export function level(level, h = hero()) {
  const m = monster("spider", 2, 5, 4, 4, 3);
  const _ = null;
  const occupants = [h, m, m];
  const dungeon = [
    [_, _, _, 1, _],
    [_, _, _, X, _],
    [_, _, _, _, 2],
    [_, X, _, X, _],
    [H, _, _, _, _],
  ];
  return { dungeon, occupants };
}

export function init() {
  return level(1);
}

const wall = { type: "wall" };

function monster(type, health, speed, attack, defense, range) {
  return { type, health, speed, attack, defense, range };
}

function hero(kind = null) {
  const earned = { speed: 1, attack: 1, defense: 1, range: 2 };
  return { type: "hero", health: 6, kind, earned };
}

function skill(key) {
  return function (who) {
    return _.get(who, key) + _.getIn(who, ["earned", key], 0);
  }
}

export function energize(die) {
  const energy = _.chain(die, _.repeatedly(3, _), _.toArray);
  return function (state) {
    return { ...state, energy };
  };
}

export function assignEnergy(attribute) {
  if (!["speed", "attack", "defense"].includes(attribute)) {
    throw new Error("Invalid attribute selection.");
  }
  return function (state) {
    const { energy } = state;
    const increase = _.first(energy);
    return _.chain(
      state,
      _.update(_, "energy", _.pipe(_.rest, _.toArray)),
      _.updateIn(_, ["occupants", 0], function (hero) {
        const { earned } = hero;
        const base = earned[attribute];
        const value = base + increase;
        return _.assoc(hero, attribute, value);
      }),
    );
  };
}

export function coord(occupant, { occupants, dungeon }) {
  if (!_.isInt(occupant)) {
    throw new Error(`Occupant must be an int.`);
  }
  if (!_.get(occupants, occupant)) {
    throw new Error(`Occupant must be present.`);
  }
  const row = _.detectIndex(function (row) {
    return _.includes(row, occupant);
  }, dungeon);
  const col = _.chain(dungeon, _.nth(_, row), _.indexOf(_, occupant));
  return [row, col];
}

const offsets = [[0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];

function inBounds([row, col], size = [5, 5]) {
  const [height, width] = size;
  return row > -1 && row < height && col > -1 && col < width;
}

function adjacencies(origin, { occupants, dungeon }) {
  const [row, col] = origin;
  return _.chain(
    offsets,
    _.map(function (offset) {
      const [r, c] = offset;
      const speed = cost(offset);
      const coord = [row + r, col + c];
      const at = _.getIn(dungeon, coord);
      const id = at != null && at !== WALL ? at : null;
      const what = at === WALL ? wall : _.maybe(id, _.get(occupants, _));
      return { coord, offset, id, what, speed };
    }, _),
    _.filtera(function ({ coord }) {
      return inBounds(coord);
    }, _),
  );
}

function cost(offset) {
  const [r, c] = offset;
  return _.eq([0, 0], offset) ? 0 : Math.abs(r) + Math.abs(c) == 2 ? 3 : 2;
}

function dist(path) {
  return _.reduce(function (sum, offset) {
    return sum + cost(offset);
  }, 0, path);
}

function cheapest(paths) {
  const distances = _.mapa(dist, paths);
  const cheapest = _.count(distances) ? _.min(...distances) : null;
  return cheapest ? _.reducekv(function (memo, idx, path) {
    return _.get(distances, idx) === cheapest ? _.conj(memo, path) : memo;
  }, [], paths) : null;
}

export function los(source, target, dungeon){
  if (_.eq(source, target)) return [[0, 0]];
  const modified = without(dungeon, source, target);
  const cleared = bulldoze(dungeon);
  const distance = range(source, target, cleared);
  return _.chain(
    paths(source, target, modified),
    _.filter(_.comp(_.lte(_, distance), dist), _),
    _.remove(hasHardHook, _),
    _.toArray,
    _.seq);
}

function hasHardHook(path) {
  if (path.length <= 3) return false;

  // Look for the specific pattern: consecutive orthogonal moves (>=2)
  // followed immediately by diagonal moves (>=1) with no mixing
  let i = 0;
  while (i < path.length - 1) {
    // Find consecutive orthogonal moves
    let orthogonalCount = 0;
    while (i < path.length && Math.abs(path[i][0]) + Math.abs(path[i][1]) === 1) {
      orthogonalCount++;
      i++;
    }

    // If we found >=2 orthogonal moves and next move is diagonal, that's a hard hook
    if (orthogonalCount >= 2 && i < path.length && Math.abs(path[i][0]) + Math.abs(path[i][1]) === 2) {
      return true;
    }

    // Skip diagonal moves
    while (i < path.length && Math.abs(path[i][0]) + Math.abs(path[i][1]) === 2) {
      i++;
    }
  }

  return false;
}

function bulldoze(dungeon){
  const [h, w] = dim(dungeon);
  return _.chain(
    _.repeat(w, null),
    _.toArray,
    _.repeat(h, _),
    _.toArray);
}

function clear(dungeon){
  return _.mapa(function(row){
    return _.mapa(function(content){
      return _.isInt(content) ? null : content;
    }, row);
  }, dungeon);
}

export function moves(occupant) {
  return function (state) {
    const entity = _.get(state.occupants, occupant);
    const { speed } = entity;
    return _.chain(coord(occupant, state), (coord) => adjacencies(coord, state), _.filtera(function (meta) {
      return meta.speed <= speed && meta.speed !== 0 && meta.what == null;
    }, _), _.mapa(function ({ offset, speed }) {
      const type = "move";
      const details = { occupant, offset, speed };
      return { type, details };
    }, _));
  };
}

export function move(details) {
  const { occupant, offset, speed } = details;
  return function (state) {
    const found = _.chain(state,
      moves(occupant),
      _.detect(_.pipe(_.get(_, "details"), _.eq(details, _)), _));
    if (!found){
      throw new Error(`Invalid move.`);
    }
    const from = coord(occupant, state);
    const to = add(from, offset);
    return _.chain(state,
      _.assocIn(_, ["dungeon", ...from], null),
      _.assocIn(_, ["dungeon", ...to], occupant),
      _.updateIn(_, ["occupants", occupant, "speed"], _.subtract(_, speed)));
  }
}

export function attack(details){
  return function(state){
    return state;
  }
}

export function where(occupant, dungeon) {
  return _.reducekv(function (memo, r, row) {
    return _.maybe(row, _.reducekv(function (memo, c, content) {
      return _.eq(occupant, content) ? _.conj(memo, [r, c]) : memo;
    }, [], _), _.first, _.reduced) || memo;
  }, null, dungeon);
}

export function enemies(attacker, dungeon) {
  const enemy = _.and(_.isInt, _.partial(attacker === 0 ? _.notEq : _.eq, attacker));
  return _.reducekv(function (memo, r, row) {
    const hits = _.reducekv(function (memo, c, content) {
      return enemy(content) ? _.conj(memo, [r, c]) : memo;
    }, [], row);
    return _.count(hits) ? _.conj(memo, ...hits) : memo;
  }, [], dungeon);
}

function without(dungeon, ...targets){
  return _.reduce(_.assocIn(_, _, null), dungeon, targets);
}

export function canAttack(attacker, defender, state){
  const {dungeon, occupants} = state;
  const source = where(attacker, dungeon);
  const target = where(defender, dungeon);
  const range = _.chain(_.get(occupants, attacker), skill("range"));
  const distance = _.chain(los(source, target, dungeon), _.first, dist);
  const able = range && distance <= range;
  return able ? {attacker, defender} : null;
}

function team(how, occupants){
  return _.reducekv(function(memo, idx, occupant){
    return how(idx) && occupant ? _.conj(memo, idx) : memo;
  }, [], occupants);
}

function uniq(items, key){
  return _.chain(items, _.mapa(_.get(_, key), _), _.set, _.toArray);
}

export function range(source, target, dungeon){
  return _.chain(paths(source, target, dungeon), cheapest, _.first, dist);
}

export function tst(dungeon){
  return paths([3,0], [4,0], dungeon);

  const res = range([3,0], [4,0], dungeon);
  debugger
  return res;
}

export function closestMonsters(state){
  const {occupants, dungeon} = state;
  const monsters = team(isMonster, occupants);
  const target = where(HERO, dungeon);
  const stats = _.mapa(function(monster){
    const source = where(monster, dungeon);
    const distance = range(source, target, dungeon);
    return {distance, monster};
  }, monsters);
  const distance = _.chain(stats, _.mapa(_.get(_, "distance"), _), _.spread(_.min));
  return _.chain(stats, _.filter(_.comp(_.eq(distance, _), _.get(_, "distance")), _), _.mapa(_.get(_, "monster"), _));
}

function vacated(dungeon){
  return _.reducekv(function(memo, r, row){
    return _.reducekv(function(memo, c, contents){
      return contents == null ? _.conj(memo, [r, c]) : memo;
    }, memo, row);
  }, [], dungeon);
}

export function teleport(occupant, coord){ //for testing purposes
  return function(state){
    const {dungeon} = state;
    const target = where(occupant, dungeon);
    if (!target) {
      throw new Error("Occupant not found in dungeon.");
    }
    return _.chain(state,
      _.assocIn(_, ["dungeon", ...target], null),
      _.assocIn(_, ["dungeon", ...coord], occupant));
  }
}

export function locations(monster, {dungeon, occupants}){
  const target = where(HERO, dungeon);
  const source = where(monster, dungeon);
  const aggressor = _.chain(occupants, _.get(_, monster));
  const rng = _.chain(aggressor, skill("range"));
  const speed = _.chain(aggressor, skill("speed"));
  const modified = without(dungeon, target, source);
  const ranked = _.chain(dungeon, vacated,
    _.mapa(function(coord){
      const gap = range(coord, target, modified);
      const distance  = range(source, coord, modified);
      const sight = !!los(coord, target, modified);
      const maximum = gap === rng;
      const striking = gap <= rng && !!sight;
      return {coord, distance, gap, striking, maximum, sight};
    }, _),
    _.filtera(function({distance}){
      return distance <= speed;
    }, _),
    _.sort(
      _.desc(function({maximum, striking}){
        return maximum && striking;
      }),
      _.desc(function({striking}){
        return striking;
      }),
      _.desc(function({maximum}){
        return maximum;
      }),
      _.desc(function({distance}){
        return distance;
      }), _));
  const best = _.maybe(ranked, _.first, function({striking, maximum, sight}){
    return {striking, maximum, sight};
  });
  const locations = _.chain(ranked, _.filtera(function({striking, maximum, sight}){
    return _.eq({striking, maximum, sight}, best);
  }, _), _.mapa(_.get(_, "coord"), _));
  return {monster, locations}
}

export function attacks(friend = isHero) {
  const foe = _.complement(friend);
  return function (state) {
    const { occupants, dungeon } = state;
    const friends = team(friend, occupants);
    const foes = team(foe, occupants);
    const attacks = _.chain(
      _.braid(_.plug(canAttack, _, _, state), friends, foes),
      _.compact,
      _.toArray);
    const attackers = uniq(attacks, "attacker");
    const defenders = uniq(attacks, "defender");
    const type = "attack";
    return _.chain(defenders, _.mapa(function(defender){
      const details = {attackers, defender};
      return {type, details};
    }, _), _.seq);
  }
}

export function adventure(command){
  const actions = {move, attack};
  const {type, details} = command;
  const action = _.get(actions, type);
  return action(details);
}

export const adventures = _.comp(_.toArray, _.spread(_.concat), _.juxt(attacks(HERO), moves(HERO)));

function dim(grid){
  const height = _.count(grid);
  const row = _.first(grid);
  const width = _.count(row);
  return [height, width];
}
