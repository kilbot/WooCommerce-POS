var _ = require('lodash');
var Backbone = require('backbone');
//var $ = require('jquery');
//Backbone.$ = $;

// core = Marionette & helper libraries
require('core');

before(function() {
    global._ = _;
    global.Backbone = Backbone;
});

beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    //this.server = sinon.fakeServer.create();
    //this.clock = this.sandbox.useFakeTimers();
    global.stub = this.sinon.stub.bind(this.sinon);
    global.spy  = this.sinon.spy.bind(this.sinon);
});

afterEach(function() {
    this.sinon.restore();
    //this.server.restore();
});