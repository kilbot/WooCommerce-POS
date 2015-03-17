var ItemView = require('lib/config/item-view');

var Pagination = ItemView.extend({
  template: function(){
    return '<button class="topcoat-button--quiet prev">Prev</button>' +
      '<span class="current"></span> / <span class="total"></span> ' +
      '<button class="topcoat-button--quiet next">Next</button>';
  },

  events: {
    'click .prev': 'onPrev',
    'click .next': 'onNext'
  },

  collectionEvents: {
    'paginated:change:page': 'onRender',
    'paginated:change:numPages': 'onRender'
  },

  onRender: function() {
    this.$('.current').text(this.collection.getPage() + 1);
    this.$('.total').text(this.collection.getNumPages());
    this.$('.prev').prop('disabled', !this.collection.hasPrevPage());
    this.$('.next').prop('disabled', !this.collection.hasNextPage());
  },

  onPrev: function() {
    if (this.collection.hasPrevPage()) {
      this.collection.prevPage();
    }
  },

  onNext: function() {
    if (this.collection.hasNextPage()) {
      this.collection.nextPage();
    }
  }
});

module.exports = Pagination;