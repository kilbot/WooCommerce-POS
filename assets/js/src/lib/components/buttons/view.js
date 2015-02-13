var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Radio = require('backbone.radio');
var _ = require('lodash');
var $ = require('jquery');
var tmpl = require('./buttons.hbs');
var polyglot = require('lib/utilities/polyglot');

module.exports = ItemView.extend({
  template: hbs.compile(tmpl),

  initialize: function(options){
    options = options || {};

    var defaults = {
      buttons: [{
        action    : 'save',
        className : 'btn-primary',
        label     : polyglot.t('buttons.save')
      }],
      msgPos: 'left'
    };

    if(options.show === false){
      this.$el.hide();
    }

    this.data = _.defaults(options, defaults);
  },

  templateHelpers: function(){
    this.data.positionLeft = (this.data.msgPos === 'left');

    _.each(this.data.buttons, function(button){
      if(!button.label){
        button.label = polyglot.t('buttons.' + button.action);
      }
    }, this);

    return this.data;
  },

  ui: {
    buttons : '*[data-action]',
    message: '.message'
  },

  events: {
    'click @ui.buttons': 'onButtonClick'
  },

  onButtonClick: function(e){
    e.preventDefault();
    var action = $(e.target).data('action');
    this.trigger('action:' + action);
  },

  onUpdate: function(options){
    options = options || {};

    _.each(options, function(attr, key){
      var method = $.camelCase('update-' + key);
      if(this[method]){
        this[method](attr);
      }
    }, this);

    this.render();
  },

  updateShow: function(toggle){
    this.$el.show(toggle);
  },

  updateMessage: function(options){
    var obj = this.messageObject(options);

    if(options === 'spinner'){
      obj.type = obj.text = undefined;
    }

    this.disableButtons(options === 'spinner');
    this.data.message = obj;
  },

  messageObject: function(message){
    var obj = message;
    if( _.isString(obj) ){
      obj = {};
      obj.type = message;
      obj.text = polyglot.t('messages.' + message);
    }
    obj.icon = obj.icon || obj.type;
    return obj;
  },

  updateButtons: function(buttons){
    _.each(buttons, function(button){
      this.disableButtons(button.disable, button.action);
    }, this);
  },

  disableButtons: function(toggle, action){
    _.each(this.data.buttons, function(button){
      if(!action || button.action === action){
        button.disabled = toggle;
      }
    });
  }

});