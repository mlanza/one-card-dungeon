import _ from "./libs/atomic_/core.js";

const WALL = "X";

export function level(level, h = hero()) {
  const m = monster("spider", 2, 5, 4, 4, 3);
  const w = WALL;
  const _ = null;
  const occupants = [h, m, m];
  const dungeon = [
    [_, _, _, 1, _],
    [_, _, _, w, _],
    [_, _, _, _, 2],
    [_, w, _, w, _],
    [0, _, _, _, _],
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
    throw new Error(`Occupant must be known.`)
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
      const origin = _.eq([0, 0], offset);
      const range = Math.abs(r) + Math.abs(c) == 2 ? 3 : 2;
      const coord = [row + r, col + c];
      const at = _.getIn(dungeon, coord);
      const id = at != null && at !== WALL ? at : null;
      const what = at === WALL ? wall : _.maybe(id, _.get(occupants, _));
      return { coord, origin, offset, id, what, range };
    }, _),
    _.filtera(function ({ coord }) {
      return inBounds(coord);
    }, _),
  );
}

export function reach(occupant) {
  return function (state) {
    return _.chain(coord(occupant, state), (coord) => adjacencies(coord, state));
  };
}
