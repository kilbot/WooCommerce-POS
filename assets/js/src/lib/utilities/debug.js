var bb = require('backbone');
var _ = require('lodash');
var POS = require('./global');

var debug = false;

// use localStorage to turn debugging on/off
var flag = localStorage.getItem('wc_pos_debug');

// if flag, turn on
if( flag !== null ){
  debug = true;
  bb.Radio.DEBUG = true;
}

function Debug(){
  this.on = debug;
  this.log = function(message, type, force){
    var on = force || this.on;
    if( ! on ) { return; }
    if( typeof console[type] !== 'function' ) { type = 'log'; }
    console[type](message);
  };
  this.welcome = function(){
    console.info(
        'Debugging is ' +
        ( this.on ? 'on' : 'off' )  +
        ', visit http://woopos.com.au/docs/debugging'
    );
  };
}
var debug = new Debug();

// print welcome message
debug.welcome();

module.exports = POS.debugLog = _.bind(debug.log, debug);