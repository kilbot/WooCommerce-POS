var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var _ = require('lodash');

var View = ItemView.extend({
  template: 'pagination',

  //ui: {
  //  prev    : '.prev',
  //  next    : '.next'
  //},
  //
  //events: {
  //  'click @ui.prev': 'onPrev',
  //  'click @ui.next': 'onNext'
  //},

  // todo: improve this
  collectionEvents: {
    'add remove paginated:change:page paginated:change:numPages reset':
      _.debounce(function(){
        if(!this.isDestroyed){
          this.render();
        }
      }, 10)
  },

  initialize: function(){
    this.listenTo(this.collection.superset(), {
      'count': this.render
    });
  },

  templateHelpers: function(){
    return {
      showing : this.collection.length,
      local   : _.max([this.collection.superset().db.length, this.collection.length])
    };
  }

  //onRender: function() {
  //  this.$('.current').text(this.collection.getPage() + 1);
  //  this.$('.total').text(this.collection.getNumPages());
  //  this.$('.prev').prop('disabled', !this.collection.hasPrevPage());
  //  this.$('.next').prop('disabled', !this.collection.hasNextPage());
  //},

  //onPrev: function() {
  //  if (this.collection.hasPrevPage()) {
  //    this.collection.prevPage();
  //  }
  //},
  //
  //onNext: function() {
  //  if (this.collection.hasNextPage()) {
  //    this.collection.nextPage();
  //  }
  //}
});

module.exports = View;
App.prototype.set('Components.Pagination.View', View);