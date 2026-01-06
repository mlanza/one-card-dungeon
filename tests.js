import { assert, assertEquals } from "jsr:@std/assert";
import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import * as eff from "./libs/effects.js";
import * as o from "./ocd.js";

let n = 0;

function tee(state){
  n++;
  console.log(n, {state})
  return state;
}

const game = _.pipe(
  o.init,
  o.energize(eff.rolling(4, 5, 6)),
  $.tee(state => console.log({state})), //I already had `tee`!  It's side effecting, thus the `$`.
  $.see("rolling(4, 5, 6) =>"), //like `tee` but provides the label directly
  o.assignEnergy("speed"),
  $.see("assignEnergy(speed) =>"),
  o.assignEnergy("attack"),
  $.see("assignEnergy(attack) =>"),
  o.assignEnergy("defense"),
  tee);

const reality = game("paladin", 3); //someday parameters do nothing right now

//Notice how similar the following chain for `run2` is to the `game` pipe.
const alternateReality = _.chain(o.init("paladin", 3), //<= this is the only difference.
  o.energize(eff.rolling(4, 5, 6)),
  $.tee(state => console.log({state})), //I already had tee!
  $.see("rolling(4, 5, 6) =>"), //see is like tee but provides the label outright
  o.assignEnergy("speed"),
  $.see("assignEnergy(speed) =>"),
  o.assignEnergy("attack"),
  $.see("assignEnergy(attack) =>"),
  o.assignEnergy("defense"),
  tee);

console.log({reality, alternateReality});

Deno.test("the representations of reality are not the same object", function(){
  assert(reality !== alternateReality); //referential comparison
});

Deno.test("the representations of reality are structurally identical", function(){
  assert(_.eq(reality, alternateReality)); //eq compares by value, based on structure not reference
});

Deno.test("the energy dice are depleted", function(){
  const {energy} = reality;
  assertEquals(energy.length, 0);
});
