import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import * as eff from "./libs/effects.js";
import { reg } from "./libs/cmd.js";
import * as o from "./ocd.js";
const v = null;
import {H, X, los} from "./ocd.js";

const $state = $.atom(o.init());

reg({ $state, o });

$.swap($state, o.energize(eff.rolling(4, 5, 6)));
$.swap($state, o.assignEnergy("speed"));
$.swap($state, o.assignEnergy("attack"));
$.swap($state, o.assignEnergy("defense"));
//$.swap($state, o.move({type: "move", details: {occupant: o.H, offset: [-1, 0], speed: 2}}));

_.chain(los([2, 2], [2, 0], [
  [0, X, v, v, 4],
  [v, v, v, X, v],
  [1, X, H, X, v],
  [v, X, X, v, v],
  [v, 2, v, v, 3]
]), $.see("HERE"));
