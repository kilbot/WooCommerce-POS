var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var Layout = require('./layout');
var Status = require('./status');
var $ = require('jquery');
var _ = require('lodash');
var Modernizr = global['Modernizr'];
var Radio = require('backbone.radio');
var polyglot = require('lib/utilities/polyglot');
var debug = require('debug')('systemStatus');

var StatusRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;
    this.collection = options.collection;

    var label = $('#tmpl-pos-status').data('title');
    Radio.command('header', 'update:tab', {id: 'right', label: label});
  },

  fetch: function(){
    this.products = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'products'
    });

    if(this.products.isNew()){
      return this.products.fetch();
    }
  },

  render: function(){
    this.layout = new Layout();

    this.listenTo(this.layout, 'show', function(){
      this.showStatus();
    });

    this.container.show(this.layout);
  },

  showStatus: function(){
    this.collection.reset();
    this.collection.add( this.browserStatus() );
    this.collection.add( this.storageStatus() );

    var view = new Status({
      collection: this.collection
    });

    this.listenTo(view, 'action:clear', this.clearDB);

    this.layout.status.show( view );
  },

  browserStatus: function(){
    var props = ['flexbox', 'indexeddb', 'localstorage'],
      result = [];

    _.each(props, function(prop){
      result.push({
        test: Modernizr[prop],
        message: Modernizr[prop] === true ?
        '<span class="pass">' + prop + '</span>' :
        '<span class="fail">no-' + prop + '</span>'
      });
    });

    return {
      icon    : _(result).pluck('test').every() ? 'check' : 'times',
      title   : polyglot.t('titles.browser'),
      message : _(result).pluck('message').join(', ')
    };
  },

  storageStatus: function(){
    var title = polyglot.t('titles.products'),
      count = this.products.length,
      message = title + ': ' + count;
    return {
      message : message,
      button  : {
        action: 'clear-products',
        label : 'Clear'
      }
    };
  },

  clearDB: function(db){
    var collection = this[db],
        self = this;
    collection.indexedDB.clear(function(){
      collection.reset();
      self.render();
    },function(){
      debug('Could not clear ' + db, arguments);
    });
  }

});

module.exports = StatusRoute;
POS.attach('SupportApp.Status.Route', StatusRoute);