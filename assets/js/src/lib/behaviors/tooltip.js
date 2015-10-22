var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
var hbs = require('handlebars');
var _ = require('lodash');
require('bootstrap/dist/js/umd/tooltip');
var Tmpl = require('./tooltip.hbs');

var TooltipBehavior = Behavior.extend({

  initialize: function(options){
    var namespace = App.prototype.namespace('tooltip');

    this.options = _.defaults( options, {
      template  : hbs.compile(Tmpl)()
    });

    this.ui = {
      tooltip: '*[data-toggle="' + namespace + '"]'
    };
  },

  onRender: function() {
    if( this.ui.tooltip.length > 0 ){
      this.ui.tooltip.tooltip( this.options );
    }
  }

});

module.exports = TooltipBehavior;
App.prototype.set('Behaviors.Tooltip', TooltipBehavior);