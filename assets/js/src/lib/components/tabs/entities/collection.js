var Collection = require('lib/config/collection');
var Model = require('./model');
var App = require('lib/config/application');

var Tabs = Collection.extend({

  model: Model

  //initialize: function(){
  //  this.on({
  //    'change:active' : this.onChangeActive,
  //    'remove'        : this.ensureActiveTab
  //  });
  //},
  //
  //onChangeActive: function(model, active){
  //  if(!active){ return; }
  //  this.each(function(m) {
  //    m.set({active: m === model});
  //  });
  //  this.trigger('active:tab', model);
  //},
  //
  //ensureActiveTab: function() {
  //  var activeTabs = this.where({ 'active': true });
  //  if( this.length > 0 && activeTabs.length === 0 ) {
  //    this.at(0).set({ active: true });
  //  }
  //}

});

module.exports = Tabs;
App.prototype.set('Components.Tabs.Collection', Tabs);