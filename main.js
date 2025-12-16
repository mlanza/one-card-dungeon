import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import {reg} from "./libs/cmd.js";
import * as o from "./ocd.js";

const $state = $.atom(null);

reg({$state});
