var tileUrl = 'http://{s}.tile.cloudmade.com/' +
              'c4157c3f815445f4a5d9e3c55eafadc0/997/256/{z}/{x}/{y}.png';

var startLatitude = 37.7750;
var startLongitude = -122.4167;

var TableView = Backbone.View.extend({
  tagName: 'table',
  className: 'table',

  template: _.template($('#table').html()),
  rowTemplate: _.template($('#table-row').html()),
  emptyTemplate: _.template($('#empty-table').html()),

  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
  },

  render: function() {
    this.el.innerHTML = this.template();
    var tbodyEl = this.el.getElementsByTagName('tbody')[0];

    var tbody = [];
    var models = this.collection.slice(0, 20);
    _.each(models, function(model) {
      tbody.push(this.rowTemplate(model.toJSON()));
    }, this);

    if (tbody.length) {
      tbodyEl.innerHTML = tbody.join('');
    } else {
      tbodyEl.innerHTML = this.emptyTemplate();
    }
  }
});

var MapView = Backbone.View.extend({

  initialize: function() {
    // initialize map view
    this.map = L.map('map').setView([startLatitude, startLongitude], 5);
    L.tileLayer(tileUrl, {
      attribution: '',
      maxZoom: 18
    }).addTo(this.map);

    // add listener for map drag
    this.map.on('drag', _.bind(_.throttle(this.onDrag, 100), this));
    this.map.on('dragend', _.bind(this.onDrag, this));
    this.map.on('zoomend', _.bind(this.onDrag, this));
    this.onDrag();
  },

  onDrag: function(ev) {
    // get the new map boundaries and add / modify the filter
    var bounds = this.map.getBounds();
    this.collection.filterBy('lat long', function(model) {
      return (
        +model.get('latitude') > bounds.getSouth() &&
        +model.get('latitude') < bounds.getNorth() &&
        +model.get('longitude') < bounds.getEast() &&
        +model.get('longitude') > bounds.getWest()
      );
    });
  }
});

var dataCollection = new Backbone.Collection(data);
var filtered = new FilteredCollection(dataCollection);

var tableView = new TableView({
  collection: filtered,
  el: '.table'
});

var mapView = new MapView({
  collection: filtered,
  el: '#map'
});

tableView.render();
mapView.render();
