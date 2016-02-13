var Behavior = require('lib/config/behavior');
var _ = require('lodash');
var $ = require('jquery');
var TetherDrop = require('tether-drop');
var App = require('lib/config/application');
var namespace = App.prototype.namespace('tooltip');

var Drop = TetherDrop.createContext({
  classPrefix: namespace
});

var defaults = {
  position: 'top center',
  openOn: 'hover',
  classes: namespace + '-theme-arrows',
  constrainToWindow: true,
  constrainToScrollParent: false,
  remove: true
};

var TooltipBehavior = Behavior.extend({

  _initialized: [],

  initialize: function(options){
    this.options = _.extend({}, defaults, options);

    // define ui
    this.ui = {
      tooltip: '*[data-toggle="' + namespace + '"]'
    };
  },

  events: {
    'mouseenter @ui.tooltip': 'onHover'
  },

  onHover: function(e){
    if(this._initialized.indexOf(e.target) !== -1) {
      return;
    }

    // drop instance
    var options = _.extend({}, this.options, {
      target  : e.target,
      content : $(e.target).attr('title')
    });
    var drop = new Drop(options);
    this._initialized.push(e.target);

    // remove the title attribute to prevent browser hover
    $(e.target).removeAttr('title');

    drop.open();
  }

});

module.exports = TooltipBehavior;
App.prototype.set('Behaviors.Tooltip', TooltipBehavior);