var FormView = require('lib/config/form-view');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var hbs = require('handlebars');

var View = FormView.extend({

  initialize: function() {
    this.template = function(){
      return $('script[data-id="access"]').html();
    };
  },

  ui: {
    submit  : '*[data-action="save"]',
    tab     : '.wc-pos-access-panel > li'
  },

  events: {
    'click @ui.submit'  : 'onSubmit',
    'click @ui.tab'     : 'onTabClick'
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
    this.ui.tab.first().addClass('active');
  },

  onTabClick: function(e){
    this.ui.tab.each(function(tab){
      $(this).removeClass('active');
    });
    $(e.currentTarget).addClass('active');
  },

  onSubmit: function(e) {
    e.preventDefault();
    this.model.save();
  }

});

module.exports = View;
POS.attach('SettingsApp.Access.View');