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

        initialize: function( options ) {
            this.settingsCollection = options.col || {};
            this.template = _.template( $('#tmpl-wc-pos-settings-' + options.tab ).html() );
        },

        ui: {
            submit  : 'input[type="submit"]',
            id      : 'input[name="id"]'
        },

        events: {
            'click @ui.submit': 'onSubmit'
        },

        behaviors: {
            Select2: {},
            Tooltip: {},
            Sortable: {}
        },

        onBeforeShow: function() {
            var id = this.ui.id.val();
            this.model = this.settingsCollection.get(id);
            if( !_.isUndefined( this.model ) ) {
                Backbone.Syphon.deserialize( this, this.model.toJSON() );
            }

            this.listenTo( this.model, 'request change:response', this.saving );
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
            return this.settingsCollection.add( data, { merge: true } );
        },

        saving: function(e) {
            if( _( e.changed ).isEmpty() ) {
                this.ui.submit
                    .prop( 'disabled', true )
                    .next( 'p.response' )
                    .html( '<i class="spinner"></i>' );
            } else {
                var response = this.model.get('response');
                var success = response.result == 'success' ? 'yes' : 'no';
                this.ui.submit
                    .prop( 'disabled', false)
                    .next( 'p.response' )
                    .html( '<i class="dashicons dashicons-' + success + '"></i>' + response.notice );
            }
            this.model.unset( 'response', { silent: true } );
        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);