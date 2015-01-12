var Module = require('lib/config/module');
var Router = require('./router');

module.exports = Module.extend({
  initialize: function() {
    this.channel = Backbone.Radio.channel('support');
    this.router = new Router(this.options);
  }
});