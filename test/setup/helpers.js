var _ = require('lodash');
var Backbone = require('backbone');
Backbone.Radio = require('backbone.radio');

require('core');

before(function() {
    global._ = _;
    global.Backbone = Backbone;
});

beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    global.stub = this.sinon.stub.bind(this.sinon);
    global.spy  = this.sinon.spy.bind(this.sinon);
});

afterEach(function() {
    this.sinon.restore();
    Backbone.history.stop();
});