var FormView = require('lib/config/form-view');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var hbs = require('handlebars');
var Buttons = require('lib/components/buttons/behavior');

var View = FormView.extend({
  attributes: {
    id: 'wc-pos-settings-access'
  },

  initialize: function() {
    this.template = function(){
      return $('script[data-id="access"]').html();
    };
  },

  ui: {
    tabs    : '.wc-pos-access-tabs > li',
    options : '.wc-pos-access-panel > li'
  },

  events: {
    'click @ui.tabs' : 'onTabClick'
  },

  behaviors: {
    Buttons: {
      behaviorClass: Buttons
    }
  },

  onRender: function(){
    var self = this;

    // bind ordinary elements
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });

    // init the first tab
    this.ui.tabs.first().addClass('active');
    this.ui.options.first().addClass('active');
  },

  onTabClick: function(e){
    this.ui.tabs.each(function(){
      $(this).removeClass('active');
    });
    this.ui.options.each(function(){
      $(this).removeClass('active');
    });
    $(e.currentTarget).addClass('active');
    var option = $(e.currentTarget).data('id');
    $('#' + option).addClass('active');
  }

});

module.exports = View;
POS.attach('SettingsApp.Access.View');