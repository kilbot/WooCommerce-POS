var FormView = require('lib/config/form-view');
var _ = require('lodash');
var $ = require('jquery');
var Backbone = require('backbone');
var POS = require('lib/utilities/global');
var GatewaySettingsModal = ('../modals/gateway-settings');
var TranslationUpdateModal = ('../modals/translation-update');
var Select2 = require('lib/components/select2/behavior');
var Tooltip = require('lib/components/tooltip/behavior');
var Sortable = require('lib/components/sortable/behavior');
var CustomerSelect = require('lib/components/customer-select/view');

var View = FormView.extend({
  //tagName: 'form',

  initialize: function() {
    var id = this.model.id;
    this.template = function(){
      return $('script[data-id="' + id + '"]').html();
    };
    this.listenTo( this.model, 'update:start', this.saving );
    this.listenTo( this.model, 'update:stop', this.saved );
  },

  onRender: function(){
    this.getComponents();
    var self = this;
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });
  },

  // special case for customer select component
  getComponents: function(){
    var el = this.$('*[data-component="customer-select"]');
    if(el.length){
      var view = new CustomerSelect();
      view.render();
      el.append(view);
    }
  },

  ui: {
    submit : '*[data-action="save"]'
  },

  events: {
    'click @ui.submit': 'onSubmit'
    //'mouseenter a.wc-pos-modal': 'proLoadSettings',
    //'click a.wc-pos-modal': 'openModal',
    //'click a.action-translation': 'translationUpdate'
  },

  behaviors: {
    Select2: {
      behaviorClass: Select2
    },
    Tooltip: {
      behaviorClass: Tooltip
    },
    Sortable: {
      behaviorClass: Sortable
    }
  },

  //onBeforeShow: function() {
  //  //Backbone.Syphon.deserialize( this, this.model.toJSON() );
  //},
  //
  //onBeforeDestroy: function() {
  //  this.storeState();
  //},
  //
  onSubmit: function(e) {
    e.preventDefault();
    this.model.save();
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
  //
  //proLoadSettings: function(e) {
  //  var id = 'gateway_' + $(e.target).data('gateway');
  //
  //  if( _.isUndefined( this.collection.get( id ) ) ) {
  //    var modalModel = this.collection.add({
  //      id: id,
  //      security: this.model.get('security'),
  //      title: 'Loading ...'
  //    });
  //    modalModel.fetch();
  //  }
  //},
  //
  //openModal: function(e) {
  //  e.preventDefault();
  //  var id = 'gateway_' + $(e.target).data('gateway');
  //
  //  new GatewaySettingsModal({
  //    model: this.collection.get( id )
  //  });
  //},
  //
  //translationUpdate: function(e) {
  //  e.preventDefault();
  //  var title = $(e.target).parent('td').prev('th').html();
  //
  //  new TranslationUpdateModal({
  //    model: new Backbone.Model({
  //      title: title
  //    })
  //  });
  //}

});

module.exports = View;
POS.attach('SettingsApp.View');