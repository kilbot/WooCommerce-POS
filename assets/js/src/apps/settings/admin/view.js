POS.module('SettingsApp.Admin.View', function(View, POS, Backbone, Marionette, $, _){

    View.Tabs = Marionette.ItemView.extend({
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

    View.Settings = Marionette.ItemView.extend({
        initialize: function( options ) {
            var tab = options.tab || 'general';
            this.template = _.template( $('#tmpl-wc-pos-settings-' + tab ).html() );
        }
    });

});