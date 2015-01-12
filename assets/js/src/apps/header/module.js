var Module = require('lib/config/module');
var Views = require('./views');

module.exports = Module.extend({
  initialize: function() {
    this.channel = Backbone.Radio.channel('header');
  },

  onStart: function(){
    var header = new Views.Header({ el: $('#header') });
    var menu = new Views.Menu({ el: $('#menu') });

    this.channel.comply({
      'open:menu': header.openMenu,
      'close:menu': header.closeMenu
    }, header);
  }
});
//
//addTabs: function( layout ) {
//
//  // get tabs component
//  var view = POS.Components.Tabs.channel.request( 'get:tabs', [
//    { value: 'left' }, { value: 'right' }
//  ]);
//
//  // listen to tab changes
//  this.listenTo( view.collection, 'change:active', function( tab ){
//    this.$el
//        .removeClass('left-active right-active')
//        .addClass( tab.id + '-active' );
//  });
//
//  // update tab labels
//  POS.channel.comply( 'update:tab:label', function( label, column ){
//    view.collection.get(column).set({ label: label });
//  });
//
//  // init tabs
//  view.collection.get('left').set({ active: true });
//  POS.layout.tabsRegion.show(view);
//
//  // teardown
//  this.on( 'empty', function() {
//    this.$el.removeClass('two-column left-active right-active');
//    POS.layout.tabsRegion.empty();
//  });
//
//}