var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');
var $ = require('jquery');
var _ = require('lodash');
var bb = require('backbone');

var View = ItemView.extend({

  template: 'modals.email-receipt',

  modal: {
    header: {
      title: polyglot.t('titles.email-receipt')
    },
    footer: {
      buttons: [
        {
          type: 'message'
        }, {
          action: 'send',
          icon: 'prepend'
        }, {
          action: 'send-close',
          className: 'btn-success',
          icon: 'prepend'
        }
      ]
    }
  },

  initialize: function(options){
    this.model = new bb.Model({ email: _.get(options, 'email') });

    this.modal = {
      header: {
        title: polyglot.t('titles.email-receipt')
      },
      footer: {
        buttons: [
          {
            type: 'message'
          }, {
            action: 'send',
            icon: 'prepend'
          }, {
            action: 'send-close',
            className: 'btn-success',
            icon: 'prepend'
          }
        ]
      }
    };
  },

  onRender: function() {
    var self = this;

    // bind ordinary elements
    this.$('input, select, textarea').each(function () {
      var name = $(this).attr('name');
      if (name) {
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });
  }

});

module.exports = View;
App.prototype.set('POSApp.Receipt.Views.Email', View);