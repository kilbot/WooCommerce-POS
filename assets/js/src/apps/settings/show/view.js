POS.module('SettingsApp.Show', function(Show, POS, Backbone, Marionette, $, _) {

    Show.Tabs = Marionette.ItemView.extend({
        el: '#wc-pos-settings-tabs',

        initialize: function( options ) {
            this.$('a[data-tab="' + options.tab + '"]').addClass('nav-tab-active');
        },

        events: {
            'click a' : 'onTabClicked'
        },

        onTabClicked: function(e) {
            e.preventDefault();
            var tab = $(e.target);
            if( tab.hasClass('nav-tab-active') ) {
                return;
            }

            this.trigger( 'settings:tab:clicked', tab.data('tab') );
            tab.addClass('nav-tab-active')
                .siblings('a.nav-tab-active')
                .removeClass('nav-tab-active');
        }
    });

    Show.Settings = Marionette.ItemView.extend({
        tagName: 'form',

        initialize: function() {
            this.template = _.template( $('#tmpl-wc-pos-settings-' + this.model.id ).html() );
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
            Select2: {},
            Tooltip: {},
            Sortable: {}
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
                .html( '<i class="dashicons dashicons-' + success + '"></i>' + response.notice );

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

            new Show.GatewaySettingsModal({
                model: this.collection.get( id )
            });
        },

        translationUpdate: function(e) {
            e.preventDefault();
            var title = $(e.target).parent('td').prev('th').html();

            new Show.TranslationUpdateModal({
                model: new Backbone.Model({
                    title: title
                })
            });
        }

    });

    Show.GatewaySettingsModal =  Marionette.ItemView.extend({
        template: _.template( $('#tmpl-gateway-settings-modal').html() ),

        behaviors: {
            Modal: {},
            Tooltip: {}
        },

        initialize: function (options) {
            this.trigger('modal:open');
        },

        modelEvents: {
            'change': 'render'
        },

        events: {
            'click .save' : 'save',
            'click .close' : 'cancel'
        },

        onBeforeShow: function() {
            Backbone.Syphon.deserialize( this, this.model.toJSON() );
        },

        save: function() {
            var data = Backbone.Syphon.serialize( this );
            this.model.set( data );
            this.model.save();
        },

        cancel: function () {
            this.trigger('modal:close');
        }

    });

    Show.TranslationUpdateModal =  Marionette.ItemView.extend({
        template: _.template( $('#tmpl-translation-update-modal').html() ),

        behaviors: {
            Modal: {}
        },

        initialize: function (options) {
            this.trigger('modal:open');
            this.initUpdate();
        },

        events: {
            'click .close' : 'cancel'
        },

        cancel: function () {
            this.trigger('modal:close');
        },

        initUpdate: function() {
            var view = this;
            var stream = new EventSource( POS.ajaxurl + '?action=wc_pos_update_translations&security=' + POS.nonce );
            stream.onmessage = function(e){
                if( e.data === 'complete' ){
                    this.close();
                    view.$('.modal-body .spinner').hide();
                    view.$('.modal-footer').show();
                } else {
                    view.$('.modal-body .spinner').before('<p>' + e.data + '</p>');
                }
            };
        }

    });

});