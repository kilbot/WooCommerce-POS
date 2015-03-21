var Service = require('lib/config/service');
var TabsView = require('./views/tabs');
var TabsCollection = require('./entities/collection');
var _ = require('lodash');

module.exports = Service.extend({
  channelName: 'tabs',

  initialize: function (){
    this.channel.reply({
      'view' : this.tabsView
    }, this);
  },

  /**
   * returns an instance of the tabs view
   */
  tabsView: function(options){
    options = options || {};
    return new TabsView({
      collection: this.tabsCollection(options)
    });
  },

  /**
   *
   */
  tabsCollection: function(options){
    return new TabsCollection(options.tabs);
  }

});