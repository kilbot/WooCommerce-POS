var ReceiptView = require('lib/config/receipt-view');
var hbs = require('handlebars');
var Mn = require('backbone.marionette');
var debug = require('debug')('printHTML');
var $ = require('jquery');
var _ = require('lodash');

module.exports = ReceiptView.extend({

  tagName: 'iframe',

  template: function(){},

  onShow: function(){
    var template = hbs.compile( this.options._template );
    this.el.contentWindow.document.write(template( this.data ));

    // use matchMedia (if available)
    if(!this.el.contentWindow.matchMedia){
      return;
    }

    _.bindAll(this, 'mediaQueryListener', 'afterPrint');
    var mediaQueryList = this.el.contentWindow.matchMedia('print');
    mediaQueryList.addListener(this.mediaQueryListener);
  },

  mediaQueryListener: function(mql){
    if (mql.matches) {
      debug('printing ...');
    } else {
      // delay fixes weird behavior
      _.delay(this.afterPrint);
    }
  },

  /* jshint -W071 */
  print: function(){
    var imgs, count, self = this;

    // make sure iframe is in the DOM
    if(!this.el.contentWindow){
      this.beforePrint();
    }

    // check images
    imgs = this.$el.contents().find('img');
    count = imgs.length;

    // no images, early exit
    if(count === 0){
      return this.el.contentWindow.print();
    }

    debug('loading images');

    // make sure each image has loaded
    imgs.one('load', function(){
      count--;
      if( count === 0 ) {
        self.el.contentWindow.print();
      }
    }).each(function() {
      if(this.complete) {
        $(this).load();
      }
    });
  },
  /* jshint +W071 */

  /**
   * Note: iframe won't be 'real' until it's added to the page
   * If iframe has not been rendered, eg: for preview,
   * we need to create a hidden div and render before printing
   */
  beforePrint: function(){
    var div = $('<div>')
      .css({visibility:'hidden',position:'absolute',right:'100%',bottom:'100%'})
      .appendTo('body');

    this.region = new Mn.Region({
      el: div
    });

    this.region.show(this);
  },

  /**
   * clear region and remove hidden div after printing is complete
   */
  afterPrint: function(){
    debug('printing finished');
    this.region.empty();
    this.region.stopListening();
    this.region.el.remove();
  }

});