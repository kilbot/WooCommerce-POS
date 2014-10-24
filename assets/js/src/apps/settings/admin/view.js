var POS = (function(App, Backbone, Marionette, $, _) {

    App.SettingsApp.Views = {};

    App.SettingsApp.Views.Tabs = Marionette.ItemView.extend({
        el: '#wc-pos-settings-tabs',

        initialize: function() {
            this.$('a.nav-tab').first().addClass('nav-tab-active');
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
        saving: false,

        initialize: function( options ) {
            this.settingsCollection = options.col || {};
            this.template = _.template( $('#tmpl-wc-pos-settings-' + options.tab ).html() );
        },

        onBeforeShow: function() {
            var id = this.$('input[name="key"]').val();
            var model = this.settingsCollection.get(id);
            if( model ) {
                Backbone.Syphon.deserialize( this, model.toJSON() );
            } else {
                this.storeState();
            }
        },

        onBeforeDestroy: function() {
            this.storeState();
        },

        events: {
            'click input[type=submit]': 'onSubmit'
        },

        onSubmit: function() {
            var data = this.storeState();
            this.trigger( 'settings:form:submit', data );
        },

        storeState: function() {
            var data = Backbone.Syphon.serialize( this );
            this.settingsCollection.add( data, { merge: true } );
            return data;
        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);