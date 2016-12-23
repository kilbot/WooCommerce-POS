var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
var Radio = require('backbone.radio');
var View = require('./view');
var $ = require('jquery');
var _ = require('lodash');

var NumpadBehavior = Behavior.extend({

  ui: {
    target: '*[data-numpad]'
  },

  events: {
    'click @ui.target'      : 'numpadPopover',
    'open:numpad @ui.input' : 'numpadPopover'
  },

  onRender: function() {
    if(window.Modernizr.touch) {
      this.ui.target.each(function(){
        if( $(this).is('input') ){
          $(this).attr('readonly', true);
        }
      });
    }
  },

  numpadPopover: function(e){
    var name    = $(e.target).attr('name'),
        options = _.clone( $(e.target).data() );

    // numpad
    _.defaults( options, {
      value : this.view.model.get( name )
    });

    if( _.isString( options.original ) ){
      options.original = this.view.model.get(options.original);
    }

    var numpad = new View(options);

    this.listenTo(numpad, 'input', function(value){
      Radio.request('popover', 'close');
      this.view.model.set( name, value, { numpadChange: true } );
    });

    // popover
    this._numpadPopover(numpad, options, e.target);
  },

  _numpadPopover: function(numpad, options, target){
    _.defaults( options, {
      target : target,
      view   : numpad,
      classes: 'popover-theme-arrows popover-numpad',
      tetherOptions: {
        constraints: [{
          to: 'window',
          pin: true
        }]
      }
    });

    Radio.request('popover', 'open', options);

    // @todo: remove this hack, popover & numpad should be uncoupled
    numpad.$('input').focus().select();
  }

});

module.exports = NumpadBehavior;
App.prototype.set('Behaviors.Numpad', NumpadBehavior);