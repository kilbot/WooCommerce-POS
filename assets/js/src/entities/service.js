var Service = require('lib/config/service');
var Products = require('./products/collection');
var Orders = require('./orders/collection');
var Cart = require('./cart/collection');
var Customers = require('./customers/collection');
var Coupons = require('./coupons/collection');
var Settings = require('./settings/model');
var SettingsCollection = require('./settings/collection');
var Gateways = require('./gateways/collection');
var Variations = require('./variations/collection');
var FilteredCollection = require('lib/config/filtered-collection');
var SupportForm = require('./support/form');
var debug = require('debug')('entities');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var _ = require('lodash');
var storage = global.localStorage || window.localStorage;
var JSON = global.JSON || window.JSON;

module.exports = POS.Entities = Service.extend({
  channelName: 'entities',

  initialize: function() {
    this.channel.reply('get', this.get, this);
    this.channel.comply('set', this.set, this);
    this.channel.comply('remove', this.remove, this);
    this.channel.comply('set:filter', this.setFilter, this);
    this.channel.comply('add:to:cart', this.addToCart, this);
  },

  collections: {
    products  : Products,
    orders    : Orders,
    cart      : Cart,
    customers : Customers,
    coupons   : Coupons,
    gateways  : Gateways,
    variations: Variations,
    settings  : SettingsCollection
  },

  models: {
    supportForm : SupportForm
  },

  getMethods: {
    collection  : 'getCollection',
    model       : 'getModel',
    filtered    : 'getFiltered',
    option      : 'getOption',
    settings    : 'getSettings',
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
    return this.app.getOption(options.name);
  },

  /**
   * settings are App options that can be changed by the user
   * eg: HotKeys are bootstrapped as start options, but also
   * can be updated through the POS
   */
  getSettings: function(options){
    var option = this.app.getOption(options.name);
    return new Settings(option);
  },

  setFilter: function(options){
    options = options || {};
    var filteredProp = '_filtered' + options.name;
    if( this[filteredProp] ){
      this[filteredProp].filterBy('search', options.filter);
    }
  },

  /**
   * todo: improve this!
   * - it should only add to cart of cartRoute is active
   * - save order to make sure it has a local_id
   * - make sure cart is ready
   */
  addToCart: function(options) {
    if(!this.app.posApp._currentRoute.cartRoute){
      return;
    }
    var order = this.getCollection({ name: 'orders' }).getActiveOrder();
    $.when(order.cart._isReady, order.save()).then(function(cart) {
      cart.order_id = order.id;
      cart.addToCart(options);
    });
  },

  getLocalStorage: function(options){
    options = options || {};
    var string = storage.getItem('wc_pos_' + options.name);
    var obj = JSON.parse(string) || undefined;
    if(options.key && obj && obj[options.key]){
      return obj[options.key];
    }
    return obj;
  },

  setLocalStorage: function(options){
    options = options || {};
    var data = this.getLocalStorage({name: options.name}) || {};
    if(_.isObject(data)){
      _.extend(data, options.data);
    } else {
      data = options.data;
    }
    storage.setItem('wc_pos_' + options.name, JSON.stringify(data));
  },

  remove: function(options){
    options = options || {};
    if(options.type === 'localStorage' && options.name && options.key){
      var data = this.getLocalStorage({name: options.name});
      delete data[options.key];
      storage.setItem('wc_pos_' + options.name, JSON.stringify(data));
    } else {
      storage.removeItem('wc_pos_' + options.name);
    }
  }

});