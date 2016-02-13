var Service = require('lib/config/service');
var TetherDrop = require('tether-drop');
var $ = require('jquery');
var _ = require('lodash');
var Mn = require('backbone.marionette');
var App = require('lib/config/application');
var namespace = App.prototype.namespace('popover');

var Drop = TetherDrop.createContext({
  classPrefix: namespace
});

var defaults = {
  position: 'bottom center',
  openOn: undefined, // manual trigger
  classes: namespace + '-theme-arrows',
  constrainToWindow: true,
  constrainToScrollParent: false
};

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
    options = _.extend({}, defaults, options);

    // close any open popovers
    this.close();

    // new Drop instance
    this.drop = new Drop(options);

    // attach region
    this.drop.region = new Mn.Region({
      el: this.drop.content
    });

    // listeners
    $(document).on('click', this.onClick);
    options.view.on('show', this.drop.open, this.drop);

    // show
    this.drop.region.show(options.view);

    // return the drop instance
    return this.drop;
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