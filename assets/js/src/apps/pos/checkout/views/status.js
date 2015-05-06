var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
//var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');
var Tmpl = require('./status.hbs');
var _ = require('lodash');

var View = ItemView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(){

  },

  templateHelpers: function(){
    return {
      status: this.getStatus(),
      message: this.getMessage()
    };
  },

  modelEvents: {
    'change:payment_details': 'render'
  },

  getStatus: function(){
    if(this.model.get('payment_details.paid') === false){
      this.$el.addClass('fail');
      return polyglot.t('titles.unpaid');
    }
    return polyglot.t('titles.to-pay');
  },

  getMessage: function(){
    var messages = this.model.get('payment_details.message');
    if( _.isArray(messages) ){
      return _.last(messages);
    }
    return messages;
  }

});

module.exports = View;
POS.attach('POSApp.Checkout.Views.Status', View);