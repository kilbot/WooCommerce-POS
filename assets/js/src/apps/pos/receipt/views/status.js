var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var hbs = require('handlebars');
//var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');
var Tmpl = require('./status.hbs');
var _ = require('lodash');

var View = ItemView.extend({

  template: hbs.compile(Tmpl),

  className: function(){
    return this.model.get('payment_details.paid') ? 'paid' : 'unpaid';
  },

  initialize: function(){
    var status = this.model.get('payment_details.paid') ? 'paid' : 'unpaid';
    this.status = polyglot.t('titles.' + status);

    var message = this.model.get('payment_details.message');
    if( _.isArray(message) ){
      this.message = _.last(message);
    } else {
      this.message = message;
    }
  },

  templateHelpers: function(){
    return {
      status: this.status,
      message: this.message
    };
  }

});

module.exports = View;
App.prototype.set('POSApp.Receipt.Views.Status', View);