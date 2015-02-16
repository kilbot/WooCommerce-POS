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

module.exports = POS.Entities = Service.extend({
  channelName: 'entities',

  initialize: function() {
    this.channel.reply('get', this.get, this);
    this.channel.reply('set', this.set, this);
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

  methods: {
    collection  : 'getCollection',
    model       : 'getModel',
    filtered    : 'getFiltered',
    option      : 'getOption',
    settings    : 'getSettings'
  },

  get: function(options){
    options = options || {};
    var method = this.methods[options.type];
    if( this[method] ){
      return this[method](options);
    }
    debug('request needs a type, eg: "collection" or "option"');
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

  addToCart: function(options) {
    var order = this.getCollection({ name: 'orders' }).getActiveOrder();
    $.when(order.cart._isReady).then(function() {
      order.cart.addToCart(options);
    });
  }

});