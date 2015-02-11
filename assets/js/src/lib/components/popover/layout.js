var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');
require('bootstrap-sass/assets/javascripts/bootstrap/popover');

module.exports = LayoutView.extend({

  template: _.template('' +
    '<div class="arrow"></div>' +
    '<h1 class="popover-title"></h1>' +
    '<div class="popover-region"></div>'
  ),
  _className: 'popover',
  className: function() {
    console.log('called now');
    return this._className;
  },
  attributes: {
    'role' : 'tooltip'
  },

  regions: {
    content : '.popover-region'
  },

  initialize: function(options){
    options = options || {};
    this.target = options.target;
    this.view = options.view;
    this.render().setup(options);

    _.bindAll(this, 'open', 'close', 'show', 'shown', 'hide', 'hidden');

    this.target.on({
      'show.bs.popover'   : this.show,
      'shown.bs.popover'  : this.shown,
      'hide.bs.popover'   : this.hide,
      'hidden.bs.popover' : this.hidden
    });
  },

  setup: function(options){
    _.defaults(options, {
      container : 'body',
      content   : ' ',
      delay     : 0,
      placement : 'auto right',
      template  : this.el,
      title     : '',
      trigger   : 'manual'
    });
    this.target.popover(options);
  },

  open: function(){
    this.target.popover('show');
  },

  close: function(e){
    if(e && $(e.target).is('.popover *, .popover')){ return; }
    this.target.popover('hide');
  },

  show: function(){
    this.content.show(this.view);
  },

  shown: function(){
    $('body').on('click', this.close);
  },

  hide: function(){
    $('body').off('click');
  },

  hidden: function(){
    this.target.off({
      'show.bs.popover'   : this.show,
      'shown.bs.popover'  : this.shown,
      'hide.bs.popover'   : this.hide,
      'hidden.bs.popover' : this.hidden
    });
    this.destroy();
    this.target.popover('destroy');
  }

});