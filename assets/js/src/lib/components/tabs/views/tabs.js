var CompositeView = require('lib/config/composite-view');
var hbs = require('handlebars');
var Tmpl = require('./tabs.hbs');
var Tab = require('./tab');
var App = require('lib/config/application');
var bb = require('backbone');
var TabsCollection = require('../entities/collection');

var Tabs = CompositeView.extend({

  template: hbs.compile(Tmpl),

  childViewContainer: '[role="tablist"]',

  childView: Tab,

  attributes: {
    'class' : App.prototype.namespace('tabs')
  },

  activeClassName: 'active',

  tabsTagName: 'ul',

  initialize: function(options){
    options = options || {};

    // store options
    this.mergeOptions(options, [
      'tabsTagName',     // childViewContainer tagName
      'tabsClassName',   // childViewContainer tagName
      'activeId',        // current active model id
      'activeClassName', // className for active tab
      'label'            // label string or function
    ]);

    //
    if( options.collection instanceof bb.Collection ){
      return;
    }

    this.collection = new TabsCollection( options.collection );
  },

  templateHelpers: function(){
    return {
      tabsTagName: this.tabsTagName,
      tabsClassName: this.tabsClassName
    };
  },

  /**
   * Pick options to pass to childview
   */
  childViewOptions: function( model ){
    // pass default options
    var options = {
      activeClassName : 'active'
    };

    // pass label options
    if( this.label ){
      options.label = this.label;
    }

    // init with active class
    if( this.activeId === model.id ){
      options.className = this.activeClassName;
    }

    return options;
  },

  /**
   * On child click, toggle active class
   */
  childEvents: {
    click: function( activeView ){
      this.children.each(function( childView ){
        if( childView === activeView ){
          return childView.$el.addClass( this.activeClassName );
        }
        childView.$el.removeClass( this.activeClassName );
      }, this);
    }
  },

  /**
   * Helper function to set label
   */
  setLabel: function(options){
    options = options || {};
    var model = this.collection.get( options.tab );
    model.set({ label: options.label });
  }

});

module.exports = Tabs;
App.prototype.set('Components.Tabs.View', Tabs);