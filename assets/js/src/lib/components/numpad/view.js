var FormView = require('lib/config/form-view');
var Tmpl = require('./numpad.hbs');
var hbs = require('handlebars');
var POS = require('lib/utilities/global');
var accounting = require('accounting');

var View = FormView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(options){
    options = options || {};
    this.target = options.target;
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

  templateHelpers: function(){
    var data = {
      label: this.target.data('label'),
      currency: {
        symbol: accounting.settings.currency.symbol,
        decimal: accounting.settings.currency.decimal
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