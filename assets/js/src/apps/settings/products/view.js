var SettingsView = require('lib/config/settings-view');
var App = require('lib/config/application');
var Tooltip = require('lib/behaviors/tooltip');
var bb = require('backbone');
var TabsView = require('./tabs/list');
var Mn = require('backbone.marionette');

var View = SettingsView.extend({

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  initialize: function(){
    var self = this;

    // nest tabs attribute => collection
    this._tabs = new bb.Collection(this.model.get('tabs'));
    this._tabs.comparator = 'order';
    this._tabs.sort();

    this.listenTo(this._tabs, 'change remove', function(){
      self.model.set({ tabs: [] }, { silent: true }); // clear first, deep model
      self.model.set({ tabs: self._tabs.toJSON() }, { silent: true });
    });

    this.listenTo(this.model, 'sync', function(model, resp){
      resp = resp || {};
      self._tabs.reset(resp.tabs); // use raw response, deep model leaves empty array values
    });
  },

  onShow: function(){
    var view = new TabsView({
      _template  : this.$('#wc_pos-product-tabs').html(),
      collection : this._tabs
    });

    this._rm = new Mn.RegionManager({
      regions: { 'tabs': '#wc_pos-product-tabs' }
    });

    this._rm.get('tabs').show(view);
  },

  onDestroy: function(){
    this._rm.removeRegion('tabs');
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Products.View', View);