var Service = require('lib/config/service');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');
var debug = require('debug')('print');
var Radio = require('backbone.radio');
var POS = require('lib/utilities/global');

module.exports = Service.extend({
  channelName: 'print',

  initialize: function(){
    _.bindAll(this, 'mediaQueryListener', 'beforePrint', 'afterPrint');
    this.start();
  },

  onStart: function(){
    this.channel.reply({
      'print' : this.print
    }, this);
  },

  onStop: function(){
    this.channel.reset();
  },

  /* jshint -W071 */
  print: function(options){
    var template = this.template(options),
        iframe = this.init();

    this.deferred = $.Deferred();

    // insert template
    iframe.document.write(template);

    // print events for IE 5+ & Firefox 6+
    iframe.onbeforeprint = this.beforePrint;
    iframe.onafterprint = this.afterPrint;

    // print once loaded
    var loaded = function(){
      iframe.focus(); // required for IE
      iframe.print();
    };

    // get the first image, ie: logo
    var logo = iframe.document.getElementsByTagName('img')[0];

    if( logo ){
      logo.onload = loaded;
    } else {
      loaded();
    }

    return this.deferred;
  },
  /* jshint +W071 */

  /**
   * creates an iframe and stores reference
   * returns a reference to the iframe window
   */
  init: function(){
    if(this.iframe){
      this.iframe.remove();
    }

    this.iframe = $('<iframe>')
      .attr('name', 'iframe')
      .css({visibility:'hidden',position:'-fixed',right:'0',bottom:'0'})
      .appendTo('body');

    // print events for Chrome 9+ & Safari 5.1+
    if (frames['iframe'].matchMedia) {
      var mediaQueryList = frames['iframe'].matchMedia('print');
      mediaQueryList.addListener(this.mediaQueryListener);
    }

    return frames['iframe'];
  },

  mediaQueryListener: function(mql){
    if (mql.matches) {
      this.beforePrint();
    } else {
      // delay fixes weird behavior
      // mediaQueryList seems to trigger both events on init
      _.delay(this.afterPrint);
    }
  },

  beforePrint: function(){
    debug('printing ...');
  },

  afterPrint: function(){
    this.iframe.remove();
    this.iframe = undefined;
    debug('printing finished');
    this.deferred.resolve();
  },

  /* jshint -W074 */
  /* todo: refactor print service with view */
  template: function(options){
    options = options || {};

    if(!options.model){
      return;
    }

    var template = hbs.compile( $('#tmpl-print-receipt').html() );
    var tax = Radio.request('entities', 'get', {
        type: 'option',
        name: 'tax'
      }) || {};
    var data = POS.ReceiptView.prototype.prepare(options.model.toJSON(), tax);
    return template( data );
  }
  /* jshint +W074 */

});