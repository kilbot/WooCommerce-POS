var Behavior = require('lib/config/behavior');
var $ = require('jquery');
var _ = require('lodash');
var POS = require('lib/utilities/global');

var AutoGrow = Behavior.extend({

  initialize: function(options){
    this.options = options || {};
    _.defaults(this.options, {
      padding: 20
    });

    this.tester = $('#autogrow-tester');
    if( this.tester.length === 0 ) {
      this.tester = $('<div id="autogrow-tester" />')
        .css({
          opacity     : 0,
          top         : -9999,
          left        : -9999,
          position    : 'absolute',
          whiteSpace  : 'nowrap'
        });
      $('body').append(this.tester);
    }

    this.listenTo( this.view, 'show render', this.autoGrowEach );
  },

  ui: {
    target: '.autogrow'
  },

  events: {
    'input @ui.target' : 'autoGrow'
  },

  autoGrowEach: function() {
    _.each( this.ui.target, function( target ) {
      this.autoGrow( $(target) );
    }, this);
  },

  autoGrow: function( e ) {
    var target  = e.target ? $(e.target) : e ;
    var value   = target.is('input') ? target.val() : target.text();

    value = value.replace(/&/g, '&amp;')
      .replace(/\s/g,'&nbsp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    this.tester.html(value);
    var width = this.tester.width() + this.options.padding;
    target.css({ width: width });

  }

});

module.exports = AutoGrow;
POS.attach('Behaviors.AutoGrow', AutoGrow);