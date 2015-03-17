var Mn = require('backbone.marionette');
var POS = require('lib/utilities/global');

module.exports = POS.CollectionView = Mn.CollectionView.extend({
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