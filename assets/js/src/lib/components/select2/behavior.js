var Behavior = require('lib/config/behavior');
var _ = require('lodash');
var POS = require('lib/utilities/global');

module.exports = POS.Behaviors.Select2 = Behavior.extend({

  initialize: function(options){
    options = options || {};
    var defaults = {};
    var methods = [
      'query',
      'initSelection',
      'formatResult',
      'formatSelection'
    ];

    _(methods).each(function(method){
      if( this.view[method] ){
        options[method] = _.bind(this.view[method], this.view);
      }
      defaults[method] = this[method];
    }, this);

    this.options = _.defaults(options, defaults);
  },

  ui: {
    select: '.select2'
  },

  onRender: function() {
    if(this.ui.select.hasClass('no-search')) {
      this.options.dropdownCssClass = 'no-search';
    }
    this.ui.select.select2( this.options );
  },

  onBeforeDestroy: function() {
    this.ui.select.select2( 'destroy' );
  },

  query: function(){},
  initSelection: function(){},
  formatResult: function(){},
  formatSelection: function(){}

});