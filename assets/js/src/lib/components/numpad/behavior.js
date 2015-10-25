var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
var Modernizr = global['Modernizr'];
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
    if(Modernizr.touch) {
      this.ui.target.each(function(){
        if( $(this).is('input') ){
          $(this).attr('readonly', true);
        }
      });
    }
  },

  /* jshint -W071 */
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

    _.defaults( options, {
      target : e.target,
      view   : numpad,
      classes: 'popover-theme-arrows popover-numpad'
    });

    Radio.request('popover', 'open', options);
  }
  /* jshint +W071 */

});

module.exports = NumpadBehavior;
App.prototype.set('Behaviors.Numpad', NumpadBehavior);