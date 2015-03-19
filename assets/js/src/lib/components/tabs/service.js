var Service = require('lib/config/service');
var TabsView = require('./views/tabs');
var TabsCollection = require('./entities/collection');
var bb = require('backbone');
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
   * the tabs collection can be a simple array or bb collection
   * if collection, a proxy tabs collection will be created
   */
  tabsCollection: function(options){
    if (options.tabs instanceof bb.Collection) {
      return this.proxyCollection(options);
    }
    return new TabsCollection(options.tabs);
  },

  proxyCollection: function(options){
    var tabs = this.tabsArray(options);
    return new TabsCollection(tabs);
  },

  tabsArray: function(options){
    var tabs = options.tabs.map(function(model){
      var tab = {};
      tab.id      = this.tabId(model, options.id);
      tab.label   = this.tabLabel(model, options.label);
      tab.active  = model === options.tabs.active;
      return tab;
    }, this);

    if(options.append){
      tabs.push(options.append);
    }

    return tabs;
  },

  tabId: function(model, id){
    return model.get(id);
  },

  tabLabel: function(model, label){

    if( _.isString(label) ){
      return model.get(label);
    }

    if( _.isFunction(label) ){
      return label.call( this, model );
    }
  }

});