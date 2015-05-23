var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
var Modernizr = global['Modernizr'];
var Radio = require('backbone.radio');
var $ = require('jquery');
var _ = require('lodash');

var NumpadBehavior = Behavior.extend({

  ui: {
    target: '*[data-numpad]'
  },

  events: {
    'click @ui.target'      : 'numpadPopover',
    'open:numpad @ui.input' : 'numpadPopover',
    'keyup @ui.target'      : 'closePopover'
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
    var target  = $(e.target),
        name    = target.attr('name'),
        options = _.clone( target.data() );

    // numpad
    _.defaults( options, {
      value : this.view.model.get( name )
    });

    if( _.isString( options.original ) ){
      options.original = this.view.model.get(options.original);
    }

    var numpad = Radio.request('numpad', 'view', options);

    this.listenTo(numpad, 'input', function(value){
      target.popover('hide');
      this.view.model.set( name, value, { numpadChange: true } );
    });

    // popover
    target.one('shown.bs.popover', function(){
      if(!Modernizr.touch) {
        numpad.ui.input.select();
      }
    });

    _.defaults( options, {
      target    : target,
      view      : numpad,
      parent    : this.view,
      className : 'popover popover-numpad popover-dark-bg',
      placement : 'bottom'
    });

    Radio.request('popover', 'open', options);
  },
  /* jshint +W071 */

  closePopover: function(e){
    $(e.target).popover('hide');
  }

});

module.exports = NumpadBehavior;
POS.attach('Behaviors.Numpad', NumpadBehavior);