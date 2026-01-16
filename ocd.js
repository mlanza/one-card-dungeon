import _ from "./libs/atomic_/core.js";

const WALL = "#";
const HERO = 0;
export const H = HERO;
export const X = WALL;

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

export function range(source, target, dungeon) {
  return _.chain(paths(source, target, _.assocIn(dungeon, [target], null)), //vacating target includes target location
    cheapest,
    _.first,
    dist);
}

function cheapest(paths) {
  const distances = _.mapa(dist, paths);
  const cheapest = _.min(...distances);
  return _.reducekv(function (memo, idx, path) {
    return _.get(distances, idx) === cheapest ? _.conj(memo, path) : memo;
  }, [], paths);
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

export function move({details}) {
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

export function attack({details}){
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

function blot(targets, dungeon){
  return _.reduce(_.assocIn(_, _, null), dungeon, targets);
}

export function attacks(attacker) {
  return function (state) {
    const { occupants, dungeon } = state;
    const range = _.chain(_.get(occupants, attacker), skill("range"));
    const source = where(attacker, dungeon);
    const targets = enemies(attacker, dungeon);
    return _.chain(targets,
      _.map(function(target){
        const cost = _.chain(paths(source, target, blot(targets, dungeon)), cheapest, _.first, dist);
        const details = {target, cost};
        const type = "attack";
        return {type, details};
      }, _),
      _.filtera(function({details}){
        return details.cost <= range;
      }, _));
  }
}

export function adventure(command){
  const actions = {move, attack};
  const {type, details} = command;
  const action = _.get(actions, type);
  return action(command);
}

export const adventures = _.comp(_.toArray, _.spread(_.concat), _.juxt(attacks(HERO), moves(HERO)));

const vacant = _.isNil;

const samePos = _.eq;

function key(pos) {
    return pos.join(',');
}

function unkey(k) {
    return k.split(',').map(Number);
}

function manhattan(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function add(pos, step) {
    return [pos[0] + step[0], pos[1] + step[1]];
}

const STEPS = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
];

function toOffsets(posPath) {
    const steps = [];
    for (let i = 0; i < posPath.length - 1; i++) {
        const a = posPath[i];
        const b = posPath[i + 1];
        steps.push([b[0] - a[0], b[1] - a[1]]);
    }
    return steps;
}

function dim(grid){
  const height = _.count(grid);
  const row = _.first(grid);
  const width = _.count(row);
  return [height, width];
}

export { default as los } from "./libs/los.js";


export { default as paths } from "./libs/paths.js";
