import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import * as eff from "./libs/effects.js";
import { reg, cmd } from "./libs/cmd.js";
import * as o from "./ocd.js";
const v = null;
import {H, X, los} from "./ocd.js";

const $state = $.atom(o.init());

reg({ $state, o });

$.swap($state, o.energize(eff.rolling(4, 5, 6)));
$.swap($state, o.assignEnergy("speed"));
$.swap($state, o.assignEnergy("attack"));
$.swap($state, o.assignEnergy("defense"));
$.swap($state, o.teleport(1, [2, 0]));

$.sub($state, _.comp(console.log, o.render));

_.chain($state, _.deref, _.partial(o.locations, 1), console.log)

//$.swap($state, o.move({type: "move", details: {occupant: o.H, offset: [-1, 0], speed: 2}}));
cmd();
