var ItemView = require('lib/config/item-view');
var _ = require('lodash');
var $ = require('jquery');
var Backbone = require('backbone');

module.exports = ItemView.extend({
  template: _.template( $('#tmpl-gateway-settings-modal').html() ),

  behaviors: {
    Modal: {
      behaviorClass: require('lib/components/modal/behavior')
    },
    Tooltip: {
      behaviorClass: require('lib/components/tooltip/behavior')
    }
  },

  initialize: function (options) {
    this.trigger('modal:open');
  },

  modelEvents: {
    'change': 'render'
  },

  events: {
    'click .save' : 'save',
    'click .close' : 'cancel'
  },

  onBeforeShow: function() {
    Backbone.Syphon.deserialize( this, this.model.toJSON() );
  },

  save: function() {
    var data = Backbone.Syphon.serialize( this );
    this.model.set( data );
    this.model.save();
  },

  cancel: function () {
    this.trigger('modal:close');
  }

});