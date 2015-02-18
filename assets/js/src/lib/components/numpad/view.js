var FormView = require('lib/config/form-view');
var Tmpl = require('./numpad.hbs');
var hbs = require('handlebars');
var POS = require('lib/utilities/global');
var accounting = require('accounting');
var AutoGrow = require('lib/components/autogrow/behavior');

var View = FormView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(options){
    options = options || {};
    this.target = options.target;
    this.bindings = options.parent.bindings;
  },

  ui: {
    input : '.numpad-header input',
    toggle: '.numpad-header .btn',
    keys  : '.numpad-keys .btn'
  },

  events: {
    'click @ui.input' : 'input',
    'click @ui.toggle': 'toggle',
    'click @ui.keys'  : 'keys'
  },

  behaviors: {
    AutoGrow: {
      behaviorClass: AutoGrow
    }
  },

  templateHelpers: function(){
    var data = {
      numpad: this.target.data('numpad'),
      label : this.target.data('label'),
      name  : this.target.attr('name'),
      currency: {
        symbol  : accounting.settings.currency.symbol,
        decimal : accounting.settings.currency.decimal
      }
    };

    return data;
  },

  input: function(e){
    console.log(e);
  },

  toggle: function(e){
    e.preventDefault();
    console.log(e);
  },

  keys: function(e){
    e.preventDefault();
    console.log(e);
  }

});

module.exports = View;
POS.attach('Components.Numpad.View', View);