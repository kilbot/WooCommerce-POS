var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
var $ = require('jquery');

var Buttons = Behavior.extend({

  initialize: function(options){
    options = options || {};
    if(options.modal){
      this.listenTo(this.view.content, 'before:show', function(view){
        this.view.model = view.model;
      });
    }
  },

  ui: {
    submit : '*[data-action="save"]'
  },

  events: {
    'click @ui.submit': 'onSubmit'
  },

  modelEvents: {
    'update:start': 'saving',
    'update:stop' : 'saved'
  },

  onSubmit: function(e) {
    e.preventDefault();
    this.view.model.save();
  },

  saving: function() {
    this.ui.submit
      .prop( 'disabled', true )
      .next( 'p.response' )
      .html( '<i class="spinner"></i>' );
  },

  saved: function() {
    var response = this.view.model.get('response');
    var success = response.result === 'success' ? 'yes' : 'no';
    this.ui.submit
      .prop( 'disabled', false)
      .next( 'p.response' )
      .html( '' +
      '<i class="dashicons dashicons-' + success + '"></i>' +
      response.notice
    );

    this.view.model.unset( 'response', { silent: true } );
  }

});

module.exports = Buttons;
POS.attach('Components.Buttons.Behavior', Buttons);