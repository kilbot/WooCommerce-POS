var ItemView = require('lib/config/item-view');
var _ = require('lodash');
var App = require('lib/config/application');

var View = ItemView.extend({
  className: 'loading',
  iconPrefix: 'icon-',

  initialize: function () {
    this.on('update:message', this.render);
    this.timeout = setTimeout(_.bind(this.fail, this), 60000);
    // test for wp-admin
    if(window.adminpage){
      this.iconPrefix = 'wc_pos-icon-';
    }
  },

  render: function () {
    var message = '';
    if (!_.isEmpty(this.options.message)) {
      message = '<p>' + this.options.message + '</p>';
    }
    this.$el.html('<p>' + this.icon() + '</p>' + message);
    return this;
  },

  onBeforeDestroy: function () {
    clearTimeout(this.timeout);
  },

  /**
   * Loading fail. Will automatically get called after 60s
   * @param message
   */
  fail: function (message) {
    if (message) {
      this.options.message = message;
    } else {
      this.options.message = 'Script Error';
    }
    this.render();
    this.$('i').removeClass('icon-spinner').addClass('icon-fail');
  },

  icon: function(){
    return '<i class="' +
      this.iconPrefix + 'spinner ' +
      this.iconPrefix + 'lg"></i>';
  }

});

module.exports = View;
App.prototype.set('Components.Loading.View', View);