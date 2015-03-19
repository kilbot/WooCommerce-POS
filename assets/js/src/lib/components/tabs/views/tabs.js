var CollectionView = require('lib/config/collection-view');
var Tab = require('./tab');

var View = CollectionView.extend({
  tagName: 'ul',
  childView: Tab,
  attributes: {
    'role': 'tablist'
  },

  setActive: function(id){
    var model = this.collection.get(id);
    model.set({active: true});
  },

  setLabel: function(options){
    options = options || {};
    var model = this.collection.get(options.tab);
    model.set({label: options.label});
  },

  onShow: function(){
    // last call for active tabs
    this.collection.ensureActiveTab();
  }
});

module.exports = View;