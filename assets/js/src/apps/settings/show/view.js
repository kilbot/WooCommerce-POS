var ItemView = require('lib/config/item-view');
var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');
var GatewaySettingsModal = ('../modals/gateway-settings');
var TranslationUpdateModal = ('../modals/translation-update');

module.exports = ItemView.extend({
  tagName: 'form',

  initialize: function() {
    this.template = _.template( $('#tmpl-wc-pos-settings-' +
      this.model.id ).html() );
    this.listenTo( this.model, 'update:start', this.saving );
    this.listenTo( this.model, 'update:stop', this.saved );
  },

  ui: {
    submit  : 'input[type="submit"]',
    id      : 'input[name="id"]'
  },

  events: {
    'click @ui.submit': 'onSubmit',
    'mouseenter a.wc-pos-modal': 'proLoadSettings',
    'click a.wc-pos-modal': 'openModal',
    'click a.action-translation': 'translationUpdate'
  },

  behaviors: {
    Select2: {
      behaviorClass: require('lib/components/select2/behavior')
    },
    Tooltip: {
      behaviorClass: require('lib/components/tooltip/behavior')
    },
    Sortable: {
      behaviorClass: require('lib/components/sortable/behavior')
    }
  },

  onBeforeShow: function() {
    Backbone.Syphon.deserialize( this, this.model.toJSON() );
  },

  onBeforeDestroy: function() {
    this.storeState();
  },

  onSubmit: function(e) {
    e.preventDefault();
    this.storeState().save();
  },

  storeState: function() {
    var data = Backbone.Syphon.serialize( this );
    return this.model.set( data );
  },

  saving: function() {
    this.ui.submit
      .prop( 'disabled', true )
      .next( 'p.response' )
      .html( '<i class="spinner"></i>' );
  },

  saved: function() {
    var response = this.model.get('response');
    var success = response.result === 'success' ? 'yes' : 'no';
    this.ui.submit
      .prop( 'disabled', false)
      .next( 'p.response' )
      .html( '' +
        '<i class="dashicons dashicons-' + success + '"></i>' +
        response.notice
      );

    this.model.unset( 'response', { silent: true } );
  },

  proLoadSettings: function(e) {
    var id = 'gateway_' + $(e.target).data('gateway');

    if( _.isUndefined( this.collection.get( id ) ) ) {
      var modalModel = this.collection.add({
        id: id,
        security: this.model.get('security'),
        title: 'Loading ...'
      });
      modalModel.fetch();
    }
  },

  openModal: function(e) {
    e.preventDefault();
    var id = 'gateway_' + $(e.target).data('gateway');

    new GatewaySettingsModal({
      model: this.collection.get( id )
    });
  },

  translationUpdate: function(e) {
    e.preventDefault();
    var title = $(e.target).parent('td').prev('th').html();

    new TranslationUpdateModal({
      model: new Backbone.Model({
        title: title
      })
    });
  }

});