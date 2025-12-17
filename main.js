import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import {reg} from "./libs/cmd.js";
import * as o from "./ocd.js";

const $state = $.atom(o.init(1));

reg({$state});

$.swap($state, o.rollEnergyDice);
$.swap($state, o.assignEnergyDie(2));
$.swap($state, o.assignEnergyDie(1));
$.swap($state, o.assignEnergyDie(3));
$.swap($state, function(state){

})

