var _ = require('lodash');
var $ = require('jquery');
var debug = require('debug')('browserPrint');
var Mn = require('backbone.marionette');

module.exports = function(view){
  var promise;

  /**
   * Note: iframe won't be 'real' until it's added to the page
   * If iframe has not been rendered, eg: for preview,
   * we need to create a hidden div and render before printing
   */
  var beforePrint = function(){
    var div = $('<div>')
      .css({visibility:'hidden',position:'absolute',right:'100%',bottom:'100%'})
      .appendTo('body');

    view.region = new Mn.Region({
      el: div
    });

    view.region.show(view);
  };

  /**
   * clear region and remove hidden div after printing is complete
   */
  var afterPrint = function(){
    if(view.region){
      view.region.empty();
      view.region.stopListening();
      view.region.el.remove();
    }
  };

  /**
   *
   */
  var mediaQueryListener = function(mql){
    if (mql.matches) {
      debug('printing ...');
    } else {
      // delay fixes weird behavior
      _.delay(afterPrint);
      debug('printing finished');
      promise.resolve();
    }
  };

  /**
   * The print function
   */
  /* jshint -W071 */
  view.print = function(){
    var imgs, count, self = this;
    promise = new $.Deferred();

    // make sure iframe is in the DOM
    if(!this.el.contentWindow){
      beforePrint();
    }

    if(this.el.contentWindow.matchMedia){
      var mediaQueryList = this.el.contentWindow.matchMedia('print');
      mediaQueryList.addListener(mediaQueryListener);
    }

    // check images
    imgs = this.$el.contents().find('img');
    count = imgs.length;

    // no images, early exit
    if(count === 0){
      this.el.contentWindow.print();
      return promise;
    }

    debug('loading images');

    // make sure each image has loaded
    imgs.one('load', function(){
      count--;
      if( count === 0 ) {
        self.el.contentWindow.print();
      }
      if(!self.el.contentWindow.matchMedia){
        // printing done (as far as we know)
        promise.resolve();
      }
    }).each(function() {
      if(this.complete) {
        $(this).trigger('load');
      }
    });

    return promise;
  };
  /* jshint +W071 */

  return view;
};