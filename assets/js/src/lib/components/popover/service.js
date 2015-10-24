var Service = require('lib/config/service');
var Drop = require('tether-drop');
var $ = require('jquery');
var _ = require('lodash');
var Mn = require('backbone.marionette');
var App = require('lib/config/application');

var _Drop = Drop.createContext({
  classPrefix: App.prototype.namespace('popover')
});

module.exports = Service.extend({
  channelName: 'popover',

  initialize: function(){

    this.channel.reply({
      'open' : this.open,
      'close' : this.close
    }, this);

    _.bindAll(this, 'onClick');

  },

  open: function(options) {

    // close any open popovers
    this.close();

    // createContext defaults not working?
    _.defaults(options, {
      content   : '',
      position  : 'bottom center',
      classes   : 'popover-theme-arrows',
      openOn    : undefined // manual trigger
    });

    // new Drop instance
    this.drop = new _Drop(options);

    // attach region
    this.drop.region = new Mn.Region({
      el: this.drop.content
    });

    // listeners
    $(document).on('click', this.onClick);
    options.view.on('show', this.drop.open, this.drop);

    // show
    this.drop.region.show(options.view);

  },

  close: function(){
    if( this.drop ){
      this.drop.region.empty();
      this.drop.destroy();
      this.drop = undefined;
      $(document).off('click', this.onClick);
    }
  },

  onClick: function(e){
    if( e.target === this.drop.target ||
      $(e.target).closest('.popover').length ){
      return;
    }

    this.close();
  }

});