var Behavior = require('lib/config/behavior');
var $ = require('jquery');
var _ = require('lodash');
var TetherDrop = require('tether-drop');
var App = require('lib/config/application');
var namespace = App.prototype.namespace('dropdown');

var Drop = TetherDrop.createContext({
  classPrefix: namespace
});

var defaults = {
  position: 'bottom left',
  openOn: 'click',
  classes: namespace + '-theme-basic',
  remove: true
};

var Dropdown = Behavior.extend({

  _initialized: [],

  initialize: function(options){
    this.options = _.extend({}, defaults, options);

    _.bindAll(this, 'onOpen', 'onClose', 'onSelect', 'onKeydown');

    // define ui
    this.ui = {
      target: '*[data-toggle="' + namespace + '"]'
    };
  },

  events: {
    'click @ui.target': 'onClick'
  },

  onBeforeRender: function(){
    // close open dropdowns on re-render
    this.close();
  },

  onClick: function(e){
    e.preventDefault();
    var target = e.currentTarget;

    if(this._initialized.indexOf(target) !== -1) {
      return;
    }

    var drop = this.initDrop(target);
    this._initialized.push(target);

    // first open
    drop.open();
  },

  initDrop: function(target){

    // default is .dropdown-list
    var content = this.view.dropdownContent || this.view.$('.dropdown-list')[0];

    // drop instance
    var options = _.extend({}, this.options, {
      target  : target,
      content : content
    });
    this.drop = new Drop(options);

    // drop events
    this.drop.on('open', this.onOpen);
    this.drop.on('close', this.onClose);
    $('li', this.drop.content).on('click', this.onSelect);
    $(target).on('keydown', this.onKeydown);

    return this.drop;

  },

  open: function(){
    if(this.drop){
      this.drop.open();
    }
  },

  close: function(){
    if(this.drop){
      this.drop.close();
    }
  },

  onOpen: function(){
    this.view.triggerMethod('dropdown:open');
  },

  onClose: function(){
    this.view.triggerMethod('dropdown:close');
  },

  onSelect: function(e){
    this.view.triggerMethod('dropdown:select', e);
    this.close();
  },

  onKeydown: function(e){

    // esc
    if(e.which === 27){
      return this.close();
    }

    // pass keypress if open
    if( this.drop.isOpened() ){
      return this.view.triggerMethod('target:keydown', e);
    }

    this.open();

  }

});

module.exports = Dropdown;
App.prototype.set('Behaviors.Dropdown', Dropdown);