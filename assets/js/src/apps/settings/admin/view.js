var POS = (function(App, Backbone, Marionette, $, _) {

    App.SettingsApp.Views = {};

    App.SettingsApp.Views.Tabs = Marionette.ItemView.extend({
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
            if( tab.hasClass('nav-tab-active') )
                return;

            this.trigger( 'settings:tab:clicked', tab.data('tab') );
            tab.addClass('nav-tab-active')
                .siblings('a.nav-tab-active')
                .removeClass('nav-tab-active');
        }
    });

    App.SettingsApp.Views.Settings = Marionette.ItemView.extend({
        tagName: 'form',

        initialize: function() {
            this.template = _.template( $('#tmpl-wc-pos-settings-' + this.model.id ).html() );
            this.listenTo( this.model, 'request', this.saving );
            this.listenTo( this.model, 'change:response', this.saved );
        },

        ui: {
            submit  : 'input[type="submit"]',
            id      : 'input[name="id"]'
        },

        events: {
            'click @ui.submit': 'onSubmit',
            'click a.wc-pos-modal': 'openModal'
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
            this.trigger( 'settings:form:submit', this.storeState() );
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
            var success = response.result == 'success' ? 'yes' : 'no';
            this.ui.submit
                .prop( 'disabled', false)
                .next( 'p.response' )
                .html( '<i class="dashicons dashicons-' + success + '"></i>' + response.notice );

            this.model.unset( 'response', { silent: true } );
        },

        openModal: function(e) {
            e.preventDefault();
            new App.SettingsApp.Views.Modal();
        }

    });

    App.SettingsApp.Views.Modal =  Marionette.ItemView.extend({
        template: _.template( $('#tmpl-wc-pos-modal').html() ),

        behaviors: {
            Modal: {},
            Tooltip: {}
        },

        initialize: function (options) {
            this.trigger('modal:open');
        },

        serializeData: function() {
            var data = { title: 'Hello World' };
            return data;
        },

        events: {
            'click .save' : 'save',
            'click .close' : 'cancel'
        },

        save: function() {

        },

        cancel: function () {
            this.trigger('modal:close');
        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);