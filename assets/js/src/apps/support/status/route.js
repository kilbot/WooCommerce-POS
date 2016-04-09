var Route = require('lib/config/route');
var App = require('lib/config/application');
var Layout = require('./layout');
var Status = require('./views/status');
var _ = require('lodash');
var Radio = require('backbone.radio');
var polyglot = require('lib/utilities/polyglot');

var StatusRoute = Route.extend({

  databases: ['products', 'orders', 'customers'],

  counts: {},

  initialize: function(options){
    this.container = options.container;
    this.collection = options.collection;
    this.setTabLabel( polyglot.t('titles.system-status') );
  },

  fetch: function(){
    var counts = _.map(this.databases, this.getCount, this);
    return Promise.all(counts);
  },

  render: function(){
    this.layout = new Layout();

    this.listenTo(this.layout, 'show', function(){
      this.showStatus();
    });

    this.container.show(this.layout);
  },

  showStatus: function(){
    var view = new Status({
      storage: this.storageStatus()
    });

    this.listenTo(view, {
      'action:clear'  : this.clearDB
    });

    this.layout.getRegion('status').show( view );
  },

  storageStatus: function(){
    return _.map(this.databases, function(db){
      var title = polyglot.t('titles.' + db),
          count = this[db].db.length,
          message = title + ': ' + count + ' ' +
            polyglot.t('plural.records', count);
      return {
        message : message,
        button  : {
          action: 'clear-' + db,
          label : 'Clear'
        }
      };
    }, this);
  },

  getCount: function(db){
    this[db] = Radio.request('entities', 'get', {
      type: 'collection',
      name: db
    });

    return this[db].count();
  },

  clearDB: function(db){
    var collection = this[db],
        self = this;

    collection.destroy()
      .then(function(){
        return self.render();
      });
  }

});

module.exports = StatusRoute;
App.prototype.set('SupportApp.Status.Route', StatusRoute);