import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import * as eff from "./libs/effects.js";
import { reg } from "./libs/cmd.js";
import * as o from "./ocd.js";

const $state = $.atom(o.init());

reg({ $state, o });

$.swap($state, o.energize(eff.rolling(4, 5, 6)));
$.swap($state, o.assignEnergy("speed"));
$.swap($state, o.assignEnergy("attack"));
$.swap($state, o.assignEnergy("defense"));
