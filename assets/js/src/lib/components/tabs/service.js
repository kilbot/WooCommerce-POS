var Service = require('lib/config/service');
var TabsView = require('./views/tabs');
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

    if( options.adminTabs ){
      _.defaults( options, {
        tagName: 'div',
        className: 'nav-tab-wrapper',
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

    if( options.adminSubTabs ){
      _.defaults( options, {
        className: 'wc_pos-sub-nav-tab-wrapper',
        childViewOptions: function(){
          return {
            className: 'wc_pos-sub-nav-tab',
            activeClassName: 'wc_pos-sub-nav-tab-active'
          };
        }
      });
    }

    return new TabsView( options );
  }

});