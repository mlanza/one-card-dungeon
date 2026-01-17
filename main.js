import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import * as eff from "./libs/effects.js";
import { reg, cmd } from "./libs/cmd.js";
import * as o from "./ocd.js";

const $state = $.atom(o.init());
$.sub($state, _.comp(console.log, o.render));
reg({ $state, o });

$.swap($state, o.energize(eff.rolling(4, 5, 6)));
$.swap($state, o.assignEnergy("speed"));
$.swap($state, o.assignEnergy("attack"));
$.swap($state, o.assignEnergy("defense"));
$.swap($state, o.move({occupant: 0, offset: [0, 1], speed: 2}))
$.swap($state, o.move({occupant: 0, offset: [0, 1], speed: 2}))

cmd();
