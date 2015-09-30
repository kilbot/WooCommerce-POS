var Route = require('lib/config/route');
var App = require('lib/config/application');
var Layout = require('./layout');
var Status = require('./views/status');
var $ = require('jquery');
var _ = require('lodash');
//var Modernizr = global['Modernizr'];
var Radio = require('backbone.radio');
var polyglot = require('lib/utilities/polyglot');
//var debug = require('debug')('systemStatus');

var StatusRoute = Route.extend({

  databases: ['products', 'orders', 'cart'],

  initialize: function(options){
    this.container = options.container;
    this.collection = options.collection;
    this.setTabLabel({
      tab   : 'right',
      label : polyglot.t('titles.system-status')
    });

    this.ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    this.nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });
  },

  fetch: function(){
    // if not fetched, need to fetch all local records
    var fetched = _.map(this.databases, this.fetchDB, this);
    // add the server tests
    fetched.push( this._fetch() );
    return $.when.apply($, fetched);
  },

  _fetch: function(){
    //var self = this;
    //return $.getJSON( this.ajaxurl, {
    //  action: 'wc_pos_system_status',
    //  security: this.nonce
    //}, function( resp ){
    //  self.tests = resp;
    //});
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
      tests: this.tests,
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
          count = this[db].length,
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

  fetchDB: function(db){
    this[db] = Radio.request('entities', 'get', {
      type: 'collection',
      name: db
    });

    if(this[db].isNew()){
      return this[db].fetch();
    }
  },

  clearDB: function(db){
    var collection = this[db],
        self = this;

    collection.clear()
      .then(function(){
        self.render();
      });
  }

});

module.exports = StatusRoute;
App.prototype.set('SupportApp.Status.Route', StatusRoute);