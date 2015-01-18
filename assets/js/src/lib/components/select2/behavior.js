var Behavior = require('lib/config/behavior');
var _ = require('lodash');
var POS = require('lib/utilities/global');

module.exports = POS.Behaviors.Select2 = Behavior.extend({

  initialize: function(options){
    this.options = _.defaults(options, {
      query           : _.bind( this.view.query, this.view ),
      formatResult    : _.bind( this.view.formatResult, this.view ),
      formatSelection : _.bind( this.view.formatSelection, this.view )
    });
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
  }

});