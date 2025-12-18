import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import {reg} from "./libs/cmd.js";
import * as o from "./ocd.js";

const $state = $.atom(o.init());

reg({$state});

function die(sides = 6){
  return _.randInt(sides) + 1;
}

$.swap($state, o.energize(die));
$.swap($state, o.assignEnergy("speed"));
$.swap($state, o.assignEnergy("attack"));
$.swap($state, o.assignEnergy("defense"));

