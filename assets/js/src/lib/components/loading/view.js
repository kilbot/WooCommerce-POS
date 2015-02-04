var ItemView = require('lib/config/item-view');
var _ = require('lodash');
var POS = require('lib/utilities/global');

var View = ItemView.extend({
  className: 'loading',

  initialize: function () {
    this.on('update:message', this.render);
    this.timeout = setTimeout(_.bind(this.fail, this), 60000);
  },

  render: function () {
    var message = '';
    if (!_.isEmpty(this.options.message)) {
      message = '<p>' + this.options.message + '</p>';
    }
    this.$el.html('<p><i class="icon icon-spinner icon-lg"></i></p>' + message);
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
    this.$('.icon').removeClass('icon-spinner').addClass('icon-fail');
  }

});

module.exports = View;
POS.attach('Components.Loading.View', View);