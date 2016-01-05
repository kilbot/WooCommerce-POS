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
    _.defaults( options, { collection: new TabsCollection(options.tabs) } );

    if( options.adminTabs ){
      _.defaults( options, {
        tagName: 'div',
        className: 'tabs nav-tab-wrapper',
        childViewOptions: function(){
          return {
            tagName: 'a',
            className: 'nav-tab',
            activeClassName: 'nav-tab-active',
            attributes: function(){
              return {
                href: '#' + this.model.id
              };
            }
          };
        }
      });
    }

    return new TabsView( options );
  }

});