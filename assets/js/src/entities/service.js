var Service = require('lib/config/service');
var Products = require('./products/collection');
var Orders = require('./orders/collection');
var Cart = require('./cart/collection');
var Customers = require('./customers/collection');
var Coupons = require('./coupons/collection');
var Settings = require('./settings/collection');
var Gateways = require('./gateways/collection');
var FilteredCollection = require('lib/config/obscura');
var debug = require('debug')('entities');
var App = require('lib/config/application');
var _ = require('lodash');
var Radio = require('backbone.radio');
var storage = global.localStorage || window.localStorage;
var JSON = global.JSON || window.JSON;

var EntitiesService = Service.extend({
  channelName: 'entities',

  initialize: function() {
    this.channel.reply('get', this.get, this);
    this.channel.reply('set', this.set, this);
    this.channel.reply('remove', this.remove, this);
    this.channel.reply('set:filter', this.setFilter, this);
  },

  collections: {
    products  : Products,
    orders    : Orders,
    cart      : Cart,
    customers : Customers,
    coupons   : Coupons,
    gateways  : Gateways,
    settings  : Settings
  },

  getMethods: {
    collection  : 'getCollection',
    model       : 'getModel',
    filtered    : 'getFiltered',
    option      : 'getOption',
    localStorage: 'getLocalStorage'
  },

  setMethods: {
    localStorage: 'setLocalStorage'
  },

  get: function(options){
    options = options || {};
    var method = this.getMethods[options.type];
    if( this[method] ){
      return this[method](options);
    }
    debug('request needs a type, eg: "collection" or "option"');
  },

  set: function(options){
    options = options || {};
    var method = this.setMethods[options.type];
    if( this[method] ){
      return this[method](options);
    }
    debug('set needs a type, eg: "localStorage"');
  },

  /**
   * init a new collection, attach to this and return a reference
   */
  attach: function(options){
    var type = options.type === 'model' ? 'models' : 'collections',
        prop = '_' + options.name;
    if( this[type].hasOwnProperty(options.name) ){
      this[prop] = new this[type][options.name]([], options);
    }
    return this[prop];
  },

  /**
   * return a reference to the collection
   */
  getCollection: function(options){
    var prop = '_' + options.name;
    if( options.init ) {
      return new this.collections[options.name]([], options);
    }
    return ( this[prop] || this.attach(options) );
  },

  getAllCollections: function(){
    return _.reduce( this.collections, function(result, col, key){
      result[key] = this.getCollection({ name: key });
      return result;
    }, {}, this);
  },

  getModel: function(options){
    var prop = '_' + options.name;
    if( options.init ) {
      return new this.models[options.name]([], options);
    }
    return ( this[prop] || this.attach(options) );
  },

  /**
   * return a filtered collection and attach to this
   */
  getFiltered: function(options){
    var prop = '_' + options.name;
    var filteredProp = '_filtered' + options.name;
    if( this[filteredProp] ){ return this[filteredProp]; }
    if( !this[prop] ){ this.attach(options); }

    this[filteredProp] = new FilteredCollection(this[prop], options);
    return this[filteredProp];
  },

  /**
   * return an option set during app.start(options)
   */
  getOption: function(options){
    return _.get( this.options, options.name );
  },

  setFilter: function(options){
    options = options || {};
    var filteredProp = '_filtered' + options.name;
    if( this[filteredProp] ){
      this[filteredProp].filterBy('search', options.filter);
    }
  },

  serialize: function(value){
    return JSON.stringify(value);
  },

  deserialize: function(value){
    try { value = JSON.parse(value); }
    catch(e) { debug(e); }
    return value || undefined;
  },

  /* jshint -W071 */
  getLocalStorage: function(options){
    options = options || {};
    var data;

    try {
      data = storage.getItem('wc_pos_' + options.name);
    } catch (error) {
      return Radio.channel('global', 'error', error);
    }

    var obj = this.deserialize(data);
    if(options.key && obj && obj[options.key]){
      return obj[options.key];
    }

    return obj;
  },
  /* jshint +W071 */

  setLocalStorage: function(options){
    options = options || {};
    var data = options.data;
    var old = this.getLocalStorage({name: options.name});

    if( _.isObject(old) && _.isObject(data) ){
      data = _.extend(old, data);
    }

    try {
      storage.setItem('wc_pos_' + options.name, this.serialize(data));
    } catch (error) {
      return Radio.channel('global', 'error', error);
    }
  },

  /* jshint -W071, -W074 */
  remove: function(options){
    options = options || {};

    if(options.type === 'localStorage' && options.name && options.key){
      var data = this.getLocalStorage({name: options.name});
      delete data[options.key];

      try {
        storage.setItem('wc_pos_' + options.name, JSON.stringify(data));
      } catch (error) {
        return Radio.channel('global', 'error', error);
      }

    } else {

      try {
        storage.removeItem('wc_pos_' + options.name);
      } catch (error) {
        return Radio.channel('global', 'error', error);
      }

    }

  },
  /* jshint +W071, +W074 */

  idbCollections: function(){
    return _.reduce( this.getAllCollections(), function(result, col, key){
      if( col instanceof App.IndexedDBCollection ){
        result[key] = col;
      }
      return result;
    }, {}, this);
  }

});

module.exports = EntitiesService;
App.prototype.set('Entities.Service', EntitiesService);