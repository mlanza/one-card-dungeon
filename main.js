import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import {reg} from "./libs/cmd.js";
import * as o from "./ocd.js";

const $state = $.atom(o.init());

reg({$state});

function rolling(...dice){
  let rolls = _.cycle(dice);
  return function(){
    const roll = _.first(rolls);
    rolls = _.rest(rolls);
    return roll;
  }
}

function die(sides = 6){
  return _.randInt(sides) + 1;
}

$.swap($state, o.energize(rolling(4, 5, 6)));
$.swap($state, o.assignEnergy("speed"));
$.swap($state, o.assignEnergy("attack"));
$.swap($state, o.assignEnergy("defense"));

