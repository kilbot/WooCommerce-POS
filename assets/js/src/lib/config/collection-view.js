var Mn = require('backbone.marionette');
var app = require('./application');

module.exports = app.prototype.CollectionView = Mn.CollectionView.extend({
  //// Marionette's default implementation ignores the index, always
  //// appending the new view to the end. Let's be a little more clever.
  //appendHtml: function(collectionView, itemView, index){
  //  if (!index) {
  //    collectionView.$el.prepend(itemView.el);
  //  } else {
  //    $(collectionView.$('li')[index - 1]).after(itemView.el);
  //  }
  //}
});