var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var hbs = require('handlebars');

var View = ItemView.extend({
  template: hbs.compile($('#tmpl-pagination').html()),

  //ui: {
  //  prev    : '.prev',
  //  next    : '.next'
  //},
  //
  //events: {
  //  'click @ui.prev': 'onPrev',
  //  'click @ui.next': 'onNext'
  //},

  collectionEvents: {
    'paginated:change:page': 'render',
    'paginated:change:numPages': 'render'
  },

  initialize: function(){
    this.listenTo(this.collection.superset(), {
      'end:fullSync': this.render
    });
  },

  templateHelpers: function(){
    var queue = this.collection.superset().queue.length;
    return {
      showing : this.collection.length,
      local   : this.collection.superset().length,
      queue   : queue,
      hasQueue: queue > 0
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
POS.attach('Components.Pagination.View', View);